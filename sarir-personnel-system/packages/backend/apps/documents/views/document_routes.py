from typing import List, Optional
from uuid import UUID
from pathlib import Path
import mimetypes

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from core.deps import get_db, get_current_user
from core.storage import get_storage_root, save_upload_file, compute_sha256, safe_filename
from apps.documents.models.document import Document
from apps.documents.schemas.document_schema import DocumentOut

ALLOWED_SUBJECTS = {"employee", "driver", "board", "assembly", "user", "generic"}

router = APIRouter()

@router.post("/upload", response_model=DocumentOut, status_code=201)
def upload_document(
    subject_type: str = Form(...),
    subject_id: Optional[UUID] = Form(None),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form("general"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    st = (subject_type or "").strip().lower()
    if st not in ALLOWED_SUBJECTS:
        raise HTTPException(status_code=400, detail=f"Invalid subject_type. Allowed: {', '.join(sorted(ALLOWED_SUBJECTS))}")

    root = get_storage_root()
    subdir = root / st / (str(subject_id) if subject_id else "unassigned")

    original = safe_filename(file.filename or "file")
    saved_path, size = save_upload_file(file, subdir, final_name=original)
    mime = file.content_type or (mimetypes.guess_type(saved_path.name)[0] or "application/octet-stream")

    checksum = compute_sha256(saved_path)

    doc = Document(
        subject_type=st,
        subject_id=subject_id,
        title=title,
        category=(category or "general"),
        file_name=saved_path.name,
        file_path=str(saved_path),
        mime_type=mime,
        file_size=size,
        checksum_sha256=checksum,
        uploaded_by=getattr(current_user, "id", None),
        is_archived=False,
    )
    db.add(doc); db.commit(); db.refresh(doc)
    return doc

@router.get("/", response_model=List[DocumentOut])
def list_documents(
    subject_type: Optional[str] = Query(None),
    subject_id: Optional[UUID] = Query(None),
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    archived: bool = Query(False),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    qry = db.query(Document)
    if subject_type:
        qry = qry.filter(Document.subject_type == subject_type.strip().lower())
    if subject_id:
        qry = qry.filter(Document.subject_id == subject_id)
    if category:
        qry = qry.filter(Document.category == category)
    qry = qry.filter(Document.is_archived == archived)
    if q:
        like = f"%{q}%"
        qry = qry.filter((Document.title.ilike(like)) | (Document.file_name.ilike(like)))
    qry = qry.order_by(Document.created_at.desc())
    return qry.all()

@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(doc_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{doc_id}/download")
def download_document(doc_id: UUID, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    fpath = Path(doc.file_path)
    if not fpath.exists():
        raise HTTPException(status_code=410, detail="File not found on storage")

    headers = {"Content-Disposition": f'attachment; filename="{doc.file_name}"'}
    return FileResponse(fpath, media_type=doc.mime_type or "application/octet-stream", headers=headers)

@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: UUID,
    hard: bool = Query(False, description="اگر True باشد رکورد و فایل فیزیکی حذف می‌شود"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if hard:
        try:
            Path(doc.file_path).unlink(missing_ok=True)
        except Exception:
            pass
        db.delete(doc)
    else:
        doc.is_archived = True
        db.add(doc)

    db.commit()
    return Response(status_code=204)
