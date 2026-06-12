const ALLOWED_ORIGIN = "https://boardz.ttz.dev.br";
const CLICKUP_BASE = "https://api.clickup.com/api/v2";
const TASKS_TTL_SECONDS = 60;
const LISTS_TTL_SECONDS = 180;
const MEMBERS_TTL_SECONDS = 600;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getCacheTtl(pathname) {
  if (pathname === "/team" || pathname.includes("/member")) {
    return MEMBERS_TTL_SECONDS;
  }

  if (pathname.includes("/folder") || pathname.includes("/space")) {
    return LISTS_TTL_SECONDS;
  }

  if (pathname.includes("/task")) {
    return TASKS_TTL_SECONDS;
  }

  return 0;
}

function withCors(headers = {}) {
  return {
    ...headers,
    ...CORS_HEADERS,
  };
}

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
    const cacheTtl = getCacheTtl(url.pathname);
    const cacheKey = new Request(url.toString(), { method: "GET" });

    if (request.method === "GET" && cacheTtl > 0) {
      const cachedResponse = await caches.default.match(cacheKey);
      if (cachedResponse) {
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          headers: withCors(Object.fromEntries(cachedResponse.headers)),
        });
      }
    }

    const response = await fetch(upstream, {
      method: request.method,
      headers: { Authorization: env.CLICKUP_TOKEN },
    });

    const data = await response.json();
    const headers = withCors(
      cacheTtl > 0
        ? {
            "Cache-Control": `public, max-age=${cacheTtl}`,
          }
        : {},
    );
    const outbound = Response.json(data, { status: response.status, headers });

    if (request.method === "GET" && response.ok && cacheTtl > 0) {
      await caches.default.put(cacheKey, outbound.clone());
    }

    return outbound;
  },
};
