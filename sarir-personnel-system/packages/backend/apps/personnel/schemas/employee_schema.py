from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class EmployeeBase(BaseModel):
    personnel_code: str
    first_name: str
    last_name: str
    father_name: str
    gender: str
    national_id: str
    id_number: Optional[str] = None
    id_serial: Optional[str] = None
    birth_date: date
    death_date: Optional[date] = None
    issue_date: date
    birth_place: str
    birth_place_type: Optional[str] = None
    birth_place_code: Optional[str] = None
    issue_place: str
    issue_place_type: Optional[str] = None
    issue_place_code: Optional[str] = None
    nationality: str
    citizenship: str
    religion: str
    sect: str
    email: Optional[str] = None
    mobile_phone: str
    work_id_code: Optional[str] = None
    employee_code: Optional[str] = None
    effective_employee_date: Optional[date] = None
    marital_status: str
    effective_marital_date: Optional[date] = None
    military_status: Optional[str] = None
    exemption_type: Optional[str] = None
    service_area: Optional[str] = None
    service_branch: Optional[str] = None
    service_start_date: Optional[date] = None
    service_end_date: Optional[date] = None
    service_duration: Optional[str] = None
    education_level_during_service: Optional[str] = None
    address_type: Optional[str] = None
    address_title: Optional[str] = None
    city: Optional[str] = None
    city_type: Optional[str] = None
    city_code: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    postal_code: Optional[str] = None
    fax: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
