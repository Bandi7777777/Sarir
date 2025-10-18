from fastapi import APIRouter
from apps.personnel.models.employee import Employee

router = APIRouter(tags=["personnel-schema"])

@router.get("/employees/schema")
def employee_schema():
    cols = []
    for c in Employee.__table__.columns:
        cols.append({
            "name": c.name,
            "type": str(c.type),
            "nullable": bool(c.nullable),
            "primary_key": bool(c.primary_key),
        })
    return {"model": "Employee", "columns": cols}
