# packages/backend/apps/drivers/schemas/driver_schema.py

from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class DriverCreate(BaseModel):
    driver_code: str                # کد راننده (معادل کد پرسنلی)
    first_name: str
    last_name: str
    father_name: Optional[str]
    gender: str                     # مثلاً "مذکر" یا "مونث"
    national_id: str                # کد/شناسه ملی
    id_number: Optional[str]
    id_serial: Optional[str]
    birth_date: date
    issue_date: date                
    birth_place: Optional[str]
    birth_place_type: Optional[str]
    birth_place_code: Optional[str]
    issue_place: Optional[str]
    issue_place_type: Optional[str]
    issue_place_code: Optional[str]
    nationality: Optional[str]
    citizenship: Optional[str]
    religion: Optional[str]
    sect: Optional[str]
    email: Optional[EmailStr]
    mobile_phone: Optional[str]
    # ----- فیلدهای خاص راننده -----
    license_number: str             # شماره گواهینامه
    license_issue_date: date
    license_expiry_date: date
    vehicle_plate: Optional[str]    # پلاک خودرو
    experience_years: Optional[int] # سال‌های سابقه رانندگی
    # ----- آدرس -----
    address_type: Optional[str]
    address_title: Optional[str]
    city: Optional[str]
    city_type: Optional[str]
    city_code: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    postal_code: Optional[str]
    fax: Optional[str]

class DriverResponse(DriverCreate):
    id: int
    created_at: date
