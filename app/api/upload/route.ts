import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { loadFileFromPath } from "@/lib/loader/pdfLoader";
import { createResource } from "@/lib/actions/resources";

export async function POST(request: NextRequest) {
  try {
    const startTime = performance.now();
    console.log(`[Upload] Starting upload process...`);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const t1 = performance.now();
    console.log(
      `[Upload] Received file: ${file.name} (${(t1 - startTime).toFixed(2)}ms)`
    );

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const t2 = performance.now();
    console.log(`[Upload] Prepared directory (${(t2 - t1).toFixed(2)}ms)`);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = join(uploadsDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    await writeFile(filePath, buffer);

    const t3 = performance.now();
    console.log(
      `[Upload] Wrote file to disk: ${fileName} (${(t3 - t2).toFixed(2)}ms)`
    );

    // Load PDF content using loadFileFromPath
    const docs = await loadFileFromPath(filePath);
    const title =
      docs[0]?.metadata?.pdf?.info?.Title || file.name.replace(/\.pdf$/, "");
    const content = docs.map((doc) => doc.pageContent).join("\n\n");

    const t4 = performance.now();
    console.log(`[Upload] Loaded and parsed PDF (${(t4 - t3).toFixed(2)}ms)`);

    // Create resource
    const result = await createResource({ title, content });

    const t5 = performance.now();
    console.log(
      `[Upload] Created resource in database (${(t5 - t4).toFixed(2)}ms)`
    );
    console.log(
      `[Upload] Total processing time: ${(t5 - startTime).toFixed(2)}ms`
    );

    return NextResponse.json({
      message: result || "Resource created successfully",
      filePath,
      title,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
