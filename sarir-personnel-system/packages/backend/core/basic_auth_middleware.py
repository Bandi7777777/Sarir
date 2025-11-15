# core/basic_auth_middleware.py
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import status
import base64, hmac, os
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _eq(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)

class BasicAuthMiddleware(BaseHTTPMiddleware):
    def __init__(
        self, app,
        *, enabled: bool = True,
        username: str = "sarir",
        password_hash: str | None = None,
        plain_password: str | None = None,
        scope_prefix: str = "/api/personnel",
    ):
        super().__init__(app)
        self.enabled = enabled
        self.username = username
        if password_hash:
            self.password_hash = password_hash
        elif plain_password:
            self.password_hash = pwd_context.hash(plain_password)
        else:
            # fallback امن نیست؛ فوراً در .env تنظیمش کن
            self.password_hash = pwd_context.hash("change-me")
        self.scope_prefix = scope_prefix.rstrip("/")

    async def dispatch(self, request: Request, call_next):
        if not self.enabled:
            return await call_next(request)

        path = request.url.path
        if not (path == self.scope_prefix or path.startswith(self.scope_prefix + "/")):
            return await call_next(request)

        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Basic "):
            return Response(status_code=status.HTTP_401_UNAUTHORIZED,
                            headers={"WWW-Authenticate": "Basic"})

        try:
            b64 = auth.split(" ", 1)[1]
            decoded = base64.b64decode(b64).decode("utf-8")
            username, password = decoded.split(":", 1)
        except Exception:
            return Response(status_code=status.HTTP_401_UNAUTHORIZED,
                            headers={"WWW-Authenticate": "Basic"})

        if not _eq(username, self.username):
            return Response(status_code=status.HTTP_401_UNAUTHORIZED,
                            headers={"WWW-Authenticate": "Basic"})

        if not pwd_context.verify(password, self.password_hash):
            return Response(status_code=status.HTTP_401_UNAUTHORIZED,
                            headers={"WWW-Authenticate": "Basic"})

        # اگر خواستی downstream استفاده کنی:
        request.state.basic_user = username
        return await call_next(request)
