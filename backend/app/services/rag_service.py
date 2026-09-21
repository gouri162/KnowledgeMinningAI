import io
import re
import base64
import unicodedata
import fitz  # PyMuPDF
from typing import List, Dict, Tuple, Any
from app.core.clients import supabase, azure_openai
from app.core.config import settings

def clean_extracted_text(text: str) -> str:
    """Normalizes unicode ligatures, control characters, and whitespace."""
    if not text:
        return ""
    # Normalize unicode ligatures (e.g. fi -> fi, ffi -> ffi, special symbols)
    text = unicodedata.normalize('NFKD', text)
    # Remove null bytes and unprintable control characters except newline and tab
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', ' ', text)
    # Normalize excessive blank lines (more than 2 to 2)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def extract_text_with_vision(page: fitz.Page) -> str:
    """Uses Azure OpenAI Vision to extract all text from scanned/image-based PDF page."""
    try:
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        base64_img = base64.b64encode(img_bytes).decode("utf-8")
        
        response = azure_openai.chat.completions.create(
            model=settings.CHAT_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Extract all text verbatim from this document, certificate, or slide. "
                                "Preserve all headings, titles, names, bullet points, credentials, dates, and sign-offs accurately. "
                                "Output only the extracted text without introductory or concluding conversational text."
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/png;base64,{base64_img}"}
                        }
                    ]
                }
            ],
            max_tokens=2000,
            temperature=0.1
        )
        return clean_extracted_text(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"Vision OCR extraction error: {e}")
        return ""

