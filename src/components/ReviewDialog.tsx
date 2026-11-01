import { useState } from "react";
import { Star, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { submitReview } from "@/lib/reviews.functions";
import { randomName } from "@/lib/reviews";

export default function ReviewDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const submit = useServerFn(submitReview);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return setError("Escolha uma nota de 1 a 5 estrelas.");
    setSending(true);
    setError("");
    try {
      const res = await submit({ data: { rating, comment, displayName: name, website } });
      if (!res.ok) return setError(res.error);
      await qc.invalidateQueries({ queryKey: ["store-reviews"] });
      toast.success("Avaliação enviada. Obrigado!");
      setRating(0); setComment(""); setName("");
      onOpenChange(false);
    } catch {
      setError("Não foi possível enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const field = "w-full rounded-xl hairline bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Avaliar a Major Cell</DialogTitle>
          <DialogDescription>Não é preciso cadastro. O nome é opcional e o comentário ficará visível publicamente no site.</DialogDescription>
        </DialogHeader>
        <form onSubmit={send} className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Nota</p>
            <div className="flex gap-1" role="radiogroup" aria-label="Nota" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}`}
                  onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} className="p-1 text-primary">
                  <Star className="h-8 w-8" fill={n <= (hover || rating) ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-medium">
            Comentário <span className="font-normal text-muted-foreground">(opcional)</span>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={4} className={`${field} mt-2`} placeholder="Conte como foi sua experiência" />
          </label>
          <label className="block text-sm font-medium">
            Nome de exibição <span className="font-normal text-muted-foreground">(opcional)</span>
            <div className="mt-2 flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} className={field} placeholder="Deixe vazio para aparecer como Cliente anônimo" />
              <button type="button" onClick={() => setName(randomName())} className="inline-flex shrink-0 items-center gap-1 rounded-xl hairline px-3 text-xs hover:border-primary hover:text-primary">
                <Shuffle className="h-4 w-4" /> Gerar nome
              </button>
            </div>
          </label>
          <input tabIndex={-1} autoComplete="off" aria-hidden value={website} onChange={(e) => setWebsite(e.target.value)} name="website" className="hidden" />
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-full hairline px-5 py-2.5 text-sm">Cancelar</button>
            <button type="submit" disabled={sending} className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {sending ? "Enviando..." : "Enviar avaliação"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
