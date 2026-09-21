import time
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.clients import azure_openai
from app.core.config import settings
from app.services.rag_service import search_relevant_context
from app.services.workflow_engine import execute_consultai_workflow

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: Optional[str] = ""
    timestamp: Optional[str] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = None
    duration: Optional[str] = None

class ChatRequest(BaseModel):
    conversation_id: str
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    conversation_id: str
    role: str = "assistant"
    answer: str
    explanation: str
    sources: List[Dict[str, Any]]
    duration: str
    timestamp: str
    workflow: Dict[str, Any]

@router.post("", response_model=ChatResponse)
async def process_chat(req: ChatRequest):
    start_time = time.time()
    query = req.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Empty query provided.")

    # 1. Search RAG context (search query + fallback to recent conversation topic if follow-up)
    rag_context, sources = search_relevant_context(query)
    
    # If direct query didn't match, check if this is a follow-up query relying on recent conversation
    if not rag_context.strip() and req.history:
        recent_user_msgs = [h.content for h in req.history if h.role == 'user' and h.content]
        if recent_user_msgs:
            augmented_query = f"{recent_user_msgs[-1]} {query}"
            rag_context, sources = search_relevant_context(augmented_query)

    has_context = bool(rag_context.strip())

    if has_context:
        system_prompt = (
            "You are ConsultAI, an elite executive intelligence assistant built with Azure AI Foundry.\n\n"
            "CRITICAL INSTRUCTIONS FOR RETRIEVED CANDIDATE DOCUMENTS:\n"
            "When answering questions related to the Candidate Documents below:\n"
            "1. EXACT FIDELITY & PRECISION: Quote or provide the exact text, figures, values, dates, formulas, and facts verbatim. "
            "Never summarize away crucial details or substitute generic answers.\n"
            "2. EXAM QUESTIONS & MCQs: If the user asks about an exam question (e.g. 'Question 14', 'Question 15', etc.), "
            "provide the FULL question text and ALL available option choices ((a), (b), (c), (d)) verbatim from the document.\n"
            "3. TIMETABLES & SCHEDULES: For class schedules, provide exact time slots (e.g., 09:00 - 10:00), "
            "subject names, room numbers, and faculty.\n"
            "4. SOURCE CITATION: In 'sources_used', list the exact document filename(s) used from Candidate Documents.\n"
            "5. TABLES & COMPARISONS: When the user asks for comparisons, differences, or structured data (e.g. 'in table format'), "
            "ALWAYS output a well-structured GitHub-flavored Markdown table with clear column headers (| Column 1 | Column 2 | ...).\n\n"
            "If the Candidate Documents do not contain the answer or the query is purely conversational/general, "
            "answer normally and set 'sources_used' to [].\n\n"
            "Format your reply strictly as valid JSON with three fields:\n"
            "{\n"
            '  "answer": "Direct, exact answer quoting verbatim facts, options, data, or markdown table",\n'
            '  "explanation": "Detailed explanation, background context, and reasoning from the document.",\n'
            '  "sources_used": ["filename.pdf"]\n'
            "}\n\n"
            f"Candidate Documents:\n{rag_context}"
        )
    else:
        system_prompt = (
            "You are ConsultAI, an elite executive intelligence assistant built with Azure AI Foundry.\n"
            "Provide sharp, executive-ready answers and insights across general inquiries, business strategy, "
            "financial performance, operational excellence, and conversational questions.\n"
            "When the user asks for comparisons, differences, or structured data (e.g. 'in table format'), "
            "ALWAYS provide a well-structured GitHub-flavored Markdown table with clear column headers (| Column 1 | Column 2 | ...).\n"
            "If the user asks follow-up questions, maintain coherent context from prior messages.\n"
            "If the user speaks or requests answers in Hindi/Hinglish or another language, respond fluently in that language.\n"
            "Format your reply strictly as valid JSON with three fields:\n"
            "{\n"
            '  "answer": "A crisp, direct executive conclusion, answer, or markdown table",\n'
            '  "explanation": "Detailed, thorough explanation, actionable reasoning, or context.",\n'
            '  "sources_used": []\n'
            "}"
        )

    # Construct conversation history
    messages_payload = [{"role": "system", "content": system_prompt}]
    for h in (req.history or [])[-6:]:
        # Reconstruct message content if empty
        msg_content = h.content
        if not msg_content:
            if h.answer and h.explanation:
                msg_content = f"{h.answer}\n{h.explanation}"
            elif h.answer:
                msg_content = h.answer
            elif h.explanation:
                msg_content = h.explanation
            else:
                msg_content = ""
        
        # Avoid appending duplicate user query if it's identical to current query at the very end
        role = h.role if h.role in ["user", "assistant", "system"] else "user"
        if msg_content and not (role == "user" and msg_content.strip() == query):
            messages_payload.append({"role": role, "content": msg_content})

    messages_payload.append({"role": "user", "content": query})

    try:
        completion = azure_openai.chat.completions.create(
            model=settings.CHAT_MODEL,
            messages=messages_payload,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        content_raw = completion.choices[0].message.content or "{}"
        parsed = json.loads(content_raw)
        answer = parsed.get("answer", "")
        explanation = parsed.get("explanation", "")
        sources_used = parsed.get("sources_used", [])
        if not answer and not explanation:
            explanation = content_raw
    except Exception as e:
        print(f"Error calling Azure OpenAI: {e}")
        answer = "Strategic evaluation generated."
        explanation = f"Error communicating with AI model: {e}"
        sources_used = []

    # Map sources reliably
    final_sources = []
    if isinstance(sources_used, list) and sources_used:
        for s in sources:
            s_name = s.get("name", "").lower()
            s_clean = s_name.replace(".pdf", "")
            for su in sources_used:
                su_str = str(su).lower()
                if su_str in s_name or s_clean in su_str or s_name in su_str:
                    if s not in final_sources:
                        final_sources.append(s)
                    break

    # Fallback source inclusion if candidate documents were matched with high confidence
    if not final_sources and has_context and sources:
        # Check if the query clearly targets documents or top source similarity is solid
        if sources[0].get("similarity", 0) >= 0.20:
            final_sources.append(sources[0])

    workflow_trace = execute_consultai_workflow(query, bool(final_sources), start_time)
    current_time_str = time.strftime("%I:%M %p")

    return ChatResponse(
        conversation_id=req.conversation_id,
        role="assistant",
        answer=answer,
        explanation=explanation,
        sources=final_sources,
        duration=workflow_trace["total_duration"],
        timestamp=current_time_str,
        workflow=workflow_trace
    )
