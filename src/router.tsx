import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // Reuse catalog data for 60s between pages instead of re-querying on every navigation.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Envia os dados buscados no servidor junto com a página, para o navegador não repetir as consultas ao abrir.
    dehydrate: () => ({ queryClientState: dehydrate(queryClient) as never }),
    hydrate: (dehydrated) => hydrate(queryClient, dehydrated.queryClientState),
  });

  return router;
};
