import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, Search, Loader2, Smartphone } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryLabel, formatPrice, productsQuery, type ProductWithUrls } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel | Major Cell" },
      { name: "description", content: "Gerenciamento de aparelhos da Major Cell." },
      { property: "og:title", content: "Painel | Major Cell" },
      { property: "og:description", content: "Gerenciamento de aparelhos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminGate,
});

function AdminGate() {
  const nav = useNavigate();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null) nav({ to: "/entrar" });
    if (session) {
      supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle()
        .then(({ data }) => setIsAdmin(!!data));
    }
  }, [session, nav]);

  if (session === undefined || (session && isAdmin === null))
    return <div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!session) return null;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold">Acesso não autorizado</h1>
        <p className="mt-2 text-muted-foreground">Esta conta não tem permissão de administrador.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 text-primary">Sair</button>
      </div>
    );
  return <Dashboard email={session.user.email ?? ""} />;
}

function Dashboard({ email }: { email: string }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery(productsQuery({ includeSold: true }));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<ProductWithUrls | "new" | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });
  const all = data ?? [];
  const list = all.filter((p) =>
    (!cat || p.category === cat) && (!status || p.status === status) &&
    (!q || `${p.name} ${p.model ?? ""}`.toLowerCase().includes(q.toLowerCase())));

  async function toggle(p: ProductWithUrls) {
    const { error } = await supabase.from("products").update({ status: p.status === "vendido" ? "disponivel" : "vendido" }).eq("id", p.id);
    if (error) { toast.error("Não foi possível atualizar."); return; }
    toast.success("Status atualizado."); refresh();
  }
  async function remove(p: ProductWithUrls) {
    if (!confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) { toast.error("Não foi possível excluir."); return; }
    if (p.images.length) await supabase.storage.from("product-images").remove(p.images);
    toast.success("Aparelho excluído."); refresh();
  }

  const sel = "h-10 rounded-xl hairline bg-card px-3 text-sm";
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Painel administrativo</p>
          <h1 className="mt-2 text-3xl font-semibold">Estoque de aparelhos</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing("new")} className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> Novo aparelho
          </button>
          <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-2 rounded-full hairline px-4 py-2.5 text-sm" aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[["Cadastrados", all.length], ["Disponíveis", all.filter((p) => p.status === "disponivel").length], ["Vendidos", all.filter((p) => p.status === "vendido").length]].map(([k, v]) => (
          <div key={k} className="rounded-2xl hairline bg-card p-6">
            <p className="text-sm text-muted-foreground">{k}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-gold">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <label className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar aparelhos" className={sel + " w-full pl-9"} />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={sel} aria-label="Categoria">
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel} aria-label="Disponibilidade">
          <option value="">Toda disponibilidade</option>
          <option value="disponivel">Disponíveis</option>
          <option value="vendido">Vendidos</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl hairline">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : error ? (
          <p className="py-16 text-center text-destructive">Erro ao carregar o estoque.</p>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            {all.length === 0 ? "Nenhum aparelho cadastrado ainda. Clique em “Novo aparelho” para começar." : "Nenhum aparelho com esses filtros."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 bg-card/40 p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-secondary">
                  {p.imageUrls[0] ? <img src={p.imageUrls[0]} alt="" className="h-full w-full object-cover" /> : <Smartphone className="m-5 h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="min-w-48 flex-1">
                  <Link to="/produto/$id" params={{ id: p.id }} className="font-semibold hover:text-primary">{p.name} {p.model}</Link>
                  <p className="text-xs text-muted-foreground">
                    {[categoryLabel(p.category), p.storage, p.color, p.battery_health != null ? `Bateria ${p.battery_health}%` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="w-32 text-sm font-semibold text-primary">{formatPrice(p.price) ?? "—"}</p>
                <button onClick={() => toggle(p)} className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === "vendido" ? "bg-destructive/20 text-destructive" : "bg-success/15 text-success"}`}>
                  {p.status === "vendido" ? "Vendido" : "Disponível"}
                </button>
                <button onClick={() => setEditing(p)} className="rounded-full p-2 hairline hover:text-primary" aria-label="Editar"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => remove(p)} className="rounded-full p-2 hairline hover:text-destructive" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}
