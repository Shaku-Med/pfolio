import { NextResponse } from "next/server";
import { findResource } from "@/lib/resources";
import { isSameOrigin, jsonError, readJson } from "@/lib/http";
import { UUID, guard } from "@/lib/api-helpers";
import { runUploadAction } from "@/lib/python-upload";

const MAX_BYTES = 12 * 1024 * 1024;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Bad request", 400);
  }

  const resource = findResource(text(form.get("resource")));
  if (!resource) return jsonError("Unknown section", 404);

  const column = text(form.get("column"));
  const id = text(form.get("id"));
  const field = resource.fields.find((item) => item.name === column);
  if (!field || (field.type !== "file" && field.type !== "files")) {
    return jsonError("That field does not take a file", 400);
  }
  if (!UUID.test(id)) return jsonError("Bad id", 400);

  const file = form.get("file");
  if (!(file instanceof File) || file.size <= 0) return jsonError("Bad request", 400);
  if (file.size > MAX_BYTES) return jsonError("That file is too big", 400);

  const index = text(form.get("index"));
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const result = await runUploadAction({
      action: "upload",
      table: resource.table,
      column,
      id,
      filename: file.name || "upload.png",
      content_b64: bytes.toString("base64"),
      ...(index ? { index } : {}),
    });
    if (result.error || !result.endpoint) {
      return jsonError(result.error || "The upload did not go through", 500);
    }
    return NextResponse.json({
      endpoint: result.endpoint,
      ...(result.endpoints ? { endpoints: result.endpoints } : {}),
    });
  } catch (error) {
    console.error("[dashboard] upload failed", error);
    return jsonError("The upload did not go through", 500);
  }
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;
  if (!isSameOrigin(request)) return jsonError("Request blocked", 403);

  const body = await readJson(request);
  if (!body) return jsonError("Bad request", 400);

  const resource = findResource(typeof body.resource === "string" ? body.resource : "");
  if (!resource) return jsonError("Unknown section", 404);

  const column = typeof body.column === "string" ? body.column : "";
  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID.test(id)) return jsonError("Bad id", 400);

  try {
    const result = await runUploadAction({
      action: "remove",
      table: resource.table,
      column,
      id,
      index: body.index,
    });
    if (result.error || !result.endpoints) {
      return jsonError(result.error || "Could not remove that image", 500);
    }
    return NextResponse.json({ endpoints: result.endpoints });
  } catch (error) {
    console.error("[dashboard] upload remove failed", error);
    return jsonError("Could not remove that image", 500);
  }
}
