import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { newPasswordError } from "@/lib/password";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Nova senha | Major Cell" },
      { name: "description", content: "Criar uma nova senha para a área administrativa da Major Cell." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

const inp = "h-11 w-full rounded-xl hairline bg-background px-3 text-base focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/**
 * Página aberta pelo link do e-mail "Esqueci minha senha".
 * O Supabase lê o código do link, cria uma sessão de recuperação e aqui a pessoa escolhe a nova senha.
 */
function ResetPassword() {
  const nav = useNavigate();
  const [state, setState] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // O link traz o código na URL; o cliente do Supabase o troca por uma sessão ao ser criado.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) setState("ready");
    });
    const linkError = /error_description|error=/.test(window.location.hash + window.location.search);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setState("ready");
      else if (linkError) setState("invalid");
      else window.setTimeout(() => setState((s) => (s === "checking" ? "invalid" : s)), 2500);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = newPasswordError(password, confirm);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      toast.success("Senha alterada. Bem-vindo de volta!");
      nav({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível alterar a senha. Tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-20">
      <h1 className="text-3xl font-semibold">Criar nova senha</h1>

      {state === "checking" && <p className="mt-6 text-muted-foreground" role="status">Conferindo o link…</p>}

      {state === "invalid" && (
        <div className="mt-8 rounded-2xl bg-card p-6" role="alert">
          <p className="text-base">Este link não vale mais. Ele pode ter expirado ou já ter sido usado.</p>
          <Link to="/entrar" className="mt-5 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground">
            Pedir um novo link
          </Link>
        </div>
      )}

      {state === "ready" && (
        <form onSubmit={submit} noValidate className="mt-8 space-y-4 rounded-2xl hairline bg-card p-6">
          <label className="block text-sm text-muted-foreground">
            Nova senha
            <input className={`${inp} mt-1.5`} type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label className="block text-sm text-muted-foreground">
            Repita a nova senha
            <input className={`${inp} mt-1.5`} type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="h-11 w-full rounded-full bg-gold text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {busy ? "Salvando…" : "Salvar nova senha e entrar"}
          </button>
        </form>
      )}
    </div>
  );
}
