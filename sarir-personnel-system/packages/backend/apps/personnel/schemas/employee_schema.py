from __future__ import annotations
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict

# ---- پاسخ استاندارد برای یک کارمند (فقط فیلدهای پرکاربرد برای UI)
class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int | str
    personnel_code: Optional[str] = None
    employee_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    mobile_phone: Optional[str] = None
    national_id: Optional[str] = None
    position: Optional[str] = None
    created_at: Optional[datetime] = None

# ---- ساخت (فقط حداقل‌ها)
class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    mobile_phone: str
    national_id: str
    email: Optional[str] = None
    personnel_code: Optional[str] = None
    employee_code: Optional[str] = None
    position: Optional[str] = None

# ---- ویرایش (همه اختیاری)
class EmployeeUpdate(BaseModel):
    personnel_code: Optional[str] = None
    employee_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    mobile_phone: Optional[str] = None
    national_id: Optional[str] = None
    position: Optional[str] = None

# اگر به اسکیماهای بسیار جزئی (issue_place, birth_place, ...) نیاز داری،
# می‌تونیم یک مدل Rich هم اضافه کنیم؛ فعلاً برای عملیات CRUD پایه این‌ها کفایت می‌کند.
