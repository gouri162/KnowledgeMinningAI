from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.services.rag_service import (
    index_pdf_document,
    index_image_document,
    list_indexed_documents,
    purge_all_documents,
    get_document_content,
    delete_document
)

router = APIRouter()

SUPPORTED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".bmp"}

@router.get("", response_model=List[Dict[str, Any]])
async def get_documents():
    return list_indexed_documents()

@router.get("/{doc_name:path}/content")
async def get_doc_content(doc_name: str):
    return get_document_content(doc_name)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "uploaded_file"
    ext = "." + filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported format '{ext}'. Supported formats: PDF, PNG, JPG, JPEG, WEBP."
        )
    
    file_bytes = await file.read()
    try:
        if ext == ".pdf":
            result = index_pdf_document(file_bytes, filename)
        else:
            result = index_image_document(file_bytes, filename)
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


