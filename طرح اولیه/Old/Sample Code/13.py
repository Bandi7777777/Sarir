import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame,
    QProgressBar, QGraphicsDropShadowEffect, QPushButton, QGridLayout
)
from PyQt5.QtGui import QFont, QColor
from PyQt5.QtCore import Qt

class DashboardWidget(QWidget):
    def __init__(self):
        super().__init__()
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)

        # نوار کناری (منو) سمت راست
        sidebar = QFrame()
        sidebar.setFixedWidth(250)
        sidebar.setStyleSheet("background-color: rgba(0, 109, 111, 0.08); border-radius: 0;")
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(15, 30, 15, 15)
        menu_items = ["داشبورد", "پرسنل", "قراردادها", "مدارک شناسایی", "مدارک پزشکی", "گزارش‌ها", "تنظیمات"]
        for item in menu_items:
            btn = QPushButton(item)
            btn.setStyleSheet("padding: 12px; font-size: 15px; color: #006D6F; border-radius: 10px;")
            sidebar_layout.addWidget(btn)
        sidebar_layout.addStretch()

        # محتوای جدید داشبورد با طراحی جذاب و مدرن
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setSpacing(30)
        layout.setContentsMargins(25, 25, 25, 25)

        title = QLabel("داشبورد مدیریت")
        title.setFont(QFont("Segoe UI", 24, QFont.Bold))
        title.setAlignment(Qt.AlignLeft)
        layout.addWidget(title)

        # نمودارها و خلاصه آماری
        grid_layout = QGridLayout()
        grid_layout.setSpacing(20)

        def create_summary_card(title, value, color):
            card = QFrame()
            card.setFixedSize(250, 150)
            card.setStyleSheet(f"background-color: {color}; border-radius: 15px;")
            shadow = QGraphicsDropShadowEffect(blurRadius=25, xOffset=0, yOffset=8, color=QColor(0,0,0,80))
            card.setGraphicsEffect(shadow)
            card_layout = QVBoxLayout(card)

            lbl_value = QLabel(value)
            lbl_value.setFont(QFont("Segoe UI", 28, QFont.Bold))
            lbl_value.setAlignment(Qt.AlignCenter)
            lbl_value.setStyleSheet("color: white;")

            lbl_title = QLabel(title)
            lbl_title.setFont(QFont("Segoe UI", 14))
            lbl_title.setAlignment(Qt.AlignCenter)
            lbl_title.setStyleSheet("color: white;")

            card_layout.addWidget(lbl_value)
            card_layout.addWidget(lbl_title)

            return card

        summary_cards = [
            create_summary_card("تعداد پرسنل", "130", "#1abc9c"),
            create_summary_card("قراردادهای فعال", "95", "#3498db"),
            create_summary_card("مدارک ناقص", "8", "#e74c3c"),
            create_summary_card("اخطارها", "3", "#f39c12")
        ]

        positions = [(i, j) for i in range(2) for j in range(2)]
        for position, card in zip(positions, summary_cards):
            grid_layout.addWidget(card, *position)

        layout.addLayout(grid_layout)

        # بخش دسترسی سریع به قابلیت‌ها
        quick_access = QWidget()
        quick_layout = QHBoxLayout(quick_access)
        quick_layout.setSpacing(20)

        quick_buttons = ["مدیریت پرسنل", "مدیریت قراردادها", "گزارش جامع", "تنظیمات پیشرفته"]
        for btn_text in quick_buttons:
            btn = QPushButton(btn_text)
            btn.setFixedHeight(50)
            btn.setStyleSheet("padding: 10px; background-color: #34495e; color: white; border-radius: 15px; font-size: 15px;")
            quick_layout.addWidget(btn)

        layout.addWidget(quick_access)
        layout.addStretch()

        # ترکیب نهایی در layout اصلی
        main_layout.addWidget(content)
        main_layout.addWidget(sidebar)

# تابع اصلی اجرا
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = QMainWindow()
    window.setWindowTitle("داشبورد سازمانی")
    dashboard = DashboardWidget()
    window.setCentralWidget(dashboard)
    window.resize(1300, 800)
    window.show()
    sys.exit(app.exec_())