import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame,
    QGraphicsDropShadowEffect, QPushButton, QGridLayout
)
from PyQt5.QtGui import QFont, QColor
from PyQt5.QtCore import Qt, QTimer

class CounterWidget(QFrame):
    def __init__(self, title, target_value, color):
        super().__init__()
        self.target_value = target_value
        self.current_value = 0

        self.setFixedSize(220, 140)
        self.setStyleSheet(f"background-color: {color}; border-radius: 20px;")
        shadow = QGraphicsDropShadowEffect(blurRadius=25, xOffset=0, yOffset=8, color=QColor(0,0,0,70))
        self.setGraphicsEffect(shadow)

        layout = QVBoxLayout(self)

        self.lbl_value = QLabel(str(self.current_value))
        self.lbl_value.setFont(QFont("Segoe UI", 32, QFont.Bold))
        self.lbl_value.setAlignment(Qt.AlignCenter)
        self.lbl_value.setStyleSheet("color: white;")

        lbl_title = QLabel(title)
        lbl_title.setFont(QFont("Segoe UI", 14))
        lbl_title.setAlignment(Qt.AlignCenter)
        lbl_title.setStyleSheet("color: white;")

        layout.addWidget(self.lbl_value)
        layout.addWidget(lbl_title)

        self.timer = QTimer()
        self.timer.timeout.connect(self.update_counter)
        self.timer.start(30)

    def update_counter(self):
        if self.current_value < self.target_value:
            self.current_value += 1
            self.lbl_value.setText(str(self.current_value))
        else:
            self.timer.stop()

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

        # محتوای داشبورد اصلی
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setSpacing(25)
        layout.setContentsMargins(25, 25, 25, 25)

        title = QLabel("داشبورد مدیریت پیشرفته")
        title.setFont(QFont("Segoe UI", 24, QFont.Bold))
        title.setAlignment(Qt.AlignLeft)
        layout.addWidget(title)

        # کادرهای شمارشگر
        counters_layout = QGridLayout()
        counters_layout.setSpacing(20)

        counters = [
            ("تعداد پرسنل", 125, "#1abc9c"),
            ("قراردادهای فعال", 92, "#3498db"),
            ("مدارک ناقص", 14, "#e74c3c"),
            ("پرسنل جدید", 5, "#9b59b6")
        ]

        positions = [(i, j) for i in range(2) for j in range(2)]
        for position, (title, target, color) in zip(positions, counters):
            counter = CounterWidget(title, target, color)
            counters_layout.addWidget(counter, *position)

        layout.addLayout(counters_layout)
        layout.addStretch()

        main_layout.addWidget(content)
        main_layout.addWidget(sidebar)

# تابع اصلی اجرا
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = QMainWindow()
    window.setWindowTitle("داشبورد سازمانی پیشرفته")
    dashboard = DashboardWidget()
    window.setCentralWidget(dashboard)
    window.resize(1300, 800)
    window.show()
    sys.exit(app.exec_())
