from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..models.employee import Employee
from ..schemas.employee_schema import EmployeeCreate


async def create_employee(db: AsyncSession, payload: EmployeeCreate) -> Employee:
    emp = Employee(**payload.model_dump())
    db.add(emp)
    await db.commit()
    await db.refresh(emp)
    return emp


async def get_employees(db: AsyncSession):
    stmt = select(Employee).order_by(Employee.id.desc())
    res = await db.execute(stmt)
    return res.scalars().all()
