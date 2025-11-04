from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.deps import get_db, get_current_user
from apps.personnel.schemas.employee_schema import (
    EmployeeCreate, EmployeeUpdate, EmployeeResponse
)
from apps.personnel.models.employee import Employee  # مسیر مدل را اگر متفاوت است، اصلاح کن

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/", response_model=List[EmployeeResponse])
def list_employees(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Employee).order_by(Employee.created_at.desc()).all()

@router.get("/{eid}", response_model=EmployeeResponse)
def get_employee(eid: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = db.query(Employee).filter(Employee.id == eid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    return row

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def add_employee(payload: EmployeeCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = Employee(**payload.model_dump(exclude_none=True))
    db.add(row); db.commit(); db.refresh(row)
    return row

@router.put("/{eid}", response_model=EmployeeResponse)
def update_employee(eid: str, payload: EmployeeUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = db.query(Employee).filter(Employee.id == eid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        if hasattr(row, k):
            setattr(row, k, v)
    db.add(row); db.commit(); db.refresh(row)
    return row

@router.delete("/{eid}", status_code=204)
def delete_employee(eid: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    row = db.query(Employee).filter(Employee.id == eid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(row); db.commit()
    return
