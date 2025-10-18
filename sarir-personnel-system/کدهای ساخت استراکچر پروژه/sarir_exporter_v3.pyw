# -*- coding: utf-8 -*-
import os
import re
import sys
import json
import shutil
import traceback
from pathlib import Path
from datetime import datetime

LOG_FILE = "debug.log"

def load_config(cfg_path: Path):
    cfg = {
        "root_dir": "",
        "output_dir": "merged_parts",
        "assets_dir": "assets",
        "max_chars_per_part": 120000,
        "include_extensions": [".ts",".tsx",".js",".jsx",".mjs",".cjs",".py",".json",".html",".css",".scss",".md",".txt",".csv",".xml",".yml",".yaml",".env.example"],
        "include_any_utf8_text": True,
        "include_vscode_settings": False,
        "excluded_dirs": [".git","node_modules",".pnpm-store",".yarn",".yarn/cache",".yarn/unplugged",".next","out","build","dist",".turbo",".cache",".rollup.cache",".parcel-cache",".sass-cache",".eslintcache",".swc",".webpack",".vite",".vercel",".netlify","firebase","coverage","cypress","playwright-report","logs","tmp","temp"],
        "excluded_globs": ["**/*.log","**/.DS_Store","**/Thumbs.db","**/desktop.ini","**/.env*"],
        "image_keep_under_kb": 700,
        "image_extensions": [".png",".jpg",".jpeg",".gif",".webp",".svg"],
        "redactions": [r"[A-Za-z0-9_\-]{24,}\.[A-Za-z0-9_\-]{6,}\.[A-Za-z0-9_\-]{15,}", r"\b[A-Za-z0-9]{32,}\b", r"\b(eyJhbGciOi|ya29\.)[A-Za-z0-9\-\._]+\b"]
    }
    if cfg_path.exists():
        try:
            user_cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
            for k,v in user_cfg.items():
                cfg[k] = v
        except Exception:
            pass
    return cfg

def is_binary_like(p: Path):
    bin_exts = {".exe",".dll",".so",".dylib",".bin",".pdf",".zip",".7z",".rar",".tar",".gz"}
    return p.suffix.lower() in bin_exts

def is_text_utf8(p: Path):
    try:
        _ = p.read_text(encoding="utf-8")
        return True, _
    except Exception:
        return False, None

def match_any_glob(path: Path, patterns):
    for pat in patterns:
        if path.match(pat):
            return True
    return False

def iter_files(root: Path, cfg):
    include_paths = [Path(p) for p in cfg.get("include_paths", []) if p]
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in cfg["excluded_dirs"]]
        cur_dir = Path(dirpath)
        rel_dir = cur_dir.relative_to(root)
        if include_paths:
            ok = False
            for ip in include_paths:
                if str(rel_dir).startswith(str(ip)):
                    ok = True
                    break
            if not ok:
                continue
        for fn in filenames:
            p = cur_dir / fn
            yield p

def redact_text(text: str, patterns):
    red = text
    for rx in patterns:
        try:
            red = re.sub(rx, "***REDACTED***", red)
        except re.error:
            pass
    return red

