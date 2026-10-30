import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { absUrl } from "@/lib/seo";

// Mapa do site para o Google: as páginas fixas e cada aparelho à venda ou em lançamento.
// Gerado na hora a partir do catálogo, então produtos novos entram sozinhos.

const PAGES = ["/", "/catalogo", "/iphones-novos", "/iphones-seminovos", "/xiaomi", "/ofertas", "/comparar", "/troca", "/assistencia", "/sobre", "/contato"];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { data } = await supabase.from("products").select("id").in("status", ["disponivel", "em_breve"]);
        const urls = [...PAGES.map((p) => absUrl(p)), ...(data ?? []).map((p) => absUrl(`/produto/${p.id}`))];
        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join("\n") +
          "\n</urlset>\n";
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
