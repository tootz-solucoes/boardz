const ALLOWED_ORIGIN = "https://boardz.ttz.dev.br";
const CLICKUP_BASE = "https://api.clickup.com/api/v2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (!env.CLICKUP_TOKEN) {
      return Response.json(
        { error: "CLICKUP_TOKEN secret not configured" },
        { status: 503, headers: CORS_HEADERS },
      );
    }

    const url = new URL(request.url);
    const upstream = `${CLICKUP_BASE}${url.pathname}${url.search}`;

    const response = await fetch(upstream, {
      method: request.method,
      headers: { Authorization: env.CLICKUP_TOKEN },
    });

    const data = await response.json();
    return Response.json(data, { status: response.status, headers: CORS_HEADERS });
  },
};
