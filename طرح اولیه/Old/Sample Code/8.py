import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel,
    QTableWidget, QTableWidgetItem, QHeaderView, QFrame, QLineEdit, QGraphicsDropShadowEffect
)
from PyQt5.QtGui import QFont, QColor
from PyQt5.QtCore import Qt, QPropertyAnimation, QRect

class ProfessionalUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("نرم‌افزار مدیریت پرسنل")
        self.resize(1200, 800)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)

        # Main Content Area
        content_area = QWidget()
        content_layout = QVBoxLayout(content_area)

        # Advanced Search Bar
        search_bar = QLineEdit()
        search_bar.setPlaceholderText("جستجوی پیشرفته...")
        search_bar.setStyleSheet("padding: 12px; border-radius: 12px; background-color: rgba(236, 240, 241, 0.9);")

        # Dashboard Cards
        cards_container = QWidget()
        cards_layout = QHBoxLayout(cards_container)

        def create_card(title, value):
            card = QFrame()
            card.setStyleSheet("background-color: rgba(236, 240, 241, 0.9); border-radius: 20px;")
            shadow = QGraphicsDropShadowEffect(blurRadius=30, xOffset=0, yOffset=8, color=QColor(0,0,0,60))
            card.setGraphicsEffect(shadow)
            card_layout = QVBoxLayout(card)
            lbl_value = QLabel(value)
            lbl_title = QLabel(title)
            lbl_value.setFont(QFont("Segoe UI", 22, QFont.Bold))
            lbl_value.setAlignment(Qt.AlignCenter)
            lbl_value.setStyleSheet("color: #006D6F;")
            lbl_title.setAlignment(Qt.AlignCenter)
            lbl_title.setStyleSheet("color: #95A5A6;")
            card_layout.addWidget(lbl_value)
            card_layout.addWidget(lbl_title)
            return card

        cards = [
            create_card("پرسنل فعال", "120"),
            create_card("قرارداد فعال", "78"),
            create_card("مدارک ناقص", "12"),
            create_card("قرارداد منقضی", "5")
        ]

        for card in cards:
            cards_layout.addWidget(card)

        # Personnel Table
        table = QTableWidget(5, 4)
        table.setHorizontalHeaderLabels(["شناسه", "نام", "بخش", "وضعیت"])
        table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        table.setAlternatingRowColors(True)
        table.verticalHeader().setVisible(False)
        table.setEditTriggers(QTableWidget.NoEditTriggers)
        table.setSelectionBehavior(QTableWidget.SelectRows)
        table.setStyleSheet("background-color: rgba(255, 255, 255, 0.9); border-radius: 15px;")

        data = [
            ["101", "علی رضایی", "مدیریت", "فعال"],
            ["102", "سارا محمدی", "مالی", "فعال"],
            ["103", "حامد احمدی", "فنی", "فعال"],
            ["104", "سمیه حسینی", "منابع انسانی", "منقضی"],
            ["105", "محمد قاسمی", "اداری", "فعال"]
        ]

        for row, items in enumerate(data):
            for col, item in enumerate(items):
                table.setItem(row, col, QTableWidgetItem(item))

        # Interactive Sidebar (right side)
        sidebar = QFrame()
        sidebar.setFixedWidth(250)
        sidebar.setStyleSheet("background-color: rgba(0, 109, 111, 0.1); border-radius: 15px;")
        sidebar_layout = QVBoxLayout(sidebar)

        btn_names = ["داشبورد", "پرسنل", "قراردادها", "مدارک شناسایی", "مدارک پزشکی", "گزارش‌ها", "تنظیمات"]
        button_style = "padding: 15px; font-size: 15px; border-radius: 12px; color: #006D6F;"
        for name in btn_names:
            btn = QPushButton(name)
            btn.setStyleSheet(button_style)
            sidebar_layout.addWidget(btn)

        sidebar_layout.addStretch()

        # Add widgets to content layout
        content_layout.addWidget(search_bar)
        content_layout.addWidget(cards_container)
        content_layout.addWidget(table)

        # Add main content and sidebar to main layout
        main_layout.addWidget(content_area)
        main_layout.addWidget(sidebar)

        # Sidebar animation
        self.sidebar_anim = QPropertyAnimation(sidebar, b"geometry")
        sidebar.mousePressEvent = self.toggle_sidebar

    def toggle_sidebar(self, event):
        width = self.centralWidget().layout().itemAt(1).widget().width()
        if width == 250:
            self.sidebar_anim.setStartValue(QRect(self.width()-250, 0, 250, self.height()))
            self.sidebar_anim.setEndValue(QRect(self.width(), 0, 250, self.height()))
        else:
            self.sidebar_anim.setStartValue(QRect(self.width(), 0, 250, self.height()))
            self.sidebar_anim.setEndValue(QRect(self.width()-250, 0, 250, self.height()))
        self.sidebar_anim.setDuration(500)
        self.sidebar_anim.start()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ProfessionalUI()
    window.show()
    sys.exit(app.exec_())
