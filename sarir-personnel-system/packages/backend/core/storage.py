from __future__ import annotations

import os
import re
import hashlib
from pathlib import Path
from typing import Tuple, Optional
from fastapi import UploadFile

SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9._-]+")

def get_storage_root() -> Path:
    env = os.getenv("FILE_STORAGE_DIR")
    if env:
        root = Path(env).expanduser().resolve()
    else:
        root = Path(__file__).resolve().parents[1] / "storage"
    root.mkdir(parents=True, exist_ok=True)
    return root

def safe_filename(name: str) -> str:
    base = Path(name).name
    base = base.strip().replace(" ", "_")
    base = SAFE_NAME_RE.sub("-", base)
    return base or "file"

def compute_sha256(file_path: Path, chunk_size: int = 1024 * 1024) -> str:
    sha = hashlib.sha256()
    with file_path.open("rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            if not chunk:
                break
            sha.update(chunk)
    return sha.hexdigest()

def save_upload_file(upload: UploadFile, dest_dir: Path, final_name: Optional[str] = None) -> Tuple[Path, int]:
    dest_dir.mkdir(parents=True, exist_ok=True)
    original = safe_filename(upload.filename or "file")
    filename = final_name if final_name else original

    target = dest_dir / filename
    i = 1
    while target.exists():
        stem, suf = Path(filename).stem, Path(filename).suffix
        filename = f"{stem}__{i}{suf}"
        target = dest_dir / filename
        i += 1

    size = 0
    with target.open("wb") as out:
        for chunk in iter(lambda: upload.file.read(1024 * 1024), b""):
            out.write(chunk)
            size += len(chunk)
            if not chunk:
                break

    try:
        upload.file.seek(0)
    except Exception:
        pass

    return target, size
