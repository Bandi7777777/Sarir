param(
  [string]$DbUser = "sarir_user",
  [string]$DbName = "sarir",
  [string]$DbPassword = "Sarir@2026",
  [string]$Container = "sarir_db"
)

$ErrorActionPreference = "Stop"

function Invoke-DbSql {
  param([string]$Sql)
  docker exec -e PGPASSWORD="$DbPassword" -i $Container sh -lc @"
psql -U $DbUser -d $DbName <<'SQL'
$Sql
SQL
"@
}

function Reset-AdminPassword {
  param([string]$NewPassword = "Sarir@2026")
  $sql = @"
UPDATE public.users
SET hashed_password = crypt($$${NewPassword}$$, gen_salt('bf'))
WHERE username = 'admin';
"@
  Invoke-DbSql -Sql $sql
  Invoke-DbSql -Sql "SELECT username, length(hashed_password) len FROM public.users WHERE username='admin';"
}

# نمونه استفاده:
# .\DB-Admin.ps1; Invoke-DbSql -Sql "select now();"
# .\DB-Admin.ps1; Reset-AdminPassword -NewPassword "MyNewP@ssw0rd"
