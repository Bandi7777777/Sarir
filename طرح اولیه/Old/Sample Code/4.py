import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QLabel, QPushButton,
    QHBoxLayout, QTableWidget, QTableWidgetItem, QHeaderView
)
from PyQt5.QtGui import QFont, QIcon
from PyQt5.QtCore import Qt

class ModernPersonnelUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("مدیریت پرسنل")
        self.setGeometry(100, 100, 900, 600)
        self.setStyleSheet(open("style.qss", "r", encoding="utf-8").read())

        # فونت پیش‌فرض
        font = QFont("IRANSans", 10)
        self.setFont(font)

        # ویجت مرکزی
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # لایه اصلی
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(15)

        # عنوان
        title_label = QLabel("داشبورد مدیریت پرسنل")
        title_label.setObjectName("TitleLabel")
        title_label.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(title_label)

        # دکمه‌ها
        button_layout = QHBoxLayout()
        add_button = QPushButton("افزودن پرسنل")
        edit_button = QPushButton("ویرایش اطلاعات")
        delete_button = QPushButton("حذف پرسنل")
        for btn in [add_button, edit_button, delete_button]:
            btn.setCursor(Qt.PointingHandCursor)
            button_layout.addWidget(btn)
        main_layout.addLayout(button_layout)

        # جدول پرسنل
        self.table = QTableWidget()
        self.table.setColumnCount(3)
        self.table.setHorizontalHeaderLabels(["شناسه", "نام", "بخش"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.setAlternatingRowColors(True)
        self.table.setEditTriggers(QTableWidget.NoEditTriggers)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setObjectName("PersonnelTable")
        main_layout.addWidget(self.table)

        # داده‌های نمونه
        sample_data = [
            ["101", "علی رضایی", "مدیریت"],
            ["102", "سارا محمدی", "مالی"],
            ["103", "حامد احمدی", "فنی"],
            ["104", "سمیه حسینی", "منابع انسانی"],
            ["105", "محمد قاسمی", "اداری"]
        ]
        self.table.setRowCount(len(sample_data))
        for row_idx, row_data in enumerate(sample_data):
            for col_idx, item in enumerate(row_data):
                self.table.setItem(row_idx, col_idx, QTableWidgetItem(item))

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = ModernPersonnelUI()
    window.show()
    sys.exit(app.exec_())
