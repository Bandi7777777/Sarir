from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from core.deps import get_db, get_current_user
from apps.drivers.models.driver import Driver
from apps.drivers.schemas.driver_schema import DriverCreate, DriverResponse

router = APIRouter(prefix="/drivers", tags=["drivers"])

@router.get("/", response_model=list[DriverResponse])
def list_drivers(
    email: str | None = None,
    driver_code: str | None = None,
    national_id: str | None = None,
    license_number: str | None = None,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if email or driver_code or national_id or license_number:
        query = db.query(Driver)
        conditions = []
        if email:
            conditions.append(Driver.email == email)
        if driver_code:
            conditions.append(Driver.driver_code == driver_code)
        if national_id:
            conditions.append(Driver.national_id == national_id)
        if license_number:
            conditions.append(Driver.license_number == license_number)
        if conditions:
            return query.filter(or_(*conditions)).all()
    return db.query(Driver).order_by(Driver.created_at.desc()).all()

@router.get("/{did}", response_model=DriverResponse)
def get_driver(did: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    row = db.query(Driver).filter(Driver.id == did).first()
    if not row:
        raise HTTPException(status_code=404, detail="Driver not found")
    return row

@router.post("/", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def add_driver(payload: DriverCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # بررسی عدم تکراری بودن داده‌های یکتا
    if db.query(Driver).filter(Driver.driver_code == payload.driver_code).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Driver code already exists")
    if db.query(Driver).filter(Driver.national_id == payload.national_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="National ID already exists")
    if payload.email and db.query(Driver).filter(Driver.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")
    if db.query(Driver).filter(Driver.license_number == payload.license_number).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License number already exists")
    row = Driver(**payload.model_dump(exclude_none=True))
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.put("/{did}", response_model=DriverResponse)
def update_driver(did: int, payload: DriverCreate, db: Session = Depends(get_db), user = Depends(get_current_user)):
    row = db.query(Driver).filter(Driver.id == did).first()
    if not row:
        raise HTTPException(status_code=404, detail="Driver not found")
    # جلوگیری از تداخل مقادیر تکراری در به‌روزرسانی
    if payload.driver_code and payload.driver_code != row.driver_code:
        if db.query(Driver).filter(Driver.driver_code == payload.driver_code).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Driver code already in use")
    if payload.national_id and payload.national_id != row.national_id:
        if db.query(Driver).filter(Driver.national_id == payload.national_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="National ID already in use")
    if payload.email and payload.email != row.email:
        if db.query(Driver).filter(Driver.email == payload.email).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
    if payload.license_number and payload.license_number != row.license_number:
        if db.query(Driver).filter(Driver.license_number == payload.license_number).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License number already in use")
    for k, v in payload.model_dump(exclude_none=True).items():
        if hasattr(row, k):
            setattr(row, k, v)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.delete("/{did}", status_code=204)
def delete_driver(did: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    row = db.query(Driver).filter(Driver.id == did).first()
    if not row:
        raise HTTPException(status_code=404, detail="Driver not found")
    db.delete(row)
    db.commit()
    return
