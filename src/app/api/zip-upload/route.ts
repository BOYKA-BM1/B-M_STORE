import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "أضف BLOB_READ_WRITE_TOKEN من Vercel Storage (Blob)" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "application/zip",
          "application/x-zip-compressed",
          "application/octet-stream",
        ],
        maximumSizeInBytes: 500 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "upload error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
