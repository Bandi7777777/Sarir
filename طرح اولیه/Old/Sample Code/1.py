# Beautiful UI with PyQt5
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QLabel, QHBoxLayout,
    QPushButton, QTableWidget, QTableWidgetItem, QFrame
)
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt
import sys

class BeautifulUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("مدیریت پرسنل - داشبورد")
        self.setGeometry(100, 100, 1200, 700)
        self.setLayoutDirection(Qt.RightToLeft)
        self.setStyleSheet("background-color: #EFEFEF; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;")

        # منوی عمودی سمت راست
        menu_widget = QWidget()
        menu_layout = QVBoxLayout(menu_widget)
        menu_layout.setAlignment(Qt.AlignTop)

        buttons = ["داشبورد", "پرسنل", "قراردادها", "مدارک", "گزارش‌ها", "تنظیمات"]
        for btn in buttons:
            button = QPushButton(btn)
            button.setFixedHeight(40)
            button.setStyleSheet("""
                QPushButton {
                    background-color: #006D6F; color: #FFFFFF; border: none; 
                    border-radius: 8px; margin: 5px; font-size: 14px;
                }
                QPushButton:hover {
                    background-color: #004C4D;
                }
            """)
            menu_layout.addWidget(button)

        # داشبورد مرکزی
        dashboard_widget = QWidget()
        dashboard_layout = QVBoxLayout(dashboard_widget)
        
        title = QLabel("داشبورد مدیریتی")
        title.setFont(QFont('Segoe UI', 20, QFont.Bold))
        dashboard_layout.addWidget(title, alignment=Qt.AlignCenter)

        stats_layout = QHBoxLayout()
        stats_layout.setSpacing(15)

        # کارت‌های آماری
        stats = [("پرسنل فعال", "125"), ("قرارداد فعال", "78"), ("مدارک ناقص", "12")]
        for stat, count in stats:
            card = QFrame()
            card.setFixedSize(200, 120)
            card.setStyleSheet("""
                QFrame {
                    background-color: #FFFFFF; border-radius: 15px; 
                    border: 1px solid #DDDDDD;
                }
            """)
            card_layout = QVBoxLayout(card)
            lbl_stat = QLabel(stat)
            lbl_stat.setFont(QFont('Segoe UI', 12))
            lbl_count = QLabel(count)
            lbl_count.setFont(QFont('Segoe UI', 30, QFont.Bold))
            lbl_count.setStyleSheet("color: #006D6F;")
            lbl_count.setAlignment(Qt.AlignCenter)
            card_layout.addWidget(lbl_stat, alignment=Qt.AlignCenter)
            card_layout.addWidget(lbl_count, alignment=Qt.AlignCenter)
            stats_layout.addWidget(card)

        dashboard_layout.addLayout(stats_layout)

        # جدول نمونه
        table = QTableWidget(5, 3)
        table.setHorizontalHeaderLabels(["نام", "سمت", "وضعیت قرارداد"])
        sample_data = [
            ("علی رضایی", "مدیر پروژه", "فعال"),
            ("سارا محمدی", "کارشناس مالی", "رو به اتمام"),
            ("حامد احمدی", "تکنسین فنی", "منقضی شده"),
            ("سمیه حسینی", "مدیر منابع انسانی", "فعال"),
            ("محمد قاسمی", "کارمند اداری", "فعال")
        ]
        table.setStyleSheet("background-color: #FFFFFF; border-radius: 10px;")
        for row, (name, role, status) in enumerate(sample_data):
            table.setItem(row, 0, QTableWidgetItem(name))
            table.setItem(row, 1, QTableWidgetItem(role))
            table.setItem(row, 2, QTableWidgetItem(status))
        dashboard_layout.addWidget(table)

        # طرح‌بندی کلی
        central_widget = QWidget()
        central_layout = QHBoxLayout(central_widget)
        central_layout.addWidget(dashboard_widget, stretch=5)
        central_layout.addWidget(menu_widget, stretch=1)

        self.setCentralWidget(central_widget)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = BeautifulUI()
    window.show()
    sys.exit(app.exec_())