def hashlib_sha1_file(p: Path, chunk=1<<20):
    import hashlib
    h = hashlib.sha1()
    with p.open("rb") as f:
        while True:
            b = f.read(chunk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()

def copy_small_image(asset_path: Path, target_assets_dir: Path, max_kb: int):
    try:
        size_kb = asset_path.stat().st_size // 1024
        if size_kb <= max_kb:
            sha = hashlib_sha1_file(asset_path)
            ext = asset_path.suffix.lower()
            dst = target_assets_dir / f"{asset_path.stem}_{sha[:8]}{ext}"
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(asset_path, dst)
            return dst.name, size_kb
    except Exception:
        pass
    return None, None

def main():
    try:
        base = Path(__file__).resolve().parent
        cfg = load_config(base / "export.config.json")
        root_dir = (base / cfg["root_dir"]).resolve() if cfg["root_dir"] else base
        out_dir = (base / cfg["output_dir"]).resolve()
        assets_dir = out_dir / cfg.get("assets_dir", "assets")
        out_dir.mkdir(parents=True, exist_ok=True)
        assets_dir.mkdir(parents=True, exist_ok=True)

        include_exts = {e.lower() for e in cfg["include_extensions"]}
        image_exts = {e.lower() for e in cfg["image_extensions"]}
        max_chars = int(cfg["max_chars_per_part"])
        max_img_kb = int(cfg["image_keep_under_kb"])
        redactions = cfg.get("redactions", [])
        excluded_globs = cfg.get("excluded_globs", [])

        candidates = []
        for p in iter_files(root_dir, cfg):
            rel = p.relative_to(root_dir)
            include_paths = [Path(pth) for pth in cfg.get("include_paths", []) if pth]
            if include_paths:
                parent_rel = rel.parent
                in_scope = any(str(parent_rel).startswith(str(ip)) or str(rel).startswith(str(ip)) for ip in include_paths)
                if not in_scope:
                    found_glob = False
                    for g in cfg.get("include_files_glob", []):
                        if rel.match(g):
                            found_glob = True
                            break
                    if not found_glob:
                        continue

            if match_any_glob(rel, excluded_globs):
                continue
            if not cfg.get("include_vscode_settings", False) and any(part == ".vscode" for part in rel.parts):
                continue
            if is_binary_like(p) and p.suffix.lower() not in image_exts:
                continue
            if p.suffix.lower() in image_exts:
                candidates.append(("image", p, rel)); continue
            if p.suffix.lower() in include_exts:
                candidates.append(("text", p, rel)); continue
            if cfg.get("include_any_utf8_text", True):
                ok, _ = is_text_utf8(p)
                if ok: candidates.append(("text", p, rel)); continue

        candidates.sort(key=lambda x: str(x[2]).lower())

        part_idx = 1
        cur_chars = 0
        cur_lines = []
        stats = {"files_text":0,"files_image_kept":0,"files_image_skipped":0,"chars_total":0,"parts":0}

        def flush_part():
            nonlocal part_idx, cur_chars, cur_lines, stats
            if not cur_lines: return
            part_path = out_dir / f"part_{part_idx}.md"
            content = "".join(cur_lines)
            part_path.write_text(content, encoding="utf-8")
            stats["parts"] += 1
            part_idx += 1
            cur_chars = 0
            cur_lines = []

        def header():
            return (f"# SARIR Export — Part\n- Generated: {datetime.now().isoformat(timespec='seconds')}\n- Root: `{root_dir}`\n\n---\n\n")

        cur_lines.append(header()); cur_chars += len(cur_lines[-1])

        for kind, p, rel in candidates:
            if kind == "text":
                ok, text = is_text_utf8(p)
                if not ok: continue
                red = redact_text(text, redactions)
                block = f"\n\n## `{rel}`\n\n```{p.suffix.lower().lstrip('.')}\n{red}\n```\n"
                if cur_chars + len(block) > max_chars:
                    flush_part(); cur_lines.append(header()); cur_chars += len(cur_lines[-1])
                cur_lines.append(block); cur_chars += len(block)
                stats["files_text"] += 1; stats["chars_total"] += len(red)
            else:
                name_copied, size_kb = copy_small_image(p, assets_dir, max_img_kb)
                if name_copied:
                    block = f"\n\n## `{rel}` (image, {size_kb} KB)\n\n![{rel}]({cfg.get('assets_dir','assets')}/{name_copied})\n"
                    if cur_chars + len(block) > max_chars:
                        flush_part(); cur_lines.append(header()); cur_chars += len(cur_lines[-1])
                    cur_lines.append(block); cur_chars += len(block); stats["files_image_kept"] += 1
                else:
                    block = f"\n\n## `{rel}` (image skipped — too large or error)\n\n"
                    if cur_chars + len(block) > max_chars:
                        flush_part(); cur_lines.append(header()); cur_chars += len(cur_lines[-1])
                    cur_lines.append(block); cur_chars += len(block); stats["files_image_skipped"] += 1

        flush_part()
        (out_dir / "REPORT.txt").write_text(
            f"Export finished.\nParts: {stats['parts']}\nText files: {stats['files_text']}\nImages kept (<= {max_img_kb} KB): {stats['files_image_kept']}\nImages skipped: {stats['files_image_skipped']}\nTotal text chars: {stats['chars_total']}\n",
            encoding="utf-8"
        )

        try:
            os.startfile(str(out_dir))
        except Exception:
            pass
    except Exception:
        Path(LOG_FILE).write_text(traceback.format_exc(), encoding="utf-8")
        try:
            import ctypes
            ctypes.windll.user32.MessageBoxW(0, f"⛔️ Error. See {LOG_FILE}", "SARIR Exporter", 0)
        except Exception:
            pass

if __name__ == "__main__":
    main()
