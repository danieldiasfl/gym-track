import { onRequest } from "../functions/api/[[path]]";

type AssetsBinding = {
  fetch(request: Request): Promise<Response>;
};

type WorkerEnv = Parameters<typeof onRequest>[0]["env"] & {
  ASSETS: AssetsBinding;
};

/**
 * Worker entry point for the Vite/React application.
 * API requests are handled by the existing D1 handler; all other requests
 * are served from the built static assets in dist/.
 */
export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return onRequest({ request, env });
    }

    return env.ASSETS.fetch(request);
  },
};
