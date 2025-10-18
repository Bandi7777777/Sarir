import json
import requests
from datetime import datetime
from persiantools.jdatetime import JalaliDate

# === تنظیمات ثابت ===
TOKEN = "8078512655:AAFkzWO612O22y7wRbh1ZKMljfjo4IWv77E"
CHAT_ID = "953422975"
EVENTS_FILE = "events_1404_full.json"

# === بارگذاری لیست مناسبت‌ها ===
with open(EVENTS_FILE, "r", encoding="utf-8") as f:
    events = json.load(f)

today = datetime.utcnow().date()  # تاریخ امروز میلادی

# === بررسی مناسبت‌ها ===
for event in events:
    try:
        y, m, d = map(int, event["date"].split("-"))
        event_date = JalaliDate(y, m, d).to_gregorian()
        delta = (event_date - today).days

        if delta in [3, 2, 1, 0]:
            if delta == 3:
                msg = f"⏳ فقط ۳ روز تا «{event['title']}» باقی مانده است."
            elif delta == 2:
                msg = f"⏳ تنها ۲ روز تا «{event['title']}» باقی مانده."
            elif delta == 1:
                msg = f"📣 فردا «{event['title']}» است. آماده باش!"
            else:
                msg = f"🎉 امروز «{event['title']}» است! فراموش نکن :)"

            requests.post(
                f"https://api.telegram.org/bot{TOKEN}/sendMessage",
                data={"chat_id": CHAT_ID, "text": msg}
            )
    except Exception as e:
        print(f"خطا در پردازش {event['title']}: {e}")
