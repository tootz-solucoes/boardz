const ALLOWED_ORIGIN = "https://boardz.ttz.dev.br";
const CLICKUP_BASE = "https://api.clickup.com/api/v2";

const TASKS_TTL_SECONDS = 60;
const LISTS_TTL_SECONDS = 180;
const MEMBERS_TTL_SECONDS = 600;
const CACHE_RETENTION_SECONDS = 24 * 60 * 60;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(headers = {}) {
  return { ...headers, ...CORS_HEADERS };
}

// ── ClickUp proxy ─────────────────────────────────────────────────────────────

function getClickupCacheTtl(pathname) {
  if (pathname === "/team" || pathname.includes("/member")) return MEMBERS_TTL_SECONDS;
  if (pathname.includes("/folder") || pathname.includes("/space")) return LISTS_TTL_SECONDS;
  if (pathname.includes("/task")) return TASKS_TTL_SECONDS;
  return 0;
}

function createCachedResponse(data, status, cacheTtl) {
  return Response.json(data, {
    status,
    headers: withCors({
      "Cache-Control": `public, max-age=${CACHE_RETENTION_SECONDS}`,
      "X-Boardz-Cache-Stored-At": String(Date.now()),
      "X-Boardz-Cache-Ttl": String(cacheTtl),
    }),
  });
}

function getCachedResponseState(response) {
  if (!response) return { isFresh: false };

  const cachedAt = Number(response.headers.get("X-Boardz-Cache-Stored-At"));
  const ttlSeconds = Number(response.headers.get("X-Boardz-Cache-Ttl"));
  const ttlMs = ttlSeconds * 1000;

  if (!Number.isFinite(cachedAt) || !Number.isFinite(ttlSeconds) || ttlMs <= 0) {
    return { isFresh: false };
  }

  return { isFresh: Date.now() - cachedAt <= ttlMs };
}

async function handleClickup(request, env) {
  if (!env.CLICKUP_TOKEN) {
    return Response.json(
      { error: "CLICKUP_TOKEN secret not configured" },
      { status: 503, headers: CORS_HEADERS },
    );
  }

  const url = new URL(request.url);
  const upstream = `${CLICKUP_BASE}${url.pathname}${url.search}`;
  const cacheTtl = getClickupCacheTtl(url.pathname);
  const cacheKey = new Request(`clickup:${url.pathname}${url.search}`, { method: "GET" });

  const cachedResponse =
    request.method === "GET" && cacheTtl > 0
      ? await caches.default.match(cacheKey)
      : null;

  if (cachedResponse) {
    const { isFresh } = getCachedResponseState(cachedResponse);
    if (isFresh) {
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        headers: withCors(Object.fromEntries(cachedResponse.headers)),
      });
    }
  }

  try {
    const response = await fetch(upstream, {
      method: request.method,
      headers: { Authorization: env.CLICKUP_TOKEN },
    });

    const data = await response.json();
    const outbound =
      request.method === "GET" && cacheTtl > 0
        ? createCachedResponse(data, response.status, cacheTtl)
        : Response.json(data, { status: response.status, headers: CORS_HEADERS });

    if (request.method === "GET" && response.ok && cacheTtl > 0) {
      await caches.default.put(cacheKey, outbound.clone());
    }

    return outbound;
  } catch {
    if (cachedResponse) {
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        headers: withCors({
          ...Object.fromEntries(cachedResponse.headers),
          "X-Boardz-Cache-Status": "stale",
        }),
      });
    }

    return Response.json(
      { error: "ClickUp proxy error" },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    return handleClickup(request, env);
  },
};
