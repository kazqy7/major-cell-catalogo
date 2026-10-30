import { describe, expect, it } from "vitest";
import { newPasswordError, resetRedirect } from "@/lib/password";

describe("nova senha do painel", () => {
  it("exige 8 caracteres e as duas senhas iguais", () => {
    expect(newPasswordError("curta", "curta")).toMatch(/8 caracteres/);
    expect(newPasswordError("senha-boa-123", "senha-boa-124")).toMatch(/não são iguais/);
    expect(newPasswordError("senha-boa-123", "senha-boa-123")).toBeNull();
  });

  it("o link do e-mail volta para a página de nova senha do próprio site", () => {
    expect(resetRedirect("https://major-cell-catalogo.lovable.app")).toBe("https://major-cell-catalogo.lovable.app/redefinir-senha");
  });
});
