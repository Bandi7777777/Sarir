import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QFrame, QHBoxLayout, QVBoxLayout,
    QPushButton, QLabel, QTableWidget, QTableWidgetItem, QHeaderView,
    QGraphicsDropShadowEffect, QLineEdit
)
from PyQt5.QtGui import QFont, QPixmap
from PyQt5.QtCore import Qt, QSize

class PersonnelUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("مدیریت پرسنل")
        self.resize(1050, 720)

        font = QFont("Segoe UI", 10)
        QApplication.setFont(font)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(15, 15, 15, 15)
        main_layout.setSpacing(20)

        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setSpacing(20)

        search_bar = QLineEdit()
        search_bar.setPlaceholderText("جستجوی پیشرفته...")
        search_bar.setStyleSheet("padding: 10px; border-radius: 15px; background-color: #ecf0f1;")

        cards_container = QWidget()
        cards_layout = QHBoxLayout(cards_container)
        cards_layout.setSpacing(20)

        def create_card(title, value):
            card = QFrame()
            shadow = QGraphicsDropShadowEffect(blurRadius=25, xOffset=0, yOffset=6)
            card.setGraphicsEffect(shadow)
            card.setStyleSheet("""
                background-color: rgba(236, 240, 241, 0.8);
                border-radius: 20px;
                border: 1px solid rgba(220,220,220,0.6);
            """)
            layout = QVBoxLayout(card)
            layout.setContentsMargins(20, 20, 20, 20)
            lbl_value = QLabel(value)
            lbl_title = QLabel(title)
            lbl_value.setFont(QFont("Segoe UI", 20, QFont.Bold))
            lbl_value.setAlignment(Qt.AlignCenter)
            lbl_value.setStyleSheet("color: #34495e;")
            lbl_title.setAlignment(Qt.AlignCenter)
            lbl_title.setStyleSheet("color: #7f8c8d;")
            layout.addWidget(lbl_value)
            layout.addWidget(lbl_title)
            return card

        cards = [
            create_card("تعداد پرسنل", "120"),
            create_card("قرارداد فعال", "78"),
            create_card("مدارک ناقص", "12")
        ]

        for card in cards:
            cards_layout.addWidget(card)

        profile_frame = QFrame()
        profile_layout = QHBoxLayout(profile_frame)
        profile_frame.setStyleSheet("background-color: rgba(236, 240, 241, 0.9); border-radius: 20px;")
        profile_image = QLabel()
        profile_image.setPixmap(QPixmap("profile.png").scaled(100, 100, Qt.KeepAspectRatio, Qt.SmoothTransformation))
        profile_layout.addWidget(profile_image)

        profile_info_layout = QVBoxLayout()
        profile_info_layout.addWidget(QLabel("محمد احمدی"))
        profile_info_layout.addWidget(QLabel("کد ملی: 1234567"))
        profile_info_layout.addWidget(QLabel("تاریخ تولد: 1370/05/15"))
        profile_layout.addLayout(profile_info_layout)

        table = QTableWidget(5, 3)
        table.setHorizontalHeaderLabels(["شناسه", "نام", "بخش"])
        table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        table.setAlternatingRowColors(True)
        table.setEditTriggers(QTableWidget.NoEditTriggers)
        table.setSelectionBehavior(QTableWidget.SelectRows)
        table.verticalHeader().setVisible(False)
        table.setStyleSheet("""
            QTableWidget {
                background-color: rgba(236, 240, 241, 0.9);
                alternate-background-color: rgba(189, 195, 199, 0.5);
                border-radius: 12px;
            }
            QHeaderView::section {
                background-color: #34495e;
                color: white;
                padding: 6px;
                border-radius: 10px;
            }
        """)

        menu_widget = QFrame()
        menu_widget.setFixedWidth(230)
        menu_widget.setStyleSheet("background-color: rgba(236, 240, 241, 0.8); border-radius: 12px;")
        menu_layout = QVBoxLayout(menu_widget)
        menu_layout.setSpacing(25)

        menu_items = ["داشبورد", "قراردادها", "مدارک شناسایی", "مدارک پزشکی"]

        button_style = """
            QPushButton {
                background-color: transparent;
                padding: 12px;
                border-radius: 10px;
                font-size: 15px;
                color: #34495e;
            }
            QPushButton:hover {
                background-color: rgba(52, 152, 219, 0.2);
                font-weight: bold;
            }
        """

        for name in menu_items:
            btn = QPushButton(name)
            btn.setStyleSheet(button_style)
            menu_layout.addWidget(btn)

        menu_layout.addStretch()

        content_layout.addWidget(search_bar)
        content_layout.addWidget(profile_frame)
        content_layout.addWidget(cards_container)
        content_layout.addWidget(table)

        main_layout.addWidget(content_widget, 5)
        main_layout.addWidget(menu_widget, 1)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PersonnelUI()
    window.show()
    sys.exit(app.exec_())
