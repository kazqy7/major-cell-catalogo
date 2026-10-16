<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Store settings (WhatsApp number, address, hours) live in `src/config/store.ts` — single place for the owner to edit.
- Product images are stored in a private bucket; read via signed URLs in `src/lib/products.ts` because the workspace blocks public buckets.
- Admin access is gated by `user_roles` + `has_role()` RLS; the first account ever created becomes admin via a DB trigger, so no credentials live in code.
- Category pages share one `Catalog` component with a fixed category, so filters behave identically everywhere.
- products.photo_colors (jsonb [{name,hex,images}]) holds official per-color gallery photos and is visual only; stock-bound colors stay in products.colors. Why: the owner has not confirmed stock per color, so photo colors must never block or permit purchase.
