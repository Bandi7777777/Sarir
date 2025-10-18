import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame,
    QProgressBar, QGraphicsDropShadowEffect, QPushButton, QSplitter
)
from PyQt5.QtGui import QFont, QColor
from PyQt5.QtCore import Qt

class DashboardWidget(QWidget):
    def __init__(self):
        super().__init__()
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)

        # نوار کناری (منو)
        sidebar = QFrame()
        sidebar.setFixedWidth(250)
        sidebar.setStyleSheet("background-color: rgba(0, 109, 111, 0.08); border-top-left-radius: 0; border-bottom-left-radius: 0;")
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(15, 30, 15, 15)
        menu_items = ["داشبورد", "پرسنل", "قراردادها", "مدارک شناسایی", "مدارک پزشکی", "گزارش‌ها", "تنظیمات"]
        for item in menu_items:
            btn = QPushButton(item)
            btn.setStyleSheet("padding: 12px; font-size: 15px; color: #006D6F; border-radius: 10px;")
            sidebar_layout.addWidget(btn)
        sidebar_layout.addStretch()

        # محتوای داشبورد اصلی
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setSpacing(25)
        layout.setContentsMargins(25, 25, 25, 25)

        title = QLabel("نمای کلی سازمان")
        title.setFont(QFont("Segoe UI", 20, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # کارت‌های آماری
        stats_container = QWidget()
        stats_layout = QHBoxLayout(stats_container)
        stats_layout.setSpacing(20)

        def create_card(title, value, percent):
            frame = QFrame()
            frame.setFixedSize(220, 140)
            frame.setStyleSheet("background-color: rgba(255, 255, 255, 0.95); border-radius: 20px;")
            shadow = QGraphicsDropShadowEffect(blurRadius=30, xOffset=0, yOffset=6, color=QColor(0,0,0,50))
            frame.setGraphicsEffect(shadow)
            card_layout = QVBoxLayout(frame)

            lbl_value = QLabel(value)
            lbl_value.setFont(QFont("Segoe UI", 22, QFont.Bold))
            lbl_value.setStyleSheet("color: #006D6F;")
            lbl_value.setAlignment(Qt.AlignCenter)

            lbl_title = QLabel(title)
            lbl_title.setStyleSheet("color: #7F8C8D;")
            lbl_title.setAlignment(Qt.AlignCenter)

            progress = QProgressBar()
            progress.setValue(percent)
            progress.setFixedHeight(6)
            progress.setTextVisible(False)
            progress.setStyleSheet("QProgressBar::chunk { background-color: #006D6F; border-radius: 3px; }")

            card_layout.addWidget(lbl_value)
            card_layout.addWidget(lbl_title)
            card_layout.addWidget(progress)
            return frame

        cards = [
            create_card("تعداد پرسنل", "125", 80),
            create_card("قرارداد فعال", "92", 70),
            create_card("مدارک ناقص", "14", 30),
            create_card("پرسنل تازه‌وارد", "5", 10)
        ]

        for c in cards:
            stats_layout.addWidget(c)

        layout.addWidget(stats_container)

        # دکمه‌های سریع برای دسترسی به بخش‌ها
        quick_access = QWidget()
        quick_layout = QHBoxLayout(quick_access)
        quick_layout.setSpacing(15)
        buttons = ["مدیریت پرسنل", "قراردادها", "گزارش‌گیری", "تنظیمات"]

        for label in buttons:
            btn = QPushButton(label)
            btn.setFixedHeight(45)
            btn.setStyleSheet("padding: 10px; background-color: #E0F7F8; border-radius: 12px; font-size: 14px;")
            quick_layout.addWidget(btn)

        layout.addWidget(quick_access)
        layout.addStretch()

        # ترکیب نهایی در layout اصلی
        main_layout.addWidget(sidebar)
        main_layout.addWidget(content)

# تابع اصلی اجرا
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = QMainWindow()
    window.setWindowTitle("داشبورد سازمانی")
    dashboard = DashboardWidget()
    window.setCentralWidget(dashboard)
    window.resize(1200, 750)
    window.show()
    sys.exit(app.exec_())
