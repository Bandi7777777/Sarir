from __future__ import annotations
from datetime import datetime, timezone
from typing import List, Literal
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, constr

router = APIRouter(prefix="/api/reminders", tags=["reminders"])

Kind = Literal["day-before", "day-of"]

class ReminderIn(BaseModel):
    key: constr(strip_whitespace=True, min_length=4)
    title: constr(strip_whitespace=True, min_length=1, max_length=200)
    at: datetime
    kind: Kind

class Reminder(ReminderIn):
    id: str = Field(default_factory=lambda: uuid4().hex)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

DB: dict[str, Reminder] = {}

@router.get("", response_model=List[Reminder])
def list_reminders() -> List[Reminder]:
    return sorted(DB.values(), key=lambda r: r.at)

@router.post("", response_model=Reminder, status_code=201)
def create(rem: ReminderIn) -> Reminder:
    rid = f"{rem.key}-{rem.kind}"
    DB.pop(rid, None)
    out = Reminder(id=rid, **rem.dict())
    DB[rid] = out
    return out

@router.delete("/{key}", status_code=204)
def delete_by_key(key: str):
    removed = False
    for k in [f"{key}-day", f"{key}-day-before"]:
        if k in DB:
            DB.pop(k)
            removed = True
    if not removed:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return
