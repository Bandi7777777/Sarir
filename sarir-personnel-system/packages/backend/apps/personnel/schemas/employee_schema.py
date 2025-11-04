from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

# پاسخ استاندارد برای UI
class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str | int
    personnel_code: Optional[str] = None
    employee_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    national_id: Optional[str] = None
    email: Optional[str] = None
    mobile_phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    education_level: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    hire_date: Optional[datetime] = None
    marital_status: Optional[str] = None  # single/married/...
    address: Optional[str] = None
    created_at: Optional[datetime] = None

# ساخت
class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    national_id: str
    personnel_code: Optional[str] = None
    employee_code: Optional[str] = None
    email: Optional[str] = None
    mobile_phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    education_level: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    hire_date: Optional[datetime] = None
    marital_status: Optional[str] = None
    address: Optional[str] = None

# ویرایش (همه اختیاری)
class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    national_id: Optional[str] = None
    personnel_code: Optional[str] = None
    employee_code: Optional[str] = None
    email: Optional[str] = None
    mobile_phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    education_level: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    hire_date: Optional[datetime] = None
    marital_status: Optional[str] = None
    address: Optional[str] = None