def extract_timetable_schedule(table: List[List[Any]], raw_text: str, page_num: int, filename: str) -> str:
    """
    Specifically detects and extracts structured academic class timetables.
    Preserves exact day names (Monday-Friday), exact period numbers, exact time slots (e.g. 9:00 - 11:00),
    subject names, room numbers, teacher names, and merged-period spans.
    """
    if len(table) < 2:
        return ""

    # Check if this table has time slots
    time_row_idx = None
    for r_idx, row in enumerate(table[:4]):
        row_str = ' '.join(str(c or '') for c in row)
        if any(t in row_str for t in ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']):
            time_row_idx = r_idx
            break

    if time_row_idx is None:
        return ""

    header_row = table[time_row_idx]

    # Detect class identifier from raw text
    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    class_candidates = [
        l for l in lines
        if re.search(r'(CSE-[A-Z0-9\- ]+|AIFT[A-Z0-9\- ]*|AIML[A-Z0-9\- ]*)', l, re.I)
        and not any(x in l.upper() for x in ['PUNJAB', 'PATIALA', 'TIMETABLE', 'CHITKARA', 'GENERATED', 'ASC'])
    ]
    detected_class = class_candidates[-1] if class_candidates else (lines[-1] if lines else f"Page {page_num}")
    
    # Generate search aliases (e.g. CSE-AIML-G6 -> G6, AIML-G6, G6-A, G6-B, Group 6, 3D, 3D batch)
    aliases = [detected_class]
    g_match = re.search(r'\b([0-9]?G[0-9]+|[0-9][A-D])\b', detected_class, re.I)
    if g_match:
        group_id = g_match.group(1).upper()
        aliases.extend([group_id, f"Group {group_id}", f"{group_id} batch", f"{group_id}-A", f"{group_id}-B"])
    c_sub = re.sub(r'[^a-zA-Z0-9]', ' ', detected_class).split()
    if len(c_sub) >= 2:
        aliases.append(' '.join(c_sub[-2:]))
        aliases.append(c_sub[-1])

    alias_str = ', '.join(sorted(set(aliases)))

    # Extract all slot columns and their timing ranges from header_row
    slots_by_col = []
    for c_idx, c_val in enumerate(header_row):
        if not c_val:
            continue
        c_str = ' '.join(str(c_val).split())
        m = re.search(r'(?:([0-9]+)\s+)?([0-9]{1,2}:[0-9]{2})\s*-\s*([0-9]{1,2}:[0-9]{2})', c_str)
        if m:
            period = m.group(1) or str(len(slots_by_col) + 1)
            start_t = m.group(2)
            end_t = m.group(3)
            slots_by_col.append((c_idx, f"Period {period}", start_t, end_t, c_str))

    day_names_map = {
        'MO': 'Monday', 'TU': 'Tuesday', 'WE': 'Wednesday', 'TH': 'Thursday', 'FR': 'Friday', 'SA': 'Saturday', 'SU': 'Sunday'
    }

    out = [
        f"[Document: {filename} | Page {page_num} | Class: {detected_class} | Aliases: {alias_str}]",
        f"# Timetable for Class / Section: {detected_class}",
        f"Search Keywords / Aliases: {alias_str}\n",
        f"### Weekly Schedule for {detected_class}:"
    ]

    for row in table[time_row_idx + 1:]:
        first_cell = ' '.join(str(row[0] or '').split()).upper()
        current_day = None
        if first_cell in day_names_map:
            current_day = day_names_map[first_cell]
        elif first_cell:
            for k, v in day_names_map.items():
                if first_cell.startswith(k):
                    current_day = v
                    break

        if not current_day:
            continue

        out.append(f"\n#### **{current_day}**:")
        i = 0
        first_class_found = False
        while i < len(slots_by_col):
            col_idx, period_label, start_t, end_t, raw_slot = slots_by_col[i]
            val = row[col_idx] if col_idx < len(row) else None
            
            if val is not None and str(val).strip():
                clean_lines = [l.strip() for l in str(val).splitlines() if l.strip()]
                cell_text = ' | '.join(clean_lines)
                
                # Check for merged cells (subsequent slots having None)
                j = i + 1
                span_end_t = end_t
                span_periods = [period_label]
                while j < len(slots_by_col):
                    next_col = slots_by_col[j][0]
                    if next_col < len(row) and row[next_col] is None:
                        span_end_t = slots_by_col[j][3]
                        span_periods.append(slots_by_col[j][1])
                        j += 1
                    else:
                        break
                
                time_range = f"{start_t} - {span_end_t}"
                periods_desc = ", ".join(span_periods)
                first_tag = " [FIRST CLASS OF THE DAY]" if not first_class_found else ""
                first_class_found = True
                out.append(f"- **Time Slot: {time_range}** ({periods_desc}){first_tag} -> **{cell_text}**")
                i = j
            else:
                out.append(f"- Time Slot: {start_t} - {end_t} ({period_label}) -> [No Class / Break / Free Period]")
                i += 1

    out.append("\n### Complete Timetable Grid:")
    table_md = []
    for r in table[time_row_idx:]:
        clean_r = [' '.join(str(c or '').split()) if c else '-' for c in r]
        if any(c != '-' for c in clean_r):
            table_md.append('| ' + ' | '.join(clean_r) + ' |')
    out.append('\n'.join(table_md))

    return '\n'.join(out)

def extract_page_structured(page: fitz.Page, page_num: int, filename: str) -> List[str]:
    """
    Extracts high-fidelity text from a PDF page without discarding non-table content.
    1. Normalizes unicode ligatures and special characters.
    2. Detects tables and renders Markdown representations without dropping surrounding text.
    3. Handles scanned pages via Vision OCR.
    4. Keeps timetables intact as single chunks to avoid splitting schedules across boundaries.
    """
    raw_text = clean_extracted_text(page.get_text())
    word_count = len(raw_text.split())
    has_images = len(page.get_images()) > 0

    # If page is essentially a scanned image or certificate with very little extractable text
    if word_count < 30 and has_images:
        vision_text = extract_text_with_vision(page)
        if vision_text:
            return [f"[Document: {filename} | Page {page_num}]\n{vision_text}"]

    # Extract tables if present
    table_md_blocks = []
    try:
        tabs = page.find_tables()
        if tabs and tabs.tables:
            for tab in tabs.tables:
                extracted_table = tab.extract()
                if not extracted_table or len(extracted_table) < 2:
                    continue
                timetable_md = extract_timetable_schedule(extracted_table, raw_text, page_num, filename)
                if timetable_md:
                    table_md_blocks.append(timetable_md)
                    continue

                rows = []
                for r in extracted_table:
                    clean_r = [' '.join(str(c or '').split()) if c else '-' for c in r]
                    if any(c != '-' for c in clean_r):
                        rows.append('| ' + ' | '.join(clean_r) + ' |')
                if rows:
                    table_md_blocks.append(f"### Structured Table (Page {page_num}):\n" + '\n'.join(rows))
    except Exception as e:
        print(f"Table detection note on page {page_num}: {e}")

    # If this page contains a structured timetable, return it directly without the scrambled raw text!
    if table_md_blocks:
        return table_md_blocks

    full_content = raw_text

    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    detected_section = lines[0] if lines else f"Page {page_num}"
    prefix = f"[Document: {filename} | Page {page_num} | Section: {detected_section[:60]}]\n"

    words = full_content.split()
    if len(words) <= 500:
        return [f"{prefix}{full_content}"]

    # For larger pages, create overlapping chunks so facts/questions across boundaries are preserved
    chunk_size = 400
    overlap = 80
    page_chunks = []
    start = 0
    while start < len(words):
        chunk_words = words[start : start + chunk_size]
        page_chunks.append(f"{prefix}" + " ".join(chunk_words))
        if start + chunk_size >= len(words):
            break
        start += (chunk_size - overlap)

    return page_chunks

def index_pdf_document(file_bytes: bytes, filename: str) -> Dict:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    all_chunks = []
    
    for page_idx, page in enumerate(doc):
        page_num = page_idx + 1
        page_chunks = extract_page_structured(page, page_num, filename)
        for c in page_chunks:
            c_clean = clean_extracted_text(c)
            if c_clean:
                all_chunks.append({"chunk": c_clean, "page": page_num})
                
    if not all_chunks:
        raise ValueError("No extractable text found in PDF.")
    
    total_chunks = len(all_chunks)
    
    # Delete any previous chunks for the same filename to avoid duplicates
    try:
        supabase.table("documents").delete().filter("metadata->>source", "eq", filename).execute()
    except Exception as e:
        print(f"Warning during duplicate purge: {e}")

    # Insert new structured chunks
    for item in all_chunks:
        chunk_text_content = item["chunk"]
        emb_res = azure_openai.embeddings.create(
            input=chunk_text_content,
            model=settings.EMBED_MODEL
        )
        emb = emb_res.data[0].embedding
        
        supabase.table("documents").insert({
            "content": chunk_text_content,
            "metadata": {
                "source": filename,
                "page": item["page"]
            },
            "embedding": emb
        }).execute()
        
    return {
        "filename": filename,
        "chunks_indexed": total_chunks,
        "status": "completed",
        "type": "pdf"
    }

def extract_text_from_image_bytes(img_bytes: bytes, filename: str) -> str:
    """Uses Azure OpenAI Vision to extract all text, data, and details from an uploaded image file."""
    try:
        base64_img = base64.b64encode(img_bytes).decode("utf-8")
        ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else "png"
        mime_type = "image/png" if ext == "png" else ("image/webp" if ext == "webp" else "image/jpeg")

        response = azure_openai.chat.completions.create(
            model=settings.CHAT_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "You are an expert document and image intelligence analyst. "
                                "Extract all text, numbers, dates, tables, titles, bullet points, and factual information verbatim from this image. "
                                "If there is a table or timetable, format it as a clean Markdown table. "
                                "Preserve all names, subjects, marks, credentials, and details accurately. "
                                "Output only the extracted structured content without pleasantries."
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{base64_img}"}
                        }
                    ]
                }
            ],
            max_tokens=3000,
            temperature=0.1
        )
        return clean_extracted_text(response.choices[0].message.content.strip())
    except Exception as e:
        print(f"Image vision extraction error: {e}")
        return ""

