const BASE = import.meta.env.VITE_CLICKUP_PROXY_URL;

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`ClickUp proxy error: ${res.status}`);
  return res.json();
}

export const clickupApi = { get };
