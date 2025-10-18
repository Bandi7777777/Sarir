import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QFrame, QHBoxLayout, QVBoxLayout,
    QPushButton, QLabel, QTableWidget, QTableWidgetItem, QHeaderView,
    QGraphicsDropShadowEffect, QStyle
)
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt, QSize

class PersonnelUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("مدیریت پرسنل")
        self.resize(1000, 700)

        font = QFont("Segoe UI", 10)
        QApplication.setFont(font)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(15, 15, 15, 15)
        main_layout.setSpacing(20)

        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setSpacing(25)

        cards_container = QWidget()
        cards_layout = QHBoxLayout(cards_container)
        cards_layout.setSpacing(25)

        def create_card(title, value):
            card = QFrame()
            shadow = QGraphicsDropShadowEffect(blurRadius=25, xOffset=0, yOffset=6)
            card.setGraphicsEffect(shadow)
            card.setStyleSheet("""
                background-color: rgba(255, 255, 255, 0.85);
                border-radius: 20px;
                border: 1px solid rgba(220,220,220,0.6);
            """)
            layout = QVBoxLayout(card)
            layout.setContentsMargins(25, 25, 25, 25)
            lbl_value = QLabel(value)
            lbl_title = QLabel(title)
            lbl_value.setFont(QFont("Segoe UI", 22, QFont.Bold))
            lbl_value.setAlignment(Qt.AlignCenter)
            lbl_value.setStyleSheet("color: #2C3E50;")
            lbl_title.setAlignment(Qt.AlignCenter)
            lbl_title.setStyleSheet("color: #95A5A6;")
            layout.addWidget(lbl_value)
            layout.addWidget(lbl_title)
            return card

        cards = [
            create_card("تعداد پرسنل", "120"),
            create_card("قرارداد فعال", "78"),
            create_card("مدارک ناقص", "12"),
            create_card("قرارداد منقضی", "5")
        ]

        for card in cards:
            cards_layout.addWidget(card)

        table = QTableWidget(6, 4)
        table.setHorizontalHeaderLabels(["شناسه", "نام", "بخش", "وضعیت"])
        table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        table.setAlternatingRowColors(True)
        table.setEditTriggers(QTableWidget.NoEditTriggers)
        table.setSelectionBehavior(QTableWidget.SelectRows)
        table.verticalHeader().setVisible(False)
        table.setStyleSheet("""
            QTableWidget {
                background-color: rgba(255, 255, 255, 0.95);
                alternate-background-color: rgba(245, 245, 245, 0.95);
                border-radius: 12px;
            }
            QHeaderView::section {
                background-color: #2C3E50;
                color: white;
                padding: 8px;
                border-radius: 10px;
            }
        """)

        sample_data = [
            ["101", "علی رضایی", "مدیریت", "فعال"],
            ["102", "سارا محمدی", "مالی", "فعال"],
            ["103", "حامد احمدی", "فنی", "فعال"],
            ["104", "سمیه حسینی", "منابع انسانی", "منقضی"],
            ["105", "محمد قاسمی", "اداری", "فعال"],
            ["106", "زینب کریمی", "پشتیبانی", "فعال"]
        ]

        for i, row in enumerate(sample_data):
            for j, item in enumerate(row):
                table.setItem(i, j, QTableWidgetItem(item))

        content_layout.addWidget(cards_container)
        content_layout.addWidget(table)

        menu_widget = QFrame()
        menu_widget.setFixedWidth(230)
        menu_widget.setStyleSheet("background-color: rgba(52, 73, 94, 0.9); border-radius: 12px;")
        menu_layout = QVBoxLayout(menu_widget)
        menu_layout.setSpacing(25)

        menu_items = [
            "داشبورد",
            "پرسنل",
            "قراردادها",
            "مدارک",
            "گزارش‌ها",
            "تنظیمات"
        ]

        button_style = """
            QPushButton {
                background-color: transparent;
                color: white;
                padding: 12px;
                text-align: center;
                border-radius: 10px;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: rgba(41, 128, 185, 0.6);
                font-weight: bold;
            }
        """

        for name in menu_items:
            btn = QPushButton(name)
            btn.setStyleSheet(button_style)
            menu_layout.addWidget(btn)

        menu_layout.addStretch()

        main_layout.addWidget(content_widget, 5)
        main_layout.addWidget(menu_widget, 1)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PersonnelUI()
    window.show()
    sys.exit(app.exec_())
