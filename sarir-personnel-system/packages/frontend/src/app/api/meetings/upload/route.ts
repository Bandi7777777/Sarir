import { writeFile, mkdir } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buf = Buffer.from(bytes);
  const filename = Date.now() + "-" + file.name.replace(/\s+/g, "_");

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const dest = path.join(uploadsDir, filename);
  await writeFile(dest, buf);

  return NextResponse.json({ ok: true, url: "/uploads/" + filename });
};
