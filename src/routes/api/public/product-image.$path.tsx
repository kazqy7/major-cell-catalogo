import { createFileRoute } from "@tanstack/react-router";

// Public read-only image endpoint for product photos.
// Only files under the "official/" folder of the private product-images
// bucket are served; path traversal and non-image files are rejected.

const ALLOWED_PREFIX = "official/";
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

function sanitizePath(raw: string): string | null {
  if (!raw || raw.length > 200) return null;
  if (raw.includes("..") || raw.includes("\\") || raw.startsWith("/")) return null;
  if (!raw.startsWith(ALLOWED_PREFIX)) return null;
  const rest = raw.slice(ALLOWED_PREFIX.length);
  if (!rest || rest.includes("/")) return null; // single level only
  if (!/^[A-Za-z0-9._-]+$/.test(rest)) return null;
  const ext = rest.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(ext)) return null;
  return raw;
}

export const Route = createFileRoute("/api/public/product-image/$path")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = sanitizePath(decodeURIComponent(params.path ?? ""));
        if (!path) {
          return new Response("Not found", { status: 404 });
        }
        // Cache da borda (Cloudflare): depois do primeiro pedido, a foto sai direto da borda,
        // sem buscar no armazenamento de novo. Fora do Cloudflare (ex.: no Mac) é ignorado.
        const edge = (globalThis as { caches?: { default?: Cache } }).caches?.default;
        // Ao mudar o Cache-Control abaixo, troque o v= para a borda não servir a cópia antiga por 30 dias.
        const { origin, pathname } = new URL(request.url);
        const cacheKey = new Request(`${origin}${pathname}?v=2`);
        const hit = await edge?.match(cacheKey).catch(() => undefined);
        if (hit) return hit;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage
          .from("product-images")
          .download(path);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }
        const ext = path.split(".").pop()?.toLowerCase() ?? "jpg";
        const response = new Response(data, {
          headers: {
            "Content-Type": MIME[ext] ?? "application/octet-stream",
            // Navegador e borda/CDN: 30 dias, e serve a cópia antiga enquanto atualiza.
            "Cache-Control": "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800",
          },
        });
        await edge?.put(cacheKey, response.clone()).catch(() => undefined);
        return response;
      },
    },
  },
});
