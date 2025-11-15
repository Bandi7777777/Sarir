from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from core.deps import get_db, get_current_user
from apps.personnel.schemas.employee_schema import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from apps.personnel.models.employee import Employee

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    email: Optional[str] = None,
    personnel_code: Optional[str] = None,
    national_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    # در صورت ارسال پارامترهای فیلتر، فقط رکوردهای مطابق برگردانده می‌شود
    if email or personnel_code or national_id:
        query = db.query(Employee)
        conditions = []
        if email:
            conditions.append(Employee.email == email)
        if personnel_code:
            conditions.append(Employee.personnel_code == personnel_code)
        if national_id:
            conditions.append(Employee.national_id == national_id)
        if conditions:
            return query.filter(or_(*conditions)).all()
    return db.query(Employee).order_by(Employee.created_at.desc()).all()

@router.get("/{eid}", response_model=EmployeeResponse)
def get_employee(eid: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    row = db.query(Employee).filter(Employee.id == eid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    return row

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def add_employee(payload: EmployeeCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # جلوگیری از درج رکورد تکراری بر اساس فیلدهای یکتا
    if db.query(Employee).filter(Employee.national_id == payload.national_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="National ID already exists")
    if payload.personnel_code and db.query(Employee).filter(Employee.personnel_code == payload.personnel_code).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Personnel code already exists")
    if payload.email and db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    row = Employee(**payload.model_dump(exclude_none=True))
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.put("/{eid}", response_model=EmployeeResponse)
def update_employee(eid: int, payload: EmployeeUpdate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    row = db.query(Employee).filter(Employee.id == eid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        if hasattr(row, k):
            setattr(row, k, v)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.delete("/{eid}", status_code=204)
def delete_employee(eid: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    row = db.query(Employee).filter(Employee.id == eid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(row)
    db.commit()
    return
