from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.services.rag_service import (
    index_pdf_document,
    list_indexed_documents,
    purge_all_documents,
    get_document_content,
    delete_document
)

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_documents():
    return list_indexed_documents()

@router.get("/{doc_name:path}/content")
async def get_doc_content(doc_name: str):
    return get_document_content(doc_name)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported at this time.")
    
    file_bytes = await file.read()
    try:
        result = index_pdf_document(file_bytes, file.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/purge")
async def purge_documents():
    success = purge_all_documents()
    if not success:
        raise HTTPException(status_code=500, detail="Failed to purge vector database.")
    return {"message": "All documents successfully purged from vector store."}

@router.delete("/{doc_name:path}")
async def delete_single_document(doc_name: str):
    success = delete_document(doc_name)
    if not success:
        raise HTTPException(status_code=500, detail=f"Failed to delete document '{doc_name}'.")
    return {"message": f"Document '{doc_name}' successfully removed from vector store."}


