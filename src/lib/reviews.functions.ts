import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { RATE_LIMIT, reviewSchema, type PublicReview } from "./reviews";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listReviews = createServerFn({ method: "GET" }).handler(async (): Promise<PublicReview[]> => {
  const { data, error } = await publicClient()
    .from("store_reviews")
    .select("id, rating, comment, display_name, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("listReviews", error);
    return [];
  }
  return data ?? [];
});

async function hashIp(ip: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`mc-reviews:${ip}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => reviewSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const }; // bot filled honeypot: pretend success, store nothing
    const ip = getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashIp(ip);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
    const { count } = await supabaseAdmin
      .from("store_reviews")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT.max) {
      return { ok: false as const, error: "Você já enviou avaliações recentemente. Tente novamente mais tarde." };
    }
    const { error } = await supabaseAdmin.from("store_reviews").insert({
      rating: data.rating,
      comment: data.comment || null,
      display_name: data.displayName || null,
      ip_hash: ipHash,
    });
    if (error) {
      console.error("submitReview", error);
      return { ok: false as const, error: "Não foi possível salvar sua avaliação. Tente novamente." };
    }
    return { ok: true as const };
  });
