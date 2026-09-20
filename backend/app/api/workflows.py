from fastapi import APIRouter
from typing import Dict, Any, List
from app.services.workflow_engine import get_default_workflow_nodes

router = APIRouter()

@router.get("/current", response_model=Dict[str, Any])
async def get_current_workflow():
    return {
        "title": "ConsultAI Executive Intelligence Pipeline",
        "description": "Multi-agent RAG workflow with semantic intent routing and document synthesis.",
        "nodes": get_default_workflow_nodes(),
        "status": "Ready",
        "version": "1.4"
    }

@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_workflow_templates():
    return [
        {
            "id": "rag_pipeline",
            "name": "Document Q&A & Synthesis",
            "steps": 6,
            "latency": "10-15s",
            "active": True
        },
        {
            "id": "financial_kpi",
            "name": "Financial Ratio & KPI Diagnostic",
            "steps": 4,
            "latency": "6-8s",
            "active": True
        },
        {
            "id": "due_diligence",
            "name": "Due Diligence Red Flag Scanner",
            "steps": 7,
            "latency": "14-18s",
            "active": False
        }
    ]
