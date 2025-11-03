from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.deps import get_db, get_current_user
from .schemas.assembly_schema import AssemblyIn, AssemblyOut
from .models.assembly import Assembly

router = APIRouter(prefix="/assemblies", tags=["assembly"])

@router.get("/", response_model=List[AssemblyOut])
def list_assemblies(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Assembly).order_by(Assembly.created_at.desc()).all()

@router.post("/", response_model=AssemblyOut, status_code=201)
def create_assembly(data: AssemblyIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    a = Assembly(**data.model_dump())
    db.add(a); db.commit(); db.refresh(a)
    return a

@router.delete("/{aid}", status_code=204)
def delete_assembly(aid: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    a = db.query(Assembly).filter(Assembly.id == aid).first()
    if not a: raise HTTPException(404, "Assembly not found")
    db.delete(a); db.commit()
