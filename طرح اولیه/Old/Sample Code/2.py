
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QLabel, QHBoxLayout,
                             QPushButton, QTableWidget, QTableWidgetItem, QFrame, QSizePolicy)
from PyQt5.QtGui import QFont, QIcon
from PyQt5.QtCore import Qt, QPropertyAnimation, QRect
import sys

class AdvancedUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("مدیریت حرفه‌ای پرسنل")
        self.setGeometry(100, 100, 1300, 750)
        self.setLayoutDirection(Qt.RightToLeft)
        self.setStyleSheet("""
            QWidget { background-color: #f7f8fa; }
            QLabel { color: #333; }
            QPushButton { border: none; font-size: 15px; padding: 10px; text-align: right; }
            QPushButton:hover { color: #007bff; }
        """)

        # منو
        self.menu_widget = QWidget(self)
        self.menu_widget.setGeometry(1100, 0, 200, 750)
        self.menu_widget.setStyleSheet("background-color: #ffffff; border-left: 1px solid #eaeaea;")
        self.menu_layout = QVBoxLayout(self.menu_widget)

        menu_items = ["🏠 داشبورد", "👥 پرسنل", "📁 قراردادها", "📑 مدارک", "📊 گزارش‌ها", "⚙️ تنظیمات"]
        for item in menu_items:
            btn = QPushButton(item)
            btn.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
            self.menu_layout.addWidget(btn)

        # هدر
        header = QLabel("مدیریت حرفه‌ای پرسنل")
        header.setFont(QFont('Segoe UI', 24, QFont.Bold))
        header.setStyleSheet("margin: 20px;")

        # کارت‌های شیشه‌ای
        card_layout = QHBoxLayout()
        card_info = [("پرسنل فعال", "125"), ("قرارداد فعال", "78"), ("مدارک ناقص", "12")]
        for text, number in card_info:
            card = QFrame()
            card.setFixedSize(250, 150)
            card.setStyleSheet("""
                background: rgba(255, 255, 255, 0.7);
                border-radius: 20px;
                border: 1px solid rgba(255,255,255,0.3);
                box-shadow: 0px 8px 20px rgba(0,0,0,0.1);
            """)
            v_layout = QVBoxLayout(card)
            lbl_text = QLabel(text)
            lbl_text.setFont(QFont('Segoe UI', 13))
            lbl_text.setAlignment(Qt.AlignCenter)
            lbl_num = QLabel(number)
            lbl_num.setFont(QFont('Segoe UI', 36, QFont.Bold))
            lbl_num.setAlignment(Qt.AlignCenter)
            lbl_num.setStyleSheet("color: #007bff;")
            v_layout.addWidget(lbl_text)
            v_layout.addWidget(lbl_num)
            card_layout.addWidget(card)

        # جدول مدرن
        table = QTableWidget(5, 3)
        table.setHorizontalHeaderLabels(["نام", "سمت", "وضعیت قرارداد"])
        table.setStyleSheet("""
            QTableWidget {
                background-color: rgba(255,255,255,0.8); border-radius: 12px;
                font-size: 14px; padding: 5px;
            }
            QHeaderView::section { background-color: #007bff; color: white; border-radius: 8px; }
        """)
        data = [
            ("علی رضایی", "مدیر پروژه", "فعال"),
            ("سارا محمدی", "کارشناس مالی", "رو به اتمام"),
            ("حامد احمدی", "تکنسین فنی", "منقضی شده"),
            ("سمیه حسینی", "مدیر منابع انسانی", "فعال"),
            ("محمد قاسمی", "کارمند اداری", "فعال")
        ]
        for row, (name, position, status) in enumerate(data):
            table.setItem(row, 0, QTableWidgetItem(name))
            table.setItem(row, 1, QTableWidgetItem(position))
            table.setItem(row, 2, QTableWidgetItem(status))

        # طرح‌بندی اصلی
        central_widget = QWidget()
        main_layout = QVBoxLayout(central_widget)
        main_layout.addWidget(header, alignment=Qt.AlignCenter)
        main_layout.addLayout(card_layout)
        main_layout.addWidget(table)

        self.setCentralWidget(central_widget)

        # انیمیشن منو
        self.anim_menu()

    def anim_menu(self):
        self.anim = QPropertyAnimation(self.menu_widget, b"geometry")
        self.anim.setDuration(800)
        self.anim.setStartValue(QRect(1300, 0, 0, 750))
        self.anim.setEndValue(QRect(1100, 0, 200, 750))
        self.anim.start()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = AdvancedUI()
    window.show()
    sys.exit(app.exec_())
