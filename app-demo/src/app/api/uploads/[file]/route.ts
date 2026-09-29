import { getSessionUserId } from "@/server/auth/session";
import { readUpload } from "@/server/storage";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

/** Uploaded photos are for signed-in Sidekick users only (a signature check, no database query). */
export async function GET(_request: Request, ctx: RouteContext<"/api/uploads/[file]">) {
  if (!(await getSessionUserId())) return new Response("Not found", { status: 404 });
  const { file } = await ctx.params;
  const match = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.exec(file);
  if (!match) return new Response("Not found", { status: 404 });
  const body = await readUpload(file);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(body, {
    headers: { "Content-Type": TYPES[match[1]], "Cache-Control": "private, max-age=31536000, immutable" },
  });
}
