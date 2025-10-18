import sys
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame,
    QGraphicsDropShadowEffect, QPushButton, QGridLayout
)
from PyQt5.QtGui import QFont, QColor, QPainter
from PyQt5.QtCore import Qt
from PyQt5.QtChart import QChart, QChartView, QPieSeries, QLineSeries

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

        # نمودار دایره‌ای (Pie Chart)
        pie_series = QPieSeries()
        pie_series.append("فعال", 75)
        pie_series.append("غیرفعال", 25)
        pie_chart = QChart()
        pie_chart.addSeries(pie_series)
        pie_chart.setTitle("وضعیت پرسنل")
        pie_chart.setAnimationOptions(QChart.SeriesAnimations)
        pie_chart_view = QChartView(pie_chart)
        pie_chart_view.setRenderHint(QPainter.Antialiasing)
        pie_chart_view.setMinimumHeight(300)

        # نمودار خطی (Line Chart)
        line_series = QLineSeries()
        line_series.append(1, 80)
        line_series.append(2, 90)
        line_series.append(3, 85)
        line_series.append(4, 95)
        line_chart = QChart()
        line_chart.addSeries(line_series)
        line_chart.setTitle("روند قراردادهای فعال")
        line_chart.createDefaultAxes()
        line_chart.setAnimationOptions(QChart.SeriesAnimations)
        line_chart_view = QChartView(line_chart)
        line_chart_view.setRenderHint(QPainter.Antialiasing)
        line_chart_view.setMinimumHeight(300)

        # جایگذاری نمودارها
        charts_layout = QGridLayout()
        charts_layout.setSpacing(20)
        charts_layout.addWidget(pie_chart_view, 0, 0)
        charts_layout.addWidget(line_chart_view, 0, 1)
        layout.addLayout(charts_layout)

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