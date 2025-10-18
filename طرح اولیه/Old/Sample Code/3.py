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
        self.resize(900, 600)

        font = QFont("Segoe UI", 10)
        QApplication.setFont(font)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(10, 10, 10, 10)
        main_layout.setSpacing(10)

        # Content Area
        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setSpacing(15)

        # Cards Container
        cards_container = QWidget()
        cards_layout = QHBoxLayout(cards_container)
        cards_layout.setSpacing(15)

        def create_card(title, value):
            card = QFrame()
            shadow = QGraphicsDropShadowEffect(blurRadius=15, xOffset=3, yOffset=3)
            card.setGraphicsEffect(shadow)
            card.setStyleSheet("background-color: #E8F8F5; border-radius: 10px;")
            layout = QVBoxLayout(card)
            layout.setContentsMargins(15, 15, 15, 15)
            lbl_value = QLabel(value)
            lbl_title = QLabel(title)
            lbl_value.setFont(QFont("Segoe UI", 18, QFont.Bold))
            lbl_value.setAlignment(Qt.AlignCenter)
            lbl_value.setStyleSheet("color: #006D6F;")
            lbl_title.setAlignment(Qt.AlignCenter)
            lbl_title.setStyleSheet("color: gray;")
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

        # Personnel Table
        table = QTableWidget(5, 3)
        table.setHorizontalHeaderLabels(["شناسه", "نام", "بخش"])
        sample_data = [
            ["101", "علی رضایی", "مدیریت"],
            ["102", "سارا محمدی", "مالی"],
            ["103", "حامد احمدی", "فنی"],
            ["104", "سمیه حسینی", "منابع انسانی"],
            ["105", "محمد قاسمی", "اداری"]
        ]
        for i, row in enumerate(sample_data):
            for j, item in enumerate(row):
                table.setItem(i, j, QTableWidgetItem(item))
        table.setEditTriggers(QTableWidget.NoEditTriggers)
        table.setAlternatingRowColors(True)
        table.setShowGrid(False)
        table.verticalHeader().setVisible(False)
        header = table.horizontalHeader()
        header.setSectionResizeMode(QHeaderView.Stretch)
        header.setStyleSheet(
            "QHeaderView::section {background-color: #006D6F; color: white; padding: 6px;}"
        )
        table.setStyleSheet(
            "QTableWidget {background-color: white; alternate-background-color: #F8F9F9; border-radius: 10px;}"
        )

        content_layout.addWidget(cards_container)
        content_layout.addWidget(table)

        # Menu Area
        menu_widget = QFrame()
        menu_widget.setFixedWidth(200)
        menu_widget.setStyleSheet("background-color: #F0F0F0; border-radius: 8px;")
        menu_layout = QVBoxLayout(menu_widget)
        menu_layout.setSpacing(15)

        style = QApplication.style()
        menu_items = [
            ("داشبورد", QStyle.SP_DirHomeIcon),
            ("پرسنل", QStyle.SP_FileIcon),
            ("قراردادها", QStyle.SP_DriveHDIcon),
            ("مدارک", QStyle.SP_FileDialogListView),
            ("گزارش‌ها", QStyle.SP_DesktopIcon),
            ("تنظیمات", QStyle.SP_FileDialogDetailedView)
        ]

        button_style = """
            QPushButton {
                background-color: transparent; padding: 8px; text-align: right;
            }
            QPushButton:hover {
                background-color: #D6EAF8; border-radius: 4px;
            }
        """

        for name, icon in menu_items:
            btn = QPushButton(name)
            btn.setIcon(style.standardIcon(icon))
            btn.setIconSize(QSize(20, 20))
            btn.setStyleSheet(button_style)
            menu_layout.addWidget(btn)

        menu_layout.addStretch()

        main_layout.addWidget(content_widget, 4)
        main_layout.addWidget(menu_widget, 1)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PersonnelUI()
    window.show()
    sys.exit(app.exec_())
