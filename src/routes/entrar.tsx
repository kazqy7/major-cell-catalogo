import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { resetRedirect } from "@/lib/password";

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
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetRedirect(window.location.origin) });
        // Erros de e-mail inexistente não são mostrados, para não revelar quais e-mails têm conta.
        if (error && error.status !== 400 && error.status !== 404) throw error;
        setSent(true);
      } else if (mode === "in") {
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
      <h1 className="mt-3 text-3xl font-semibold">{mode === "in" ? "Entrar" : mode === "up" ? "Criar conta" : "Esqueci minha senha"}</h1>
      {mode === "forgot" && sent ? (
        <div className="mt-8 rounded-2xl bg-card p-6" role="status">
          <p className="text-base">
            Se <strong>{email}</strong> tiver acesso ao painel, você vai receber um e-mail com um link para criar uma nova senha.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">O link vale por pouco tempo. Confira também a caixa de spam.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl hairline bg-card p-6">
          {mode === "forgot" && <p className="text-sm text-muted-foreground">Digite o e-mail do painel. Vamos enviar um link para você criar uma nova senha.</p>}
          <input className={inp} type="email" required autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode !== "forgot" && (
            <input className={inp} type="password" required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} placeholder="Senha (mín. 8 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
          <button disabled={busy} className="h-11 w-full rounded-full bg-gold text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? "Aguarde..." : mode === "in" ? "Entrar" : mode === "up" ? "Criar conta" : "Enviar link"}
          </button>
        </form>
      )}
      <div className="mt-4 flex flex-col items-start gap-3 text-sm">
        {mode === "in" && (
          <button onClick={() => { setMode("forgot"); setSent(false); }} className="font-medium text-primary hover:underline">
            Esqueci minha senha
          </button>
        )}
        <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setSent(false); }} className="text-muted-foreground hover:text-primary">
          {mode === "in" ? "Primeiro acesso? Criar conta" : "Voltar para entrar"}
        </button>
      </div>
    </div>
  );
}
