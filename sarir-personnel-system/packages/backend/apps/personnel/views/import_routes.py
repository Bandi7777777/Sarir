import re
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apps.personnel.models.employee import Employee
from core.deps import get_current_user, get_db

router = APIRouter(tags=["personnel-import"])


class BulkImportRequest(BaseModel):
    rows: List[Dict[str, Any]]
    required_fields: Optional[List[str]] = None
    mapping: Optional[Dict[str, str]] = None


def _snake(s: str) -> str:
    s = re.sub(r"\s+", "_", str(s).strip())
    s = re.sub(r"[^\w_]", "", s)
    return s.lower()


@router.post("/employees/bulk_import")
def bulk_import(
    payload: BulkImportRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    rows = payload.rows or []
    if not rows:
        raise HTTPException(status_code=400, detail="rows required")

    mapping = payload.mapping or {}
    model_fields = set(Employee.__table__.columns.keys())
    required_fields = payload.required_fields or [
        v for v in (mapping.values() if mapping else rows[0].keys())
    ]

    inserted = updated = failed = deficiencies_total = 0
    report: List[Dict[str, Any]] = []

    for idx, raw in enumerate(rows, start=1):
        try:
            mapped: Dict[str, Any] = {}
            for k, v in raw.items():
                db_key = mapping.get(k)
                if not db_key:
                    kn = _snake(k)
                    db_key = kn if kn in model_fields else None
                if db_key:
                    mapped[db_key] = v

            to_save = {k: v for k, v in mapped.items() if k in model_fields}

            inst = None
            if to_save.get("national_id"):
                inst = (
                    db.query(Employee)
                    .filter(Employee.national_id == to_save["national_id"])
                    .first()
                )
            elif to_save.get("personnel_code"):
                inst = (
                    db.query(Employee)
                    .filter(Employee.personnel_code == to_save["personnel_code"])
                    .first()
                )

            missing = []
            for rf in required_fields:
                val = to_save.get(rf, None)
                if val is None or (isinstance(val, str) and not val.strip()):
                    missing.append(rf)
            deficiencies_total += len(missing)

            if inst is None:
                inst = Employee(**to_save)
                db.add(inst)
                inserted += 1
            else:
                for k, v in to_save.items():
                    setattr(inst, k, v)
                updated += 1

            report.append(
                {
                    "row_index": idx,
                    "key": to_save.get("national_id") or to_save.get("personnel_code"),
                    "missing_fields": missing,
                }
            )
        except Exception as e:
            failed += 1
            report.append({"row_index": idx, "error": str(e)})

    db.commit()

    return {
        "inserted": inserted,
        "updated": updated,
        "failed": failed,
        "deficiencies_total": deficiencies_total,
        "required_fields": required_fields,
        "report": report,
    }
