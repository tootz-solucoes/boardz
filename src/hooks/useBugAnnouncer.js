const ANNOUNCED_KEY = "boardz-announced-bugs";
const REANNOUNCE_INTERVAL = 30 * 60 * 1000;

// Browsers block audio not triggered by a user gesture.
// Queue URLs and drain on first interaction.
const audioQueue = new Set();
let audioUnlocked = false;

function drainQueue() {
  audioUnlocked = true;
  audioQueue.forEach((url) => new Audio(url).play().catch(() => {}));
  audioQueue.clear();
}

document.addEventListener("click", drainQueue, { once: true });
document.addEventListener("keydown", drainQueue, { once: true });

function playAudio(url) {
  if (audioUnlocked) {
    new Audio(url).play().catch(() => {});
  } else {
    audioQueue.add(url);
  }
}

const loadAnnounced = () => {
  try {
    return JSON.parse(localStorage.getItem(ANNOUNCED_KEY) ?? "{}");
  } catch {
    return {};
  }
};

const saveAnnounced = (map) => {
  localStorage.setItem(ANNOUNCED_KEY, JSON.stringify(map));
};

function buildAudioUrl(bug) {
  const proxyUrl = import.meta.env.VITE_VOICERSS_PROXY_URL;
  if (!proxyUrl) return null;

  const firstName = bug.assignee?.name?.split(" ")[0] ?? "Atenção";
  const project = bug.project && bug.project !== "—" ? bug.project : "projeto desconhecido";
  const text = `Colaborador ${firstName}, novo búúg cadastrado no projeto ${project}`;

  return `${proxyUrl}/tts?src=${encodeURIComponent(text)}`;
}

export function speakBug(bug) {
  const url = buildAudioUrl(bug);
  if (url) playAudio(url);
}

export function announceNewBugs(bugs) {
  const announced = loadAnnounced();
  const now = Date.now();

  bugs.forEach((bug) => {
    const lastAt = announced[bug.id];
    const shouldAnnounce = !lastAt || now - lastAt >= REANNOUNCE_INTERVAL;
    if (shouldAnnounce) {
      speakBug(bug);
      announced[bug.id] = now;
    }
  });

  const currentIds = new Set(bugs.map((b) => b.id));
  Object.keys(announced).forEach((id) => {
    if (!currentIds.has(id)) delete announced[id];
  });

  saveAnnounced(announced);
}
