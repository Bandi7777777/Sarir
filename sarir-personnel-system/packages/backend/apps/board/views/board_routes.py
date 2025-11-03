from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.deps import get_db, get_current_user
from .schemas.board_schema import BoardMemberIn, BoardMemberOut
from .models.board_member import BoardMember

router = APIRouter(prefix="/board", tags=["board"])

@router.get("/members", response_model=List[BoardMemberOut])
def list_members(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(BoardMember).order_by(BoardMember.created_at.desc()).all()

@router.post("/members", response_model=BoardMemberOut, status_code=201)
def create_member(data: BoardMemberIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    m = BoardMember(**data.model_dump())
    db.add(m); db.commit(); db.refresh(m)
    return m

@router.delete("/members/{mid}", status_code=204)
def delete_member(mid: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    m = db.query(BoardMember).filter(BoardMember.id == mid).first()
    if not m: raise HTTPException(404, "Board member not found")
    db.delete(m); db.commit()
