import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar | Major Cell" },
      { name: "description", content: "Acesso restrito à área administrativa da Major Cell." },
      { property: "og:title", content: "Entrar | Major Cell" },
      { property: "og:description", content: "Acesso restrito à área administrativa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

const inp = "h-11 w-full rounded-xl hairline bg-background px-3 text-sm focus:border-primary focus:outline-none";

function Login() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
        setMode("in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? (err.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : err.message) : "Erro ao entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-20">
      <p className="text-sm font-medium text-primary">Área administrativa</p>
      <h1 className="mt-3 text-3xl font-semibold">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl hairline bg-card p-6">
        <input className={inp} type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inp} type="password" required minLength={8} placeholder="Senha (mín. 8 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy} className="h-11 w-full rounded-full bg-gold text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Aguarde..." : mode === "in" ? "Entrar" : "Criar conta"}
        </button>
      </form>
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 text-sm text-muted-foreground hover:text-primary">
        {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
      </button>
    </div>
  );
}
