from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from apps.personnel.models.employee import Employee
from core.database import engine
import re

router = APIRouter(tags=["personnel-import"])

class BulkImportRequest(BaseModel):
    rows: List[Dict[str, Any]]              # ردیف‌های اکسل به‌صورت هدر → مقدار
    required_fields: Optional[List[str]] = None  # فیلدهای الزامی DB (نام دقیق مدل)
    mapping: Optional[Dict[str, str]] = None    # هدر اکسل → نام فیلد DB

def _snake(s: str) -> str:
    s = re.sub(r"\s+", "_", str(s).strip())
    s = re.sub(r"[^\w_]", "", s)
    return s.lower()

@router.post("/employees/bulk_import")
async def bulk_import(payload: BulkImportRequest):
    rows = payload.rows or []
    if not rows:
        raise HTTPException(status_code=400, detail="rows required")

    # اگر mapping ندادی، فرض می‌کنیم کلیدهای اکسل همان نام‌های DB هستند یا snake شده‌شان
    mapping = payload.mapping or {}
    # نام فیلدهای مدل (برای فیلتر)
    model_fields = set(Employee.__table__.columns.keys())

    # اگر required_fields ندادی، همهٔ فیلدهای DB که در mapping آمده‌اند الزامی می‌شوند
    required_fields = payload.required_fields or [
        v for v in (mapping.values() if mapping else rows[0].keys())
    ]

    inserted = updated = failed = deficiencies_total = 0
    report: List[Dict[str, Any]] = []

    async with AsyncSession(engine) as session:
        for idx, raw in enumerate(rows, start=1):
            try:
                # ساخت دیکشنری DBField → value بر اساس mapping
                mapped: Dict[str, Any] = {}
                for k, v in raw.items():
                    db_key = mapping.get(k)
                    if not db_key:
                        # تلاش هوشمند: اگر دقیقا هم‌نام DB یا snake همان بود
                        kn = _snake(k)
                        db_key = kn if kn in model_fields else None
                    if db_key:
                        mapped[db_key] = v

                # فقط فیلدهای موجود در مدل ذخیره شوند
                to_save = {k: v for k, v in mapped.items() if k in model_fields}

                # upsert بر اساس national_id یا personnel_code
                query = None
                if to_save.get("national_id"):
                    query = select(Employee).where(Employee.national_id == to_save["national_id"])
                elif to_save.get("personnel_code"):
                    query = select(Employee).where(Employee.personnel_code == to_save["personnel_code"])

                inst = None
                if query is not None:
                    res = await session.execute(query)
                    inst = res.scalars().first()

                # نواقص این ردیف: هر required که مقدارش خالی باشد
                missing = []
                for rf in required_fields:
                    val = to_save.get(rf, None)
                    if val is None or (isinstance(val, str) and not val.strip()):
                        missing.append(rf)
                deficiencies_total += len(missing)

                if inst is None:
                    inst = Employee(**to_save)
                    session.add(inst)
                    inserted += 1
                else:
                    for k, v in to_save.items():
                        setattr(inst, k, v)
                    updated += 1

                report.append({
                    "row_index": idx,
                    "key": to_save.get("national_id") or to_save.get("personnel_code"),
                    "missing_fields": missing,
                })
            except Exception as e:
                failed += 1
                report.append({"row_index": idx, "error": str(e)})

        await session.commit()

    return {
        "inserted": inserted, "updated": updated, "failed": failed,
        "deficiencies_total": deficiencies_total,
        "required_fields": required_fields, "report": report
    }
