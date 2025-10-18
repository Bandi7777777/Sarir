import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel,
    QTableWidget, QTableWidgetItem, QHeaderView, QFrame, QLineEdit, QGraphicsDropShadowEffect,
    QProgressBar, QComboBox
)
from PyQt5.QtGui import QFont, QColor, QPixmap
from PyQt5.QtCore import Qt, QSize

class EnhancedProfessionalUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("نرم‌افزار مدیریت پرسنل")
        self.resize(1300, 850)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)

        # Main Content Area (Optimized)
        content_area = QWidget()
        content_layout = QVBoxLayout(content_area)

        # Advanced Search Bar
        search_bar = QLineEdit()
        search_bar.setPlaceholderText("جستجوی سریع اطلاعات پرسنل...")
        search_bar.setStyleSheet("padding: 15px; border-radius: 15px; background-color: rgba(236, 240, 241, 0.9);")

        # Enhanced Dashboard Cards
        cards_container = QWidget()
        cards_layout = QHBoxLayout(cards_container)

        def create_enhanced_card(title, value, progress):
            card = QFrame()
            card.setFixedSize(220, 150)
            card.setStyleSheet("background-color: rgba(236, 240, 241, 0.95); border-radius: 20px;")
            shadow = QGraphicsDropShadowEffect(blurRadius=40, xOffset=0, yOffset=10, color=QColor(0,0,0,70))
            card.setGraphicsEffect(shadow)
            card_layout = QVBoxLayout(card)
            lbl_value = QLabel(value)
            lbl_title = QLabel(title)
            progress_bar = QProgressBar()
            progress_bar.setValue(progress)
            progress_bar.setTextVisible(False)
            progress_bar.setFixedHeight(8)
            progress_bar.setStyleSheet("QProgressBar {border-radius: 4px;} QProgressBar::chunk {background-color: #006D6F; border-radius: 4px;}")
            lbl_value.setFont(QFont("Segoe UI", 22, QFont.Bold))
            lbl_value.setAlignment(Qt.AlignCenter)
            lbl_value.setStyleSheet("color: #006D6F;")
            lbl_title.setAlignment(Qt.AlignCenter)
            lbl_title.setStyleSheet("color: #95A5A6;")
            card_layout.addWidget(lbl_value)
            card_layout.addWidget(lbl_title)
            card_layout.addWidget(progress_bar)
            return card

        cards = [
            create_enhanced_card("پرسنل فعال", "120", 80),
            create_enhanced_card("قرارداد فعال", "78", 60),
            create_enhanced_card("مدارک ناقص", "12", 30),
            create_enhanced_card("قرارداد منقضی", "5", 20)
        ]

        for card in cards:
            cards_layout.addWidget(card)

        # Personnel Table Enhanced
        table = QTableWidget(7, 6)
        table.setHorizontalHeaderLabels(["عکس", "شناسه", "نام", "بخش", "وضعیت", "عملیات"])
        table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        table.setAlternatingRowColors(True)
        table.verticalHeader().setVisible(False)
        table.setEditTriggers(QTableWidget.NoEditTriggers)
        table.setSelectionBehavior(QTableWidget.SelectRows)
        table.setStyleSheet("background-color: rgba(255, 255, 255, 0.95); border-radius: 20px;")

        data = [
            ["profile1.png", "101", "علی رضایی", "مدیریت", "فعال"],
            ["profile2.png", "102", "سارا محمدی", "مالی", "فعال"],
            ["profile3.png", "103", "حامد احمدی", "فنی", "فعال"],
            ["profile4.png", "104", "سمیه حسینی", "منابع انسانی", "منقضی"],
            ["profile5.png", "105", "محمد قاسمی", "اداری", "فعال"],
            ["profile6.png", "106", "رضا نوری", "پشتیبانی", "فعال"],
            ["profile7.png", "107", "نگار حیدری", "مالی", "فعال"]
        ]

        for row, items in enumerate(data):
            image_label = QLabel()
            image_label.setPixmap(QPixmap(items[0]).scaled(QSize(50, 50), Qt.KeepAspectRatio, Qt.SmoothTransformation))
            table.setCellWidget(row, 0, image_label)
            for col, item in enumerate(items[1:], 1):
                table.setItem(row, col, QTableWidgetItem(item))

            operations_combo = QComboBox()
            operations_combo.addItems(["مشاهده", "ویرایش", "حذف"])
            table.setCellWidget(row, 5, operations_combo)

        # Interactive Sidebar (right side)
        sidebar = QFrame()
        sidebar.setFixedWidth(250)
        sidebar.setStyleSheet("background-color: rgba(0, 109, 111, 0.15); border-radius: 20px;")
        sidebar_layout = QVBoxLayout(sidebar)

        btn_names = ["داشبورد", "پرسنل", "قراردادها", "مدارک شناسایی", "مدارک پزشکی", "گزارش‌ها", "تنظیمات"]
        button_style = "padding: 18px; font-size: 16px; border-radius: 15px; color: #006D6F;"
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

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = EnhancedProfessionalUI()
    window.show()
    sys.exit(app.exec_())
