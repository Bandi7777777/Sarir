$cfg="D:\Projects\Website\1.Code\1.SARIR\sarir-personnel-system\packages\frontend\src\lib"
mkdir $cfg -ErrorAction SilentlyContinue | Out-Null
@'
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
'@ | Set-Content -Encoding UTF8 "$cfg\config.ts"



