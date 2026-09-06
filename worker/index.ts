export interface Env {
  ASSETS: Fetcher;
}

/**
 * Electrician Toolbox Worker.
 *
 * Responsibilities (intentionally minimal):
 *  - Serve the static SPA build via the ASSETS binding.
 *  - Expose GET /health for uptime checks and future monitoring.
 *  - Leave room for future API routes WITHOUT becoming a general proxy.
 *
 * All calculations happen client-side in the browser. This Worker never
 * fetches arbitrary, user-supplied URLs (no SSRF surface) and requires no
 * secrets or environment variables for V1.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json(
        { status: "ok", service: "electrician-toolbox", timestamp: new Date().toISOString() },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Everything else is served as a static asset. wrangler.jsonc configures
    // single-page-application fallback so client-side routes (e.g.
    // /voltage-drop) resolve correctly on a direct load or refresh.
    const response = await env.ASSETS.fetch(request);

    // Baseline security headers. No CSP-breaking inline scripts other than
    // the tiny inline theme script in index.html, which is static and not
    // derived from any request input.
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
    );

    return new Response(response.body, { status: response.status, headers });
  },
};
