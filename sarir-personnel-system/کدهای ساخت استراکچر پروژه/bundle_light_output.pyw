# -*- coding: utf-8 -*-
import os, re, sys, zipfile
from pathlib import Path
from datetime import datetime

def find_parts(merged_dir: Path):
    parts = sorted(merged_dir.glob("part_*.md"), key=lambda p: int(re.findall(r'part_(\d+)\.md', p.name)[0]) if re.findall(r'part_(\d+)\.md', p.name) else 0)
    return parts

def main():
    base = Path(__file__).resolve().parent
    merged_dir = base / "outputs_light" / "merged_parts"
    if not merged_dir.exists():
        raise SystemExit("merged_parts not found (outputs_light/merged_parts). Run exporter with minimal profile.")

    parts = find_parts(merged_dir)
    if not parts:
        raise SystemExit("No parts found in outputs_light/merged_parts.")

    out_root = base / "outputs_light"
    out_root.mkdir(parents=True, exist_ok=True)

    ts = datetime.now().strftime("%Y%m%d_%H%M")
    single_md = out_root / f"SARIR_Export_LIGHT_{ts}.md"
    zip_path  = out_root / f"SARIR_Export_LIGHT_{ts}.zip"

    with single_md.open("w", encoding="utf-8") as out:
        out.write(f"# SARIR Consolidated Export (LIGHT)\n- Generated: {datetime.now().isoformat(timespec='seconds')}\n\n---\n")
        for p in parts:
            out.write(f"\n\n<!-- {p.name} -->\n\n")
            out.write(p.read_text(encoding="utf-8"))
            out.write("\n")

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.write(single_md, arcname=single_md.name)
        report = merged_dir / "REPORT.txt"
        if report.exists(): z.write(report, arcname=f"merged_parts/{report.name}")
        assets_dir = merged_dir / "assets"
        if assets_dir.exists():
            for dp, _, fns in os.walk(assets_dir):
                for fn in fns:
                    p = Path(dp)/fn
                    z.write(p, arcname=str(Path("merged_parts")/ "assets" / p.name))
    try:
        os.startfile(str(zip_path))
    except Exception:
        pass

if __name__ == "__main__":
    main()
