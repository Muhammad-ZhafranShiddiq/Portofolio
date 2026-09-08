import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSession } from "@/lib/auth/session";
import {
  createUploadSignature,
  type UploadKind,
} from "@/lib/cloudinary/server";

export const runtime = "nodejs";

const requestSchema = z.object({
  kind: z.enum([
    "portrait",
    "experience",
    "project",
    "certification",
    "resume",
  ]),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;
  if (origin && origin !== requestOrigin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Unsupported upload type" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      createUploadSignature(parsed.data.kind as UploadKind),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create upload signature.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

