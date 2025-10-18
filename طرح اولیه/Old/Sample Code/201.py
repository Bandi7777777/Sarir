import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QLabel, QTableWidget, QTableWidgetItem, QHeaderView, QFrame, QLineEdit,
    QGraphicsDropShadowEffect, QProgressBar, QToolButton, QAbstractItemView
)
from PyQt5.QtGui import QFont, QColor, QPalette
from PyQt5.QtCore import Qt, QSize, QPropertyAnimation, QEasingCurve

class UltraModernUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.is_dark_mode = False
        self.is_sidebar_expanded = True
        self.setWindowTitle("نرم‌افزار مدیریت پرسنل")
        self.setGeometry(100, 100, 1400, 900)

        # Central Widget
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QHBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)

        # Setup Theme
        self.setup_theme()

        # Main Content Area
        self.content_area = QWidget()
        self.content_layout = QVBoxLayout(self.content_area)
        self.content_layout.setContentsMargins(20, 20, 20, 20)
        self.content_layout.setSpacing(15)

        # Header Section
        self.create_header()

        # Dashboard Cards
        self.create_dashboard_cards()

        # Personnel Table
        self.create_personnel_table()

        # Collapsible Sidebar
        self.create_sidebar()

        # Add to main layout
        self.main_layout.addWidget(self.sidebar)
        self.main_layout.addWidget(self.content_area, 1)

        # Initialize Animations
        self.setup_animations()

    def setup_theme(self):
        if self.is_dark_mode:
            self.primary_color = "#008080"
            self.bg_color = "#303030"
            self.card_bg = "#424242"
            self.text_color = "#FFFFFF"
            self.header_text_color = "#FFFFFF"
            self.sidebar_bg = "#212121"
            self.alternate_row_color = "#383838"
            self.gridline_color = "#505050"
            self.hover_color = "#505050"
        else:
            self.primary_color = "#008080"
            self.bg_color = "#F0F0F0"
            self.card_bg = "#FFFFFF"
            self.text_color = "#333333"
            self.header_text_color = "#FFFFFF"
            self.sidebar_bg = "#006666"
            self.alternate_row_color = "#F5F5F5"
            self.gridline_color = "#E0E0E0"
            self.hover_color = "#E0F0F0"

        palette = QPalette()
        palette.setColor(QPalette.Window, QColor(self.bg_color))
        palette.setColor(QPalette.WindowText, QColor(self.text_color))
        self.setPalette(palette)

        self.card_style = f"""
            background-color: {self.card_bg};
            border-radius: 15px;
            color: {self.text_color};
        """
        self.table_style = f"""
            QTableWidget {{
                background-color: {self.card_bg};
                alternate-background-color: {self.alternate_row_color};
                color: {self.text_color};
                gridline-color: {self.gridline_color};
                border-radius: 15px;
            }}
            QTableWidget::item {{
                padding: 5px;
            }}
            QHeaderView::section {{
                background-color: {self.primary_color};
                color: {self.header_text_color};
                padding: 5px;
            }}
            QTableWidget::item:selected {{
                background-color: {self.primary_color};
                color: {self.header_text_color};
            }}
            QTableWidget::item:hover {{
                background-color: {self.hover_color};
            }}
        """
        self.button_style = f"""
            QPushButton {{
                background-color: {self.primary_color};
                color: {self.header_text_color};
                border: none;
                padding: 10px;
                border-radius: 5px;
            }}
            QPushButton:hover {{
                background-color: #006666;
            }}
        """
        self.sidebar_button_style = f"""
            QPushButton {{
                background-color: transparent;
                color: {self.header_text_color};
                border: none;
                padding: 10px;
                text-align: left;
            }}
            QPushButton:hover {{
                background-color: rgba(255, 255, 255, 0.1);
            }}
        """

    def create_header(self):
        header_container = QWidget()
        header_layout = QHBoxLayout(header_container)

        title_label = QLabel("مدیریت پرسنل")
        title_label.setFont(QFont("Segoe UI", 24, QFont.Bold))
        title_label.setStyleSheet(f"color: {self.primary_color};")
        title_label.setObjectName("title_label")
        header_layout.addWidget(title_label)
        header_layout.addStretch()

        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("جستجوی پرسنل...")
        self.search_bar.setStyleSheet(f"""
            background-color: {self.card_bg};
            border: 1px solid {self.gridline_color};
            border-radius: 5px;
            padding: 5px;
            color: {self.text_color};
        """)
        self.search_bar.textChanged.connect(self.filter_table)

        self.theme_button = QToolButton()
        self.theme_button.setText("🌙" if self.is_dark_mode else "☀️")
        self.theme_button.setStyleSheet(f"""
            border: none;
            padding: 10px;
            color: {self.text_color};
            font-size: 20px;
        """)
        self.theme_button.clicked.connect(self.toggle_theme)

        header_layout.addWidget(self.search_bar)
        header_layout.addWidget(self.theme_button)
        self.content_layout.addWidget(header_container)

    def create_dashboard_cards(self):
        cards_container = QWidget()
        cards_layout = QHBoxLayout(cards_container)
        cards_layout.setSpacing(20)

        def create_card(title, value, progress):
            card = QFrame()
            card.setFixedSize(250, 180)
            card.setStyleSheet(self.card_style)
            shadow = QGraphicsDropShadowEffect(blurRadius=10, xOffset=0, yOffset=5, color=QColor(0,0,0,50))
            card.setGraphicsEffect(shadow)

            card_layout = QVBoxLayout(card)
            card_layout.setSpacing(10)

            icon_label = QLabel("📊")
            icon_label.setFont(QFont("Segoe UI", 24))
            icon_label.setStyleSheet(f"color: {self.primary_color};")
            icon_label.setAlignment(Qt.AlignCenter)

            value_label = QLabel(value)
            value_label.setFont(QFont("Segoe UI", 24, QFont.Bold))
            value_label.setStyleSheet(f"color: {self.primary_color};")
            value_label.setAlignment(Qt.AlignCenter)

            title_label = QLabel(title)
            title_label.setFont(QFont("Segoe UI", 12))
            title_label.setAlignment(Qt.AlignCenter)

            progress_bar = QProgressBar()
            progress_bar.setValue(progress)
            progress_bar.setTextVisible(False)
            progress_bar.setFixedHeight(6)
            progress_bar.setStyleSheet(f"""
                QProgressBar {{
                    border: none;
                    background-color: {self.gridline_color};
                    border-radius: 3px;
                }}
                QProgressBar::chunk {{
                    background-color: {self.primary_color};
                    border-radius: 3px;
                }}
            """)

            card_layout.addWidget(icon_label)
            card_layout.addWidget(value_label)
            card_layout.addWidget(title_label)
            card_layout.addWidget(progress_bar)

            return card

        cards = [
            ("پرسنل فعال", "120", 80),
            ("قرارداد فعال", "78", 60),
            ("مدارک ناقص", "12", 30),
            ("قرارداد منقضی", "5", 20)
        ]

        for title, value, progress in cards:
            card = create_card(title, value, progress)
            cards_layout.addWidget(card)
        self.content_layout.addWidget(cards_container)

    def create_personnel_table(self):
        self.table = QTableWidget(7, 5)
        self.table.setHorizontalHeaderLabels(["آواتار", "شناسه", "نام", "بخش", "وضعیت"])
        self.table.setStyleSheet(self.table_style)
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.setAlternatingRowColors(True)
        self.table.verticalHeader().setVisible(False)
        self.table.setEditTriggers(QAbstractItemView.NoEditTriggers)
        self.table.setSelectionBehavior(QAbstractItemView.SelectRows)
        self.table.setSortingEnabled(True)

        self.data = [
            ["👤", "101", "علی رضایی", "مدیریت", "فعال"],
            ["👤", "102", "سارا محمدی", "مالی", "فعال"],
            ["👤", "103", "حامد احمدی", "فنی", "فعال"],
            ["👤", "104", "سمیه حسینی", "منابع انسانی", "منقضی"],
            ["👤", "105", "محمد قاسمی", "اداری", "فعال"],
            ["👤", "106", "رضا نوری", "پشتیبانی", "فعال"],
            ["👤", "107", "نگار حیدری", "مالی", "فعال"]
        ]

        self.populate_table(self.data)
        self.content_layout.addWidget(self.table)

    def populate_table(self, data):
        self.table.setRowCount(len(data))
        for row, items in enumerate(data):
            avatar_label = QLabel(items[0])
            avatar_label.setFont(QFont("Segoe UI", 20))
            avatar_label.setAlignment(Qt.AlignCenter)
            avatar_label.setStyleSheet(f"color: {self.text_color};")
            self.table.setCellWidget(row, 0, avatar_label)

            for col, item in enumerate(items[1:], 1):
                table_item = QTableWidgetItem(item)
                table_item.setTextAlignment(Qt.AlignCenter)
                self.table.setItem(row, col, table_item)

    def create_sidebar(self):
        self.sidebar = QFrame()
        self.sidebar.setFixedWidth(250)
        self.sidebar.setStyleSheet(f"""
            background-color: {self.sidebar_bg};
            border-radius: 15px;
        """)
        self.sidebar_layout = QVBoxLayout(self.sidebar)
        self.sidebar_layout.setContentsMargins(10, 10, 10, 10)

        self.toggle_sidebar_btn = QToolButton()
        self.toggle_sidebar_btn.setText("≡")
        self.toggle_sidebar_btn.setStyleSheet(f"""
            border: none;
            padding: 10px;
            color: {self.header_text_color};
            font-size: 24px;
        """)
        self.toggle_sidebar_btn.clicked.connect(self.toggle_sidebar)
        self.sidebar_layout.addWidget(self.toggle_sidebar_btn)

        btn_configs = [
            ("داشبورد", "📊"),
            ("پرسنل", "👥"),
            ("قراردادها", "📝"),
            ("مدارک شناسایی", "🪪"),
            ("مدارک پزشکی", "🩺"),
            ("گزارش‌ها", "📄"),
            ("تنظیمات", "⚙️")
        ]

        for name, icon in btn_configs:
            btn = QPushButton(f"{icon} {name}")
            btn.setStyleSheet(self.sidebar_button_style)
            btn.setFont(QFont("Segoe UI", 14))
            self.sidebar_layout.addWidget(btn)

        self.sidebar_layout.addStretch()

    def setup_animations(self):
        self.sidebar_animation = QPropertyAnimation(self.sidebar, b"maximumWidth")
        self.sidebar_animation.setDuration(300)
        self.sidebar_animation.setEasingCurve(QEasingCurve.InOutQuad)

    def toggle_theme(self):
        self.is_dark_mode = not self.is_dark_mode
        self.setup_theme()
        self.theme_button.setText("🌙" if self.is_dark_mode else "☀️")

        for card in self.findChildren(QFrame):
            if card in [c for c in self.content_area.findChildren(QFrame) if c.fixedSize() == QSize(250, 180)]:
                card.setStyleSheet(self.card_style)

        self.table.setStyleSheet(self.table_style)

        for btn in self.sidebar.findChildren(QPushButton):
            btn.setStyleSheet(self.sidebar_button_style)

        self.search_bar.setStyleSheet(f"""
            background-color: {self.card_bg};
            border: 1px solid {self.gridline_color};
            border-radius: 5px;
            padding: 5px;
            color: {self.text_color};
        """)

        title_label = self.content_area.findChild(QLabel, "title_label")
        if title_label:
            title_label.setStyleSheet(f"color: {self.primary_color};")

        self.sidebar.setStyleSheet(f"""
            background-color: {self.sidebar_bg};
            border-radius: 15px;
        """)

        self.toggle_sidebar_btn.setStyleSheet(f"""
            border: none;
            padding: 10px;
            color: {self.header_text_color};
            font-size: 24px;
        """)

        # Update avatars and cards
        self.create_dashboard_cards()
        self.populate_table(self.data)

    def toggle_sidebar(self):
        self.is_sidebar_expanded = not self.is_sidebar_expanded
        end_width = 250 if self.is_sidebar_expanded else 60
        self.sidebar_animation.setStartValue(self.sidebar.width())
        self.sidebar_animation.setEndValue(end_width)
        self.sidebar_animation.start()

        for btn in self.sidebar.findChildren(QPushButton):
            text = btn.text()
            icon = text.split()[0] if text else ""
            btn.setText(text if self.is_sidebar_expanded else icon)
            btn.setFont(QFont("Segoe UI", 14 if self.is_sidebar_expanded else 20))

    def filter_table(self, text):
        filtered_data = [
            row for row in self.data
            if text.lower() in " ".join(row[1:]).lower()
        ]
        self.populate_table(filtered_data)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = UltraModernUI()
    window.show()
    sys.exit(app.exec_())