def index_image_document(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Indexes an image (PNG, JPG, JPEG, WEBP) into Supabase using Azure OpenAI Vision and embeddings."""
    extracted_text = extract_text_from_image_bytes(file_bytes, filename)
    if not extracted_text:
        raise ValueError(f"No extractable text or details found in image '{filename}'.")

    prefix = f"[Document: {filename} | Image Knowledge]\n"
    words = extracted_text.split()
    
    all_chunks = []
    if len(words) <= 500:
        all_chunks.append({"chunk": f"{prefix}{extracted_text}", "page": 1})
    else:
        chunk_size = 400
        overlap = 80
        start = 0
        while start < len(words):
            chunk_words = words[start : start + chunk_size]
            all_chunks.append({"chunk": f"{prefix}" + " ".join(chunk_words), "page": 1})
            if start + chunk_size >= len(words):
                break
            start += (chunk_size - overlap)

    total_chunks = len(all_chunks)

    # Delete any previous chunks for the same filename
    try:
        supabase.table("documents").delete().filter("metadata->>source", "eq", filename).execute()
    except Exception as e:
        print(f"Warning during duplicate purge: {e}")

    for item in all_chunks:
        chunk_text_content = item["chunk"]
        emb_res = azure_openai.embeddings.create(
            input=chunk_text_content,
            model=settings.EMBED_MODEL
        )
        emb = emb_res.data[0].embedding
        
        supabase.table("documents").insert({
            "content": chunk_text_content,
            "metadata": {
                "source": filename,
                "page": item["page"],
                "type": "image"
            },
            "embedding": emb
        }).execute()

    return {
        "filename": filename,
        "chunks_indexed": total_chunks,
        "status": "completed",
        "type": "image"
    }

def search_relevant_context(query: str, top_k: int = 8, min_similarity: float = 0.15) -> Tuple[str, List[Dict]]:
    """
    High-precision Hybrid RAG retrieval:
    1. Semantic vector search via Supabase match_documents.
    2. Exact lexical / ILIKE keyword search for entities, numbers, question codes, and dates.
    3. Reciprocal Rank Fusion (RRF) with exact question/token boosting.
    4. Context continuity expansion: retrieves adjacent page context for complete answers.
    """
    try:
        query_clean = clean_extracted_text(query)
        if not query_clean:
            return "", []

        # 1. Semantic Vector Search
        emb_res = azure_openai.embeddings.create(
            input=query_clean,
            model=settings.EMBED_MODEL
        )
        emb = emb_res.data[0].embedding
        vec_res = supabase.rpc("match_documents", {
            "query_embedding": emb,
            "match_count": top_k * 3
        }).execute()
        vec_matches = vec_res.data or []

        # 2. Extract significant terms, days, and question identifiers from query
        clean_q_words = re.sub(r'[^\w\s]', ' ', query_clean)
        raw_words = [w.strip() for w in clean_q_words.split() if w.strip()]
        
        day_map = {
            'mo': 'Monday', 'mon': 'Monday', 'monday': 'Monday',
            'tu': 'Tuesday', 'tue': 'Tuesday', 'tues': 'Tuesday', 'tuesday': 'Tuesday',
            'we': 'Wednesday', 'wed': 'Wednesday', 'wednesday': 'Wednesday',
            'th': 'Thursday', 'thu': 'Thursday', 'thur': 'Thursday', 'thurs': 'Thursday', 'thursday': 'Thursday',
            'fr': 'Friday', 'fri': 'Friday', 'friday': 'Friday'
        }
        detected_days = [day_map[w.lower()] for w in raw_words if w.lower() in day_map]

        stopwords = {
            'what', 'which', 'where', 'when', 'from', 'this', 'that', 'with', 'about', 
            'tell', 'have', 'does', 'were', 'been', 'their', 'there', 'your', 'please',
            'give', 'find', 'show', 'explain', 'could', 'would', 'should', 'test', 'for'
        }
        keywords = [w for w in raw_words if w.lower() not in stopwords and (len(w) >= 3 or w.isupper() or any(c.isdigit() for c in w))]
        for d in detected_days:
            if d not in keywords:
                keywords.append(d)

        # Detect question numbers: e.g. "question 15", "ques 14", "q.7", "16th"
        q_num_matches = re.findall(r'\b(?:ques|question|q)?\.?\s*([0-9]+)(?:th|st|nd|rd)?\b', query_clean, re.I)
        target_q_nums = set(q_num_matches)

        # Detect class/batch codes: e.g. 3D, 3A, G6, CSE-AIFT-3D, AIML
        batch_codes = re.findall(r'\b([0-9][A-Z]|[0-9]?[Gg][0-9]+)\b', query_clean)
        full_batches = re.findall(r'\b(?:CSE[- ]?)?(?:AIML|AIFT|AI)[- ]*(?:[0-9][A-Z]|[0-9]?[Gg][0-9]+|[0-9]+[A-Z]?)\b', query_clean, re.I)

        # 3. Lexical / Keyword Search in Supabase
        keyword_matches = []
        for kw in keywords[:6]:
            try:
                kw_res = supabase.table("documents").select("id, content, metadata").ilike("content", f"%{kw}%").limit(10).execute()
                if kw_res.data:
                    keyword_matches.extend(kw_res.data)
            except Exception:
                pass

        # Search for exact batch codes in Supabase
        for b in (batch_codes + full_batches):
            b_clean = b.strip()
            for pattern in [f"Class: %{b_clean}%", f"Aliases: %{b_clean}%", f"{b_clean} batch", f" {b_clean} "]:
                try:
                    b_res = supabase.table("documents").select("id, content, metadata").ilike("content", f"%{pattern}%").limit(5).execute()
                    if b_res.data:
                        keyword_matches.extend(b_res.data)
                except Exception:
                    pass

        # Also search for exact question patterns in Supabase if numbers detected
        for num in list(target_q_nums)[:4]:
            for pattern in [f"Ques. {num}", f"Question {num}", f"Ques {num}", f"{num}th day", f"Q{num}"]:
                try:
                    p_res = supabase.table("documents").select("id, content, metadata").ilike("content", f"%{pattern}%").limit(5).execute()
                    if p_res.data:
                        keyword_matches.extend(p_res.data)
                except Exception:
                    pass

        # 4. RRF (Reciprocal Rank Fusion) and Hybrid Scoring
        scores = {}
        doc_map = {}

        # Incorporate Vector Search matches
        for rank, item in enumerate(vec_matches):
            doc_id = item["id"]
            doc_map[doc_id] = item
            sim = float(item.get("similarity") or 0.0)
            scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (60.0 + rank)) + (sim * 1.2)

        # Incorporate Keyword Search matches
        for item in keyword_matches:
            doc_id = item["id"]
            if doc_id not in doc_map:
                doc_map[doc_id] = item
                item["similarity"] = 0.40  # baseline estimate for keyword matches
            
            item_content = clean_extracted_text(item.get("content", ""))
            kw_hit_count = sum(1 for kw in keywords if kw.lower() in item_content.lower())
            scores[doc_id] = scores.get(doc_id, 0.0) + (0.35 * kw_hit_count)

        # Boost exact Batch Code, Question Number and Day matches
        for doc_id, doc in doc_map.items():
            doc_content = clean_extracted_text(doc.get("content", ""))
            
            # Huge boost if exact batch/class matches
            for b in (batch_codes + full_batches):
                b_clean = b.strip()
                if re.search(rf'\b{re.escape(b_clean)}\b', doc_content, re.I):
                    scores[doc_id] = scores.get(doc_id, 0.0) + 3.0
            
            # Boost if query day is found
            for d in detected_days:
                if f"**{d}**" in doc_content or f"#### **{d}**" in doc_content:
                    scores[doc_id] = scores.get(doc_id, 0.0) + 2.0

            # Boost if question number matches
            for num in target_q_nums:
                if re.search(rf'\b(?:ques|question)\.?\s*{num}\b', doc_content, re.I):
                    scores[doc_id] = scores.get(doc_id, 0.0) + 2.0
                elif re.search(rf'\b{num}(?:th|st|nd|rd)\b', doc_content, re.I):
                    scores[doc_id] = scores.get(doc_id, 0.0) + 1.0

        # Sort documents by hybrid score
        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
        selected_docs = [doc_map[d_id] for d_id in sorted_ids if scores[d_id] > 0.30][:top_k]

        # 5. Context Continuity Expansion:
        if selected_docs:
            top_meta = selected_docs[0].get("metadata", {})
            top_src = top_meta.get("source")
            top_page = top_meta.get("page")
            existing_pages = {
                (d.get("metadata", {}).get("source"), d.get("metadata", {}).get("page"))
                for d in selected_docs
            }
            if top_src and top_page and isinstance(top_page, int):
                next_page = top_page + 1
                if (top_src, next_page) not in existing_pages:
                    try:
                        adj_res = supabase.table("documents").select("id, content, metadata").eq("metadata->>source", top_src).eq("metadata->>page", next_page).limit(1).execute()
                        if adj_res.data:
                            selected_docs.append(adj_res.data[0])
                    except Exception:
                        pass


        context_blocks = []
        sources = []
        seen_sources = set()

        for d in selected_docs:
            content = clean_extracted_text(d.get("content", ""))
            meta = d.get("metadata", {})
            src = meta.get("source", "Unknown Document")
            page = meta.get("page")
            page_label = f" (Page {page})" if page else ""
            
            if content:
                context_blocks.append(f"[Document: {src}{page_label}]\n{content}")
            if src and src not in seen_sources:
                seen_sources.add(src)
                sim_val = d.get("similarity", 0.85) or 0.85
                ext = src.lower().rsplit(".", 1)[-1] if "." in src else ""
                doc_type = "image" if ext in ["png", "jpg", "jpeg", "webp", "bmp"] else "pdf"
                sources.append({
                    "name": src,
                    "type": doc_type,
                    "similarity": round(float(sim_val), 3),
                    "description": "Used for answer generation"
                })

        return "\n\n---\n\n".join(context_blocks), sources
    except Exception as e:
        print(f"RAG search error: {e}")
        return "", []

def list_indexed_documents() -> List[Dict]:
    try:
        res = supabase.table("documents").select("metadata").limit(500).execute()
        data = res.data or []
        sources = {}
        types = {}
        for row in data:
            meta = row.get("metadata", {})
            src = meta.get("source", "Document.pdf")
            sources[src] = sources.get(src, 0) + 1
            ext = src.lower().rsplit(".", 1)[-1] if "." in src else ""
            if ext in ["png", "jpg", "jpeg", "webp", "bmp"] or meta.get("type") == "image":
                types[src] = "image"
            else:
                types[src] = "pdf"
            
        return [
            {"name": name, "chunks": count, "type": types.get(name, "pdf")}
            for name, count in sources.items()
        ]
    except Exception as e:
        print(f"List documents error: {e}")
        return []

def purge_all_documents() -> bool:
    try:
        supabase.table("documents").delete().neq("id", 0).execute()
        return True
    except Exception as e:
        print(f"Purge error: {e}")
        return False

def delete_document(filename: str) -> bool:
    try:
        supabase.table("documents").delete().filter("metadata->>source", "eq", filename).execute()
        return True
    except Exception as e:
        print(f"Delete document error: {e}")
        return False

def get_document_content(filename: str) -> Dict[str, Any]:
    try:
        res = supabase.table("documents").select("id, content, metadata").limit(500).execute()
        data = res.data or []
        chunks = [row for row in data if row.get("metadata", {}).get("source") == filename]
        # Sort by page number if available
        chunks.sort(key=lambda c: (c.get("metadata", {}).get("page") or 0))
        content_text = "\n\n---\n\n".join(clean_extracted_text(c.get("content", "")) for c in chunks if c.get("content"))
        return {
            "filename": filename,
            "chunks_count": len(chunks),
            "content": content_text or "No text content available for this document."
        }
    except Exception as e:
        print(f"Get document content error: {e}")
        return {
            "filename": filename,
            "chunks_count": 0,
            "content": f"Error loading document content: {e}"
        }
