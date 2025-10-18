import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, 
    QLabel, QTableWidget, QTableWidgetItem, QHeaderView, QFrame, QLineEdit,
    QGraphicsDropShadowEffect, QProgressBar, QToolButton, QAbstractItemView
)
from PyQt5.QtGui import QFont, QColor, QPixmap, QIcon, QPainter, QPalette
from PyQt5.QtCore import Qt, QSize, QPropertyAnimation, QEasingCurve, QRect

class UltraModernUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.is_dark_mode = True
        self.is_sidebar_expanded = True
        self.setWindowTitle("نرم‌افزار حرفه‌ای مدیریت پرسنل")
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
        self.main_layout.addWidget(self.content_area, 1)
        self.main_layout.addWidget(self.sidebar)

        # Initialize Animations
        self.setup_animations()

    def setup_theme(self):
        palette = QPalette()
        if self.is_dark_mode:
            palette.setColor(QPalette.Window, QColor(30, 30, 30))
            palette.setColor(QPalette.WindowText, Qt.white)
            self.card_style = """
                background-color: rgba(50, 50, 50, 0.95);
                border-radius: 15px;
                color: white;
            """
            self.table_style = """
                QTableWidget {
                    background-color: rgba(40, 40, 40, 0.95);
                    border-radius: 15px;
                    color: white;
                    gridline-color: #444;
                }
                QTableWidget::item:selected {
                    background-color: #006D6F;
                }
            """
            self.button_style = """
                QPushButton {
                    padding: 15px;
                    font-size: 16px;
                    border-radius: 10px;
                    background-color: #006D6F;
                    color: white;
                    border: none;
                }
                QPushButton:hover {
                    background-color: #008080;
                }
            """
        else:
            palette.setColor(QPalette.Window, QColor(245, 245, 245))
            palette.setColor(QPalette.WindowText, Qt.black)
            self.card_style = """
                background-color: rgba(255, 255, 255, 0.95);
                border-radius: 15px;
                color: black;
            """
            self.table_style = """
                QTableWidget {
                    background-color: rgba(255, 255, 255, 0.95);
                    border-radius: 15px;
                    color: black;
                    gridline-color: #ddd;
                }
                QTableWidget::item:selected {
                    background-color: #006D6F;
                    color: white;
                }
            """
            self.button_style = """
                QPushButton {
                    padding: 15px;
                    font-size: 16px;
                    border-radius: 10px;
                    background-color: #006D6F;
                    color: white;
                    border: none;
                }
                QPushButton:hover {
                    background-color: #008080;
                }
            """
        self.setPalette(palette)

    def create_header(self):
        header_container = QWidget()
        header_layout = QHBoxLayout(header_container)

        # Search Bar
        self.search_bar = QLineEdit()
        self.search_bar.setPlaceholderText("جستجوی پیشرفته پرسنل...")
        self.search_bar.setStyleSheet("""
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #006D6F;
            background-color: transparent;
            font-size: 14px;
        """)
        self.search_bar.textChanged.connect(self.filter_table)

        # Theme Toggle Button
        self.theme_button = QToolButton()
        self.theme_button.setIcon(QIcon("moon.png" if self.is_dark_mode else "sun.png"))
        self.theme_button.setStyleSheet("border: none; padding: 10px;")
        self.theme_button.clicked.connect(self.toggle_theme)

        header_layout.addWidget(self.search_bar)
        header_layout.addWidget(self.theme_button)
        self.content_layout.addWidget(header_container)

    def create_dashboard_cards(self):
        cards_container = QWidget()
        cards_layout = QHBoxLayout(cards_container)
        cards_layout.setSpacing(20)

        def create_card(title, value, progress, icon_path):
            card = QFrame()
            card.setFixedSize(250, 180)
            card.setStyleSheet(self.card_style + "QFrame:hover { background-color: rgba(100, 100, 100, 0.3); }")
            shadow = QGraphicsDropShadowEffect(blurRadius=20, xOffset=0, yOffset=5, color=QColor(0,0,0,100))
            card.setGraphicsEffect(shadow)
            
            card_layout = QVBoxLayout(card)
            card_layout.setSpacing(10)
            
            # Icon
            icon_label = QLabel()
            icon_label.setPixmap(QPixmap(icon_path).scaled(32, 32, Qt.KeepAspectRatio))
            icon_label.setAlignment(Qt.AlignCenter)
            
            # Value
            value_label = QLabel(value)
            value_label.setFont(QFont("Segoe UI", 24, QFont.Bold))
            value_label.setAlignment(Qt.AlignCenter)
            
            # Title
            title_label = QLabel(title)
            title_label.setFont(QFont("Segoe UI", 12))
            title_label.setAlignment(Qt.AlignCenter)
            
            # Progress
            progress_bar = QProgressBar()
            progress_bar.setValue(progress)
            progress_bar.setTextVisible(False)
            progress_bar.setFixedHeight(6)
            progress_bar.setStyleSheet("""
                QProgressBar {
                    border-radius: 3px;
                    background-color: rgba(0, 0, 0, 0.2);
                }
                QProgressBar::chunk {
                    background-color: #006D6F;
                    border-radius: 3px;
                }
            """)

            card_layout.addWidget(icon_label)
            card_layout.addWidget(value_label)
            card_layout.addWidget(title_label)
            card_layout.addWidget(progress_bar)
            
            return card

        cards = [
            create_card("پرسنل فعال", "120", 80, "users.png"),
            create_card("قرارداد فعال", "78", 60, "contract.png"),
            create_card("مدارک ناقص", "12", 30, "warning.png"),
            create_card("قرارداد منقضی", "5", 20, "expired.png")
        ]

        for card in cards:
            cards_layout.addWidget(card)
        self.content_layout.addWidget(cards_container)

    def create_personnel_table(self):
        self.table = QTableWidget(7, 5)
        self.table.setHorizontalHeaderLabels(["عکس", "شناسه", "نام", "بخش", "وضعیت"])
        self.table.setStyleSheet(self.table_style)
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.table.setAlternatingRowColors(True)
        self.table.verticalHeader().setVisible(False)
        self.table.setEditTriggers(QAbstractItemView.NoEditTriggers)
        self.table.setSelectionBehavior(QAbstractItemView.SelectRows)
        self.table.setSortingEnabled(True)

        # Sample Data
        self.data = [
            ["profile1.png", "101", "علی رضایی", "مدیریت", "فعال"],
            ["profile2.png", "102", "سارا محمدی", "مالی", "فعال"],
            ["profile3.png", "103", "حامد احمدی", "فنی", "فعال"],
            ["profile4.png", "104", "سمیه حسینی", "منابع انسانی", "منقضی"],
            ["profile5.png", "105", "محمد قاسمی", "اداری", "فعال"],
            ["profile6.png", "106", "رضا نوری", "پشتیبانی", "فعال"],
            ["profile7.png", "107", "نگار حیدری", "مالی", "فعال"]
        ]

        self.populate_table(self.data)
        self.content_layout.addWidget(self.table)

    def populate_table(self, data):
        self.table.setRowCount(len(data))
        for row, items in enumerate(data):
            # Image
            image_label = QLabel()
            pixmap = QPixmap(items[0]).scaled(40, 40, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            image_label.setPixmap(pixmap)
            image_label.setAlignment(Qt.AlignCenter)
            self.table.setCellWidget(row, 0, image_label)
            
            # Other columns
            for col, item in enumerate(items[1:], 1):
                table_item = QTableWidgetItem(item)
                table_item.setTextAlignment(Qt.AlignCenter)
                self.table.setItem(row, col, table_item)

    def create_sidebar(self):
        self.sidebar = QFrame()
        self.sidebar.setFixedWidth(250)
        self.sidebar.setStyleSheet("""
            background-color: rgba(0, 109, 111, 0.95);
            border-radius: 15px;
        """)
        self.sidebar_layout = QVBoxLayout(self.sidebar)
        self.sidebar_layout.setContentsMargins(10, 10, 10, 10)

        # Toggle Sidebar Button
        self.toggle_sidebar_btn = QToolButton()
        self.toggle_sidebar_btn.setIcon(QIcon("menu.png"))
        self.toggle_sidebar_btn.setStyleSheet("border: none; padding: 10px;")
        self.toggle_sidebar_btn.clicked.connect(self.toggle_sidebar)
        self.sidebar_layout.addWidget(self.toggle_sidebar_btn)

        # Sidebar Buttons
        btn_configs = [
            ("داشبورد", "dashboard.png"),
            ("پرسنل", "users.png"),
            ("قراردادها", "contract.png"),
            ("مدارک شناسایی", "id.png"),
            ("مدارک پزشکی", "medical.png"),
            ("گزارش‌ها", "report.png"),
            ("تنظیمات", "settings.png")
        ]

        for name, icon in btn_configs:
            btn = QPushButton(name)
            btn.setIcon(QIcon(icon))
            btn.setStyleSheet(self.button_style)
            btn.setIconSize(QSize(24, 24))
            self.sidebar_layout.addWidget(btn)

        self.sidebar_layout.addStretch()

    def setup_animations(self):
        self.sidebar_animation = QPropertyAnimation(self.sidebar, b"maximumWidth")
        self.sidebar_animation.setDuration(300)
        self.sidebar_animation.setEasingCurve(QEasingCurve.InOutQuad)

    def toggle_theme(self):
        self.is_dark_mode = not self.is_dark_mode
        self.setup_theme()
        self.theme_button.setIcon(QIcon("moon.png" if self.is_dark_mode else "sun.png"))
        
        # Update card styles
        for card in self.findChildren(QFrame):
            if card in [c for c in self.content_area.findChildren(QFrame) if c.fixedSize() == QSize(250, 180)]:
                card.setStyleSheet(self.card_style + "QFrame:hover { background-color: rgba(100, 100, 100, 0.3); }")
        
        # Update table style
        self.table.setStyleSheet(self.table_style)
        
        # Update sidebar buttons
        for btn in self.sidebar.findChildren(QPushButton):
            btn.setStyleSheet(self.button_style)

    def toggle_sidebar(self):
        self.is_sidebar_expanded = not self.is_sidebar_expanded
        end_width = 250 if self.is_sidebar_expanded else 60
        self.sidebar_animation.setStartValue(self.sidebar.width())
        self.sidebar_animation.setEndValue(end_width)
        self.sidebar_animation.start()
        
        # Update button text visibility
        for btn in self.sidebar.findChildren(QPushButton):
            btn.setText(btn.text() if self.is_sidebar_expanded else "")
            btn.setIconSize(QSize(24, 24) if self.is_sidebar_expanded else QSize(32, 32))

    def filter_table(self, text):
        filtered_data = [
            row for row in self.data 
            if text.lower() in " ".join(row).lower()
        ]
        self.populate_table(filtered_data)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    window = UltraModernUI()
    window.show()
    sys.exit(app.exec_())