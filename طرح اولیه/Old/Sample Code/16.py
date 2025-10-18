import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame,
    QPushButton, QListWidget, QListWidgetItem, QCalendarWidget, QLineEdit, QComboBox, QTextEdit
)
from PyQt5.QtGui import QFont, QPixmap
from PyQt5.QtCore import Qt, QLocale

class DashboardWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.setLayoutDirection(Qt.RightToLeft)
        self.setup_ui()

    def setup_ui(self):
        main_layout = QHBoxLayout(self)

        # Sidebar
        sidebar = QFrame()
        sidebar.setFixedWidth(220)
        sidebar.setStyleSheet("background:#20B2AA;border-radius:10px;")
        sidebar_layout = QVBoxLayout(sidebar)

        for item in ["داشبورد", "مدیریت پرسنل", "قراردادها", "مدارک شناسایی", "گزارش‌ها", "تنظیمات"]:
            btn = QPushButton(item)
            btn.setFont(QFont("IRANSans", 12))
            btn.setStyleSheet("color:white;padding:8px;text-align:right;background:transparent;")
            sidebar_layout.addWidget(btn)
        sidebar_layout.addStretch()

        # Main content
        content_layout = QVBoxLayout()

        title = QLabel("داشبورد مدیریتی")
        title.setFont(QFont("IRANSans", 20, QFont.Bold))
        title.setAlignment(Qt.AlignCenter)
        content_layout.addWidget(title)

        # Cards (Single Row)
        cards_layout = QHBoxLayout()
        cards_layout.setSpacing(10)
        card_info = [("تعداد پرسنل", "128", "#3498DB"),
                     ("قرارداد فعال", "97", "#1ABC9C"),
                     ("مدارک ناقص", "16", "#F39C12"),
                     ("نزدیک‌ترین انقضا", "1403/03/30", "#8E44AD")]

        for title_text, value, color in card_info:
            card = QFrame()
            card.setFixedSize(180, 90)
            card.setStyleSheet(f"background:{color};border-radius:10px;")
            layout = QVBoxLayout(card)
            val_label = QLabel(value)
            val_label.setFont(QFont("IRANSans", 16, QFont.Bold))
            val_label.setAlignment(Qt.AlignCenter)
            val_label.setStyleSheet("color:white;")

            title_label = QLabel(title_text)
            title_label.setFont(QFont("IRANSans", 9))
            title_label.setAlignment(Qt.AlignRight)
            title_label.setStyleSheet("color:white;padding-right:5px;")

            layout.addWidget(val_label)
            layout.addWidget(title_label)
            cards_layout.addWidget(card)

        content_layout.addLayout(cards_layout)

        # Notifications & Tasks
        notif_tasks_layout = QHBoxLayout()

        notif_frame = self.create_list("اعلان‌ها", ["⚠️ قرارداد منقضی شد", "📌 مدارک ناقص است", "📅 جلسه امروز ساعت 15"], height=100)
        tasks_frame = self.create_list("لیست وظایف روزانه", ["بررسی مدارک علی رضایی", "تایید قرارداد جدید", "ارسال گزارش"], height=100)

        notif_tasks_layout.addWidget(notif_frame)
        notif_tasks_layout.addWidget(tasks_frame)

        content_layout.addLayout(notif_tasks_layout)

        # Advanced search & Quick reports
        mid_layout = QHBoxLayout()

        # Advanced Search
        search_frame = QFrame()
        search_frame.setStyleSheet("background:#ECF0F1;border-radius:10px;padding:10px;")
        search_layout = QVBoxLayout(search_frame)
        search_frame.setFixedHeight(200)
        search_frame.setFixedWidth(300)

        search_label = QLabel("جستجوی پیشرفته")
        search_label.setFont(QFont("IRANSans", 10, QFont.Bold))
        search_label.setAlignment(Qt.AlignRight)

        self.search_input = QLineEdit()
        self.search_input.setFont(QFont("IRANSans", 10))
        self.search_input.setPlaceholderText("جستجو در همه بخش‌ها...")
        self.search_input.setStyleSheet("background:white;border-radius:8px;padding:5px;")
        self.search_input.textChanged.connect(self.on_search)

        self.search_result_img = QLabel()
        self.search_result_img.setFixedSize(50, 50)
        self.search_result_img.setAlignment(Qt.AlignCenter)
        self.search_result_img.hide()

        self.search_result_label = QLabel()
        self.search_result_label.setFont(QFont("IRANSans", 9))
        self.search_result_label.setAlignment(Qt.AlignCenter)
        self.search_result_label.hide()

        search_layout.addWidget(search_label)
        search_layout.addWidget(self.search_input)
        search_layout.addWidget(self.search_result_img)
        search_layout.addWidget(self.search_result_label)

        # Quick Reports
        report_frame = QFrame()
        report_frame.setStyleSheet("background:#ECF0F1;border-radius:10px;padding:10px;")
        report_layout = QVBoxLayout(report_frame)
        report_frame.setFixedHeight(200)
        report_frame.setFixedWidth(600)

        report_label = QLabel("گزارش‌های سریع")
        report_label.setFont(QFont("IRANSans", 10, QFont.Bold))
        report_label.setAlignment(Qt.AlignRight)

        report_combo = QComboBox()
        report_combo.setFont(QFont("IRANSans", 10))
        report_combo.addItems(["گزارش مالی", "گزارش منابع انسانی", "گزارش پروژه‌ها"])
        report_combo.setStyleSheet("background:white;border-radius:8px;padding:5px;")

        report_layout.addWidget(report_label)
        report_layout.addWidget(report_combo)

        mid_layout.addWidget(search_frame)
        mid_layout.addWidget(report_frame)

        content_layout.addLayout(mid_layout)

        # Calendar and Notes
        bottom_layout = QHBoxLayout()

        # Calendar
        calendar = QCalendarWidget()
        calendar.setLocale(QLocale(QLocale.Persian, QLocale.Iran))
        calendar.setGridVisible(True)
        calendar.setStyleSheet("background:white;border-radius:8px;")
        calendar.setFixedHeight(200)
        calendar.setFixedWidth(400)

        # Notes
        notes_frame = QFrame()
        notes_frame.setStyleSheet("background:#ECF0F1;border-radius:10px;padding:10px;")
        notes_layout = QVBoxLayout(notes_frame)
        notes_frame.setFixedHeight(200)
        notes_frame.setFixedWidth(400)

        notes_label = QLabel("یادداشت‌ها و یادآورها")
        notes_label.setFont(QFont("IRANSans", 10, QFont.Bold))
        notes_label.setAlignment(Qt.AlignRight)

        notes_text = QTextEdit()
        notes_text.setFont(QFont("IRANSans", 10))
        notes_text.setPlaceholderText("یادداشت خود را وارد کنید...")

        notes_layout.addWidget(notes_label)
        notes_layout.addWidget(notes_text)

        bottom_layout.addWidget(calendar)
        bottom_layout.addWidget(notes_frame)

        content_layout.addLayout(bottom_layout)

        main_layout.addWidget(sidebar)
        main_layout.addLayout(content_layout)

    def create_list(self, title, items, height=150):
        frame = QFrame()
        layout = QVBoxLayout(frame)

        label = QLabel(title)
        label.setFont(QFont("IRANSans", 10, QFont.Bold))
        label.setAlignment(Qt.AlignRight)

        lst = QListWidget()
        lst.setFont(QFont("IRANSans", 10))
        lst.setStyleSheet("background:white;border-radius:8px;padding:5px;")
        lst.setFixedHeight(height)
        for item in items:
            lst.addItem(QListWidgetItem(item))

        layout.addWidget(label)
        layout.addWidget(lst)
        return frame

    def on_search(self, text):
        if "علی" in text or "1234" in text:
            pixmap = QPixmap("employee.jpg").scaled(50,50, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            self.search_result_img.setPixmap(pixmap)
            self.search_result_label.setText("علی رضایی - 1234")
            self.search_result_img.show()
            self.search_result_label.show()
        else:
            self.search_result_img.hide()
            self.search_result_label.hide()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setFont(QFont("IRANSans", 10))
    window = QMainWindow()
    window.setWindowTitle("نرم‌افزار مدیریت سازمان")
    dashboard = DashboardWidget()
    window.setCentralWidget(dashboard)
    window.resize(1400, 900)
    window.show()
    sys.exit(app.exec_())
