from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class DriverCreate(BaseModel):
    driver_code: str                # کد راننده
    first_name: str
    last_name: str
    father_name: Optional[str] = None
    gender: str                     # "مذکر"/"مونث" یا "male"/"female"
    national_id: str                # کد ملی
    id_number: Optional[str] = None
    id_serial: Optional[str] = None
    birth_date: date
    issue_date: Optional[date] = None       # تاریخ صدور کارت ملی (اختیاری)
    birth_place: Optional[str] = None
    birth_place_type: Optional[str] = None
    birth_place_code: Optional[str] = None
    issue_place: Optional[str] = None
    issue_place_type: Optional[str] = None
    issue_place_code: Optional[str] = None
    nationality: Optional[str] = None
    citizenship: Optional[str] = None
    religion: Optional[str] = None
    sect: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile_phone: Optional[str] = None
    license_number: str             # شماره گواهینامه
    license_issue_date: date
    license_expiry_date: date
    vehicle_plate: Optional[str] = None     # پلاک خودرو
    experience_years: Optional[int] = None
    address_type: Optional[str] = None
    address_title: Optional[str] = None
    city: Optional[str] = None
    city_type: Optional[str] = None
    city_code: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    postal_code: Optional[str] = None
    fax: Optional[str] = None

class DriverResponse(DriverCreate):
    id: int
    created_at: date
