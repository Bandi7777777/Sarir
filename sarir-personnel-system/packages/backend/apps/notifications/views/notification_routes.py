from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal, List
from datetime import datetime

router = APIRouter(tags=["notifications"])

class Notification(BaseModel):
    id: int
    title: str
    body: Optional[str] = ""
    category: Optional[Literal["hr", "system", "alert", "other"]] = "other"
    unread: bool = True
    created_at: datetime = datetime.utcnow()

# In-memory (نمونه‌های هم‌راستا با مدارک/سیستم)
STORE: List[Notification] = [
    Notification(id=1, title="تمدید بیمه ۵ نفر", body="تا ۳۰ روز آینده", category="hr", unread=True),
    Notification(id=2, title="به‌روزرسانی سیستم", body="ساعت ۲۲:۰۰ امشب", category="system", unread=True),
]

@router.get("/notifications", response_model=List[Notification])
def list_notifications():
    return STORE

@router.patch("/notifications/{nid}", response_model=Notification)
def patch_notification(nid: int, unread: Optional[bool] = None):
    for i, n in enumerate(STORE):
        if n.id == nid:
            if unread is not None:
                STORE[i] = n.copy(update={"unread": unread})
            return STORE[i]
    raise HTTPException(status_code=404, detail="Not Found")

@router.delete("/notifications/{nid}")
def delete_notification(nid: int):
    global STORE
    before = len(STORE)
    STORE = [n for n in STORE if n.id != nid]
    if len(STORE) == before:
        raise HTTPException(status_code=404, detail="Not Found")
    return {"ok": True}
