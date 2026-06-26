const ALLOWED_ORIGIN = "https://boardz.ttz.dev.br";
const TTS_TTL_SECONDS = 7 * 24 * 60 * 60;

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

    const url = new URL(request.url);
    const src = url.searchParams.get("src");

    if (!src) {
      return new Response("Missing src", { status: 400, headers: CORS_HEADERS });
    }
    if (!env.VOICERSS_API_KEY) {
      return new Response("VOICERSS_API_KEY not configured", { status: 503, headers: CORS_HEADERS });
    }

    const cacheKey = new Request(`tts:${encodeURIComponent(src)}`, { method: "GET" });
    const cached = await caches.default.match(cacheKey);
    if (cached) {
      return new Response(cached.body, {
        headers: { "Content-Type": "audio/mpeg", ...CORS_HEADERS },
      });
    }

    const voiceRssUrl =
      `https://api.voicerss.org/?key=${env.VOICERSS_API_KEY}` +
      `&hl=pt-br` +
      `&src=${encodeURIComponent(src)}` +
      `&f=16khz_16bit_mono` +
      `&r=-5` +
      `&v=Ligia`;

    const ttsResponse = await fetch(voiceRssUrl);
    const audioBuffer = await ttsResponse.arrayBuffer();

    const toCache = new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": `public, max-age=${TTS_TTL_SECONDS}`,
      },
    });
    await caches.default.put(cacheKey, toCache.clone());

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg", ...CORS_HEADERS },
    });
  },
};
