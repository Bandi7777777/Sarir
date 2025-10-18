import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QLabel, QTableWidget, QTableWidgetItem, QHeaderView, QFrame, QLineEdit,
    QGraphicsDropShadowEffect, QToolButton, QAbstractItemView, QScrollArea,
    QGridLayout, QCalendarWidget, QSplitter, QComboBox, QTabWidget, QListWidget,
    QDialog, QFormLayout, QDateEdit, QMessageBox
)
from PyQt5.QtGui import QFont, QColor, QPalette, QBrush, QIcon
from PyQt5.QtCore import Qt, QPropertyAnimation, QEasingCurve, QDate, QLocale
from khayyam import JalaliDate

class AddEventDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("افزودن رویداد")
        self.setModal(True)
        self.layout = QFormLayout(self)
        self.layout.setLabelAlignment(Qt.AlignRight)
        self.event_name = QLineEdit()
        self.event_date = QDateEdit()
        self.event_date.setDate(QDate.currentDate())
        self.layout.addRow("نام رویداد:", self.event_name)
        self.layout.addRow("تاریخ رویداد:", self.event_date)
        self.add_button = QPushButton("افزودن")
        self.add_button.clicked.connect(self.accept)
        self.layout.addRow(self.add_button)
        for i in range(self.layout.rowCount()):
            label = self.layout.itemAt(i, QFormLayout.LabelRole).widget()
            label.setAlignment(Qt.AlignRight)
            field = self.layout.itemAt(i, QFormLayout.FieldRole).widget()
            if field:
                field.setAlignment(Qt.AlignRight)

    def get_data(self):
        q_date = self.event_date.date()
        jalali_date = JalaliDate(q_date.year(), q_date.month(), q_date.day()).todate()
        return self.event_name.text(), QDate(jalali_date.year, jalali_date.month, jalali_date.day)

class PersonnelManagementUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.is_dark_mode = False
        self.is_sidebar_expanded = True
        self.setWindowTitle("نرم‌افزار مدیریت پرسنل")
        self.setGeometry(100, 100, 1200, 800)

        QLocale.setDefault(QLocale(QLocale.Persian, QLocale.Iran))

        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QHBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)
        self.central_widget.setLayoutDirection(Qt.RightToLeft)

        self.setup_theme()

        self.splitter = QSplitter(Qt.Horizontal)
        self.main_layout.addWidget(self.splitter)

        self.create_sidebar()
        self.splitter.addWidget(self.sidebar)

        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.content_widget = QWidget()
        self.scroll_area.setWidget(self.content_widget)
        self.content_layout = QVBoxLayout(self.content_widget)
        self.content_layout.setContentsMargins(15, 15, 15, 15)
        self.content_layout.setSpacing(15)
        self.splitter.addWidget(self.scroll_area)

        self.create_header()
        self.create_personnel_tabs()
        self.create_calendar_with_events()
        self.create_action_panel()

        self.setup_animations()

    def setup_theme(self):
        if self.is_dark_mode:
            self.bg_color = "#1e1e1e"
            self.card_bg = "#2a2a2a"
            self.text_color = "#e0e0e0"
            self.primary_color = "#4db6ac"
            self.sidebar_bg = "qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #252525, stop:1 #1a3c34)"
            self.accent_color = "#80cbc4"
        else:
            self.bg_color = "#f0f0f0"
            self.card_bg = "#ffffff"
            self.text_color = "#333333"
            self.primary_color = "#00897b"
            self.sidebar_bg = "qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #e0f2f1, stop:1 #b2dfdb)"
            self.accent_color = "#4db6ac"

        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(self.bg_color))
        palette.setColor(QPalette.WindowText, QColor(self.text_color))
        self.setPalette(palette)

        self.card_style = f"""
            background-color: {self.card_bg};
            border-radius: 15px;
            padding: 15px;
            border: 1px solid {self.accent_color};
        """
        self.button_style = f"""
            background-color: {self.primary_color};
            color: white;
            border: none;
            padding: 10px;
            border-radius: 8px;
            font-family: 'Arial';
            font-size: 14px;
        """
        self.sidebar_button_style = f"""
            QPushButton {{
                background-color: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #4db6ac, stop:1 #80cbc4);
                color: white;
                border: 1px solid {self.accent_color};
                padding: 15px;
                text-align: right;
                font-family: 'Arial';
                font-size: 21px;
                border-radius: 12px;
                margin: 8px 0;
                transition: all 0.3s ease;
            }}
            QPushButton:hover {{
                background-color: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #80cbc4, stop:1 #4db6ac);
                color: white;
                transform: scale(1.05);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
            }}
        """

    def create_header(self):
        header = QWidget()
        header_layout = QHBoxLayout(header)
        header_layout.setContentsMargins(0, 0, 0, 15)

        title = QLabel("مدیریت پرسنل")
        title.setFont(QFont("Arial", 28, QFont.Bold))
        title.setStyleSheet(f"color: {self.primary_color};")
        title.setAlignment(Qt.AlignRight)
        header_layout.addWidget(title)
        header_layout.addStretch()

        search = QLineEdit()
        search.setPlaceholderText("جستجوی پرسنل...")
        search.setFixedWidth(300)
        search.setStyleSheet(f"""
            background-color: {self.card_bg};
            border: 1px solid {self.accent_color};
            border-radius: 10px;
            padding: 8px;
            color: {self.text_color};
            font-family: 'Arial';
            font-size: 14px;
        """)
        search.setLayoutDirection(Qt.RightToLeft)
        search.textChanged.connect(self.filter_table)
        header_layout.addWidget(search)

        theme_btn = QToolButton()
        theme_btn.setText("🌙" if self.is_dark_mode else "☀️")
        theme_btn.setStyleSheet(f"""
            border: none;
            padding: 10px;
            color: {self.text_color};
            font-size: 24px;
        """)
        theme_btn.clicked.connect(self.toggle_theme)
        header_layout.addWidget(theme_btn)

        self.content_layout.addWidget(header)

    def create_personnel_tabs(self):
        tabs = QTabWidget()
        tabs.setStyleSheet(f"background-color: {self.card_bg}; color: {self.text_color};")
        tabs.setLayoutDirection(Qt.RightToLeft)
        tabs.addTab(self.create_personal_info_tab(), "اطلاعات شخصی")
        tabs.addTab(self.create_job_info_tab(), "اطلاعات شغلی")
        self.content_layout.addWidget(tabs)

    def create_personal_info_tab(self):
        tab = QWidget()
        layout = QGridLayout(tab)
        layout.setSpacing(10)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setAlignment(Qt.AlignLeft)

        labels = ["نام:", "کد ملی:", "تاریخ تولد:", "آدرس:"]
        values = ["علی محمدی", "۱۲۳۴۵۶۷۸۹۰", "۱۳۶۰/۰۵/۱۵", "تهران، خیابان آزادی"]

        for i, (label_text, value_text) in enumerate(zip(labels, values)):
            cell_frame = QFrame()
            cell_frame.setStyleSheet(f"""
                background-color: {self.card_bg};
                border: 1px solid {self.accent_color};
                border-radius: 8px;
                padding: 5px;
            """)
            cell_layout = QHBoxLayout(cell_frame)
            cell_layout.setAlignment(Qt.AlignLeft)

            label = QLabel(label_text)
            label.setFont(QFont("Arial", 12))
            label.setAlignment(Qt.AlignLeft)
            value = QLabel(value_text)
            value.setFont(QFont("Arial", 12))
            value.setAlignment(Qt.AlignLeft)

            cell_layout.addWidget(value)
            cell_layout.addWidget(label)
            layout.addWidget(cell_frame, i, 0)

        tab.setFixedHeight(150)
        return tab

    def create_job_info_tab(self):
        tab = QWidget()
        layout = QGridLayout(tab)
        layout.setSpacing(10)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setAlignment(Qt.AlignLeft)

        labels = ["سمت:", "تاریخ شروع:", "وضعیت:", "حقوق:"]
        values = ["برنامه‌نویس", "۱۴۰۲/۰۱/۰۱", "فعال", "۵۰,۰۰۰,۰۰۰ ریال"]

        for i, (label_text, value_text) in enumerate(zip(labels, values)):
            cell_frame = QFrame()
            cell_frame.setStyleSheet(f"""
                background-color: {self.card_bg};
                border: 1px solid {self.accent_color};
                border-radius: 8px;
                padding: 5px;
            """)
            cell_layout = QHBoxLayout(cell_frame)
            cell_layout.setAlignment(Qt.AlignLeft)

            label = QLabel(label_text)
            label.setFont(QFont("Arial", 12))
            label.setAlignment(Qt.AlignLeft)
            value = QLabel(value_text)
            value.setFont(QFont("Arial", 12))
            value.setAlignment(Qt.AlignLeft)

            cell_layout.addWidget(value)
            cell_layout.addWidget(label)
            layout.addWidget(cell_frame, i, 0)

        tab.setFixedHeight(150)
        return tab

    def create_calendar_with_events(self):
        calendar_frame = QFrame()
        calendar_frame.setStyleSheet(self.card_style)
        calendar_layout = QHBoxLayout(calendar_frame)

        calendar = QCalendarWidget()
        calendar.setLocale(QLocale(QLocale.Persian, QLocale.Iran))
        calendar.setStyleSheet(f"""
            QCalendarWidget {{
                background-color: {self.card_bg};
                border: 2px solid {self.accent_color};
                font-size: 14px;
                color: {self.text_color};
            }}
            QCalendarWidget QAbstractItemView {{
                selection-background-color: {self.primary_color};
                selection-color: white;
            }}
        """)
        calendar.setFixedSize(400, 300)
        calendar_layout.addWidget(calendar)

        events_list = QListWidget()
        events_list.setStyleSheet(f"""
            background-color: {self.card_bg};
            color: {self.text_color};
            font-size: 14px;
            text-align: right;
        """)
        events_list.addItems(["جلسه تیم: ۱۴۰۳/۰۱/۰۱", "تعطیلات: ۱۴۰۳/۰۲/۱۵"])
        events_list.setLayoutDirection(Qt.RightToLeft)
        events_list.setFixedWidth(800)
        calendar_layout.addWidget(events_list)

        add_event_btn = QPushButton("افزودن رویداد")
        add_event_btn.setStyleSheet(self.button_style + " width: 20px; height: 40px; font-size: 18px;")
        add_event_btn.clicked.connect(self.add_event)
        calendar_layout.addWidget(add_event_btn)

        self.content_layout.addWidget(calendar_frame)

    def add_event(self):
        dialog = AddEventDialog(self)
        if dialog.exec_():
            event_name, event_date = dialog.get_data()
            jalali_date = JalaliDate(event_date.year(), event_date.month(), event_date.day())
            event_str = f"{event_name}: {jalali_date.strftime('%Y/%m/%d')}"
            self.findChild(QListWidget).addItem(event_str)
            QMessageBox.information(self, "رویداد افزوده شد", f"رویداد '{event_name}' در تاریخ {jalali_date.strftime('%Y/%m/%d')} افزوده شد.")

    def create_action_panel(self):
        action_frame = QFrame()
        action_frame.setStyleSheet(self.card_style)
        action_layout = QHBoxLayout(action_frame)

        add_btn = QPushButton("افزودن پرسنل")
        add_btn.setStyleSheet(self.button_style)
        action_layout.addWidget(add_btn)

        export_btn = QPushButton("خروجی اکسل")
        export_btn.setStyleSheet(self.button_style)
        action_layout.addWidget(export_btn)

        filter_combo = QComboBox()
        filter_combo.addItems(["همه", "فعال", "منقضی"])
        filter_combo.setStyleSheet(f"""
            background-color: {self.card_bg};
            color: {self.text_color};
            padding: 5px;
            border-radius: 5px;
            font-size: 14px;
        """)
        filter_combo.setLayoutDirection(Qt.RightToLeft)
        action_layout.addWidget(filter_combo)

        self.content_layout.addWidget(action_frame)

    def create_sidebar(self):
        self.sidebar = QFrame()
        self.sidebar.setFixedWidth(220)
        self.sidebar.setStyleSheet(f"""
            background-color: {self.sidebar_bg};
            border-radius: 15px;
            padding: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        """)
        sidebar_layout = QVBoxLayout(self.sidebar)
        sidebar_layout.setAlignment(Qt.AlignTop)

        toggle_btn = QToolButton()
        toggle_btn.setText("≡")
        toggle_btn.setStyleSheet(f"""
            font-size: 28px;
            border: none;
            color: {self.text_color};
            padding: 10px;
        """)
        toggle_btn.clicked.connect(self.toggle_sidebar)
        sidebar_layout.addWidget(toggle_btn)

        options = ["داشبورد", "لیست پرسنل", "گزارش‌ها", "تنظیمات", "خروج"]
        for name in options:
            btn = QPushButton(name)
            btn.setStyleSheet(self.sidebar_button_style)
            btn.setLayoutDirection(Qt.RightToLeft)
            btn.setFixedHeight(50)
            sidebar_layout.addWidget(btn)
        sidebar_layout.addStretch()

    def setup_animations(self):
        self.sidebar_animation = QPropertyAnimation(self.sidebar, b"maximumWidth")
        self.sidebar_animation.setDuration(300)
        self.sidebar_animation.setEasingCurve(QEasingCurve.InOutQuad)

    def toggle_theme(self):
        self.is_dark_mode = not self.is_dark_mode
        self.setup_theme()
        self.update_styles()

    def toggle_sidebar(self):
        self.is_sidebar_expanded = not self.is_sidebar_expanded
        self.sidebar_animation.setStartValue(self.sidebar.width())
        self.sidebar_animation.setEndValue(220 if self.is_sidebar_expanded else 50)
        self.sidebar_animation.start()

    def filter_table(self, text):
        pass

    def update_styles(self):
        self.setup_theme()
        for frame in self.findChildren(QFrame):
            frame.setStyleSheet(self.card_style)
        for btn in self.sidebar.findChildren(QPushButton):
            btn.setStyleSheet(self.sidebar_button_style)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PersonnelManagementUI()
    window.show()
    sys.exit(app.exec_())