import os

# مسیر پایه پروژه
base_path = r"D:\Projects\Sarir Project"

# ساختار پوشه‌ها
folders = [
    "app/core",
    "app/database/models",
    "app/ui/views",
    "app/ui/widgets",
    "app/ui/resources",
    "app/services",
    "assets",
    "config",
    "tests"
]

# فایل‌ها و محتوای اولیه
files = {
    "main.py": 'print("Sarir Personnel Manager started!")\n',
    "requirements.txt": "# Add required packages here\nPyQt5\n",
    "README.md": "# Sarir Personnel Management System\n",
    "config/settings.py": "# Application settings go here\n",
    "app/core/router.py": "# Handles navigation and route logic\n",
    "app/core/controller.py": "# Main application controller logic\n",
    "app/database/db_manager.py": "# SQLite connection and initialization\n",
    "app/database/models/personnel.py": "# Personnel model definition\n",
    "app/services/export_service.py": "# Handles exporting data (PDF/Excel)\n",
    "tests/test_contract_module.py": "# Unit tests for contract module\n"
}

# ساخت پوشه‌ها
for folder in folders:
    os.makedirs(os.path.join(base_path, folder), exist_ok=True)

# ساخت فایل‌ها با محتوای اولیه
for relative_path, content in files.items():
    file_path = os.path.join(base_path, relative_path)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("✅ Sarir Project folder structure created successfully.")
