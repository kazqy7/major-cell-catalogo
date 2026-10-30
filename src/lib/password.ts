/** Regras da nova senha do painel. Devolve a mensagem de erro, ou null se estiver tudo certo. */
export function newPasswordError(password: string, confirm: string): string | null {
  if (password.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (password !== confirm) return "As duas senhas não são iguais.";
  return null;
}

/** Endereço da página que recebe o link do e-mail de redefinição. */
export const resetRedirect = (origin: string) => `${origin}/redefinir-senha`;
