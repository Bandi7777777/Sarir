from __future__ import annotations
import time
import threading
from collections import deque
from typing import Deque, Dict, Tuple

# کلید = (ip, username)
# پنجره = 5 دقیقه، حداکثر 7 تلاش (پیشنهادی)
_WINDOW = 5 * 60
_LIMIT = 7
_store: Dict[Tuple[str, str], Deque[float]] = {}
_lock = threading.Lock()

def _now() -> float:
    return time.time()

def check_and_count(ip: str, username: str) -> bool:
    """
    True => اجازه تلاش؛ False => بلاک.
    هر بار که صدا می‌زنیم، یک تلاش جدید هم ثبت می‌شود.
    """
    key = (ip or "", (username or "").lower())
    now = _now()
    with _lock:
        dq = _store.get(key)
        if dq is None:
            dq = deque()
            _store[key] = dq
        # پاکسازی رویدادهای قدیمی
        while dq and now - dq[0] > _WINDOW:
            dq.popleft()
        if len(dq) >= _LIMIT:
            return False
        dq.append(now)
        return True
