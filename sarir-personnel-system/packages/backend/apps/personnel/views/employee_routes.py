from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..schemas.employee_schema import EmployeeCreate, EmployeeResponse
from ..services.employee_service import create_employee, get_employees
from core.database import get_db

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/", response_model=List[EmployeeResponse])
async def list_employees(db: AsyncSession = Depends(get_db)):
    return await get_employees(db)


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def add_employee(payload: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await create_employee(db, payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
