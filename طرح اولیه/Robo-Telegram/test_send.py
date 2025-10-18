import requests

# 🔐 مشخصات ربات
TOKEN = "8078512655:AAFkzWO612O22y7wRbh1ZKMljfjo4IWv77E"
CHAT_ID = "953422975"  # اگر تغییر کرد از @userinfobot بگیر

# 💬 پیام تستی
TEXT = "✅ تست موفق: این پیام از بندی Sarir ارسال شده است."

# 📨 درخواست به API تلگرام
response = requests.post(
    f"https://api.telegram.org/bot{TOKEN}/sendMessage",
    data={
        "chat_id": CHAT_ID,
        "text": TEXT
    }
)

# 📋 نمایش نتیجه
print("Status Code:", response.status_code)
print("Response:", response.text)
