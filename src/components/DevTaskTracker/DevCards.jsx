import { useState, useEffect, useMemo } from "react";
import {
  CLICKUP_TEAM_ID,
  STORY_POINTS_FIELD_NAME,
  CLIENTE_FIELD_NAME,
  STATUS_IN_PROGRESS,
  DEVELOPERS,
} from "../../config/clickupConfig";
import { clickupApi } from "../../services/clickupApi";
import { readSnapshot, writeSnapshot } from "../../utils/snapshotCache";

const IDLE_QUOTES = [
  "O ócio bem vivido alimenta a criatividade",
  "Descansar também é uma forma de produzir",
  "Grandes ideias costumam nascer em momentos de pausa",
  "O silêncio do ócio fortalece a clareza da mente",
  "Quem sabe parar aprende a recomeçar melhor",
  "O ócio consciente renova as energias para agir",
  "A mente floresce quando não está sempre ocupada",
  "O descanso dá profundidade ao trabalho",
  "O ócio é um espaço onde a reflexão encontra tempo para existir",
  "No ócio, a mente respira",
  "Parar é parte do progresso",
  "O descanso também constrói caminhos",
  "O ócio abre espaço para o novo",
  "Ficar em pausa também é avançar por dentro",
  "A calma do ócio organiza pensamentos",
  "Sem pausa, não há equilíbrio",
  "O ócio revela o que a pressa esconde",
  "Tempo livre é terreno fértil para ideias",
];

function assignIdleQuotes(devs) {
  const shuffledQuotes = [...IDLE_QUOTES].sort(() => Math.random() - 0.5);
  let quoteIndex = 0;
  return devs.map((dev) => ({
    ...dev,
    idleQuote: dev.task ? null : shuffledQuotes[quoteIndex++] ?? null,
  }));
}

const PROXY_URL = import.meta.env.VITE_CLICKUP_PROXY_URL;
const FETCH_INTERVAL = 1 * 60 * 1000;
const SNAPSHOT_KEY_PREFIX = "dev-cards";

function getFieldValue(task, fieldName) {
  const fields = task.custom_fields || [];
  const field = fields.find(
    (f) => f.name?.toLowerCase() === fieldName.toLowerCase(),
  );

  if (field) {
    if (field.value === null || field.value === undefined) return null;
    if (field.type === "drop_down") {
      const options = field.type_config?.options || [];
      const option = options.find((o) => o.orderindex === field.value);
      return option?.name ?? null;
    }
    return field.value;
  }

  const direct = task[fieldName];
  return direct !== undefined ? direct : null;
}

async function fetchMembers() {
  const data = await clickupApi.get("/team");
  const team = (data.teams || []).find((t) => t.id === CLICKUP_TEAM_ID);
  return team?.members || [];
}

async function fetchInProgressTasks(userId, listId) {
  const path = listId
    ? `/list/${listId}/task?assignees[]=${userId}&statuses[]=${encodeURIComponent(STATUS_IN_PROGRESS)}&include_closed=true`
    : `/team/${CLICKUP_TEAM_ID}/task?assignees[]=${userId}&statuses[]=${encodeURIComponent(STATUS_IN_PROGRESS)}`;
  const data = await clickupApi.get(path);
  return data.tasks || [];
}

const AVATAR_BASE = "w-10 h-10 rounded-full border-2 border-[rgba(179,136,255,0.3)] shrink-0";

function DevAvatar({ name, src }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (src) {
    return <img className={`${AVATAR_BASE} object-cover`} src={src} alt={name} />;
  }
  return (
    <div className={`${AVATAR_BASE} flex items-center justify-center bg-gradient-to-br from-purple-deep to-purple-dark text-text-soft text-[0.7em] font-semibold`}>
      {initials}
    </div>
  );
}

const SKELETON_BAR = "rounded-[6px] bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] bg-[length:200%_100%] [animation:skeleton-loading_1.4s_infinite_linear]";

function DevCardSkeleton() {
  return (
    <div className="flex-[1_1_0] min-w-0 flex flex-col items-center gap-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(179,136,255,0.1)] rounded-xl p-3 opacity-50">
      <div className={`${SKELETON_BAR} w-[52px] h-[52px] rounded-full shrink-0`} />
      <div className={`${SKELETON_BAR} w-[60%] h-[0.7em]`} />
      <div className={`${SKELETON_BAR} w-[90%] h-[0.55em]`} />
      <div className={`${SKELETON_BAR} w-[65%] h-[0.55em]`} />
      <div className={`${SKELETON_BAR} w-[40%] h-[0.5em]`} />
    </div>
  );
}

export default function DevCards({ sprintListId }) {
  const [devs, setDevs] = useState(null);

  useEffect(() => {
    if (!PROXY_URL) {
      setDevs(assignIdleQuotes(DEVELOPERS.map((d) => ({ name: d.name, avatar: null, task: null, extraTasks: 0 }))));
      return;
    }

    let cancelled = false;
    const snapshotKey = `${SNAPSHOT_KEY_PREFIX}:${sprintListId ?? "all"}`;
    const cached = readSnapshot(snapshotKey, FETCH_INTERVAL);

    if (cached?.value) {
      setDevs(assignIdleQuotes(cached.value));
    }

    async function load() {
      try {
        const members = await fetchMembers();
        if (cancelled || members.length === 0) return;

        const resolved = await Promise.all(
          DEVELOPERS.map(async (dev) => {
            const member = members.find(
              (m) => m.user?.email?.toLowerCase() === dev.email.toLowerCase(),
            );
            if (!member) return { name: dev.name, avatar: null, task: null, extraTasks: 0 };

            const userId = member.user.id;
            const avatar = member.user.profilePicture || null;
            const tasks = await fetchInProgressTasks(userId, sprintListId);
            if (cancelled) return { name: dev.name, avatar, task: null, extraTasks: 0 };
            if (!tasks.length) return { name: dev.name, avatar, task: null, extraTasks: 0 };

            const sorted = [...tasks].sort((a, b) => {
              const pA = Number(getFieldValue(a, STORY_POINTS_FIELD_NAME)) || 0;
              const pB = Number(getFieldValue(b, STORY_POINTS_FIELD_NAME)) || 0;
              return pB - pA;
            });
            const primary = sorted[0];

            return {
              name: dev.name,
              avatar,
              task: {
                title: primary.name,
                cliente: getFieldValue(primary, CLIENTE_FIELD_NAME) || "—",
                points: getFieldValue(primary, STORY_POINTS_FIELD_NAME),
              },
              extraTasks: tasks.length - 1,
            };
          }),
        );

        const hasAnyTask = resolved.some((dev) => dev.task);
        if (!cancelled && hasAnyTask) {
          setDevs(assignIdleQuotes(resolved));
          writeSnapshot(snapshotKey, resolved);
        }
      } catch {
        // Keep the last snapshot rendered when refresh fails.
      }
    }

    if (!cached || cached.isStale) {
      load();
    }

    const id = setInterval(load, FETCH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sprintListId]);

  if (devs === null) {
    return (
      <div className="grid grid-cols-3 gap-3 mt-7">
        {DEVELOPERS.map((d) => (
          <DevCardSkeleton key={d.name} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 mt-7">
      {devs.map((dev) => (
        <div
          key={dev.name}
          className="min-w-0 flex flex-col items-center gap-3 bg-[rgba(255,255,255,0.04)] border border-[rgba(179,136,255,0.1)] rounded-xl p-3"
        >
          <div className="flex items-center gap-2 w-full">
            <DevAvatar name={dev.name} src={dev.avatar} />
            <div className="text-[1em] font-semibold text-purple-accent whitespace-nowrap overflow-hidden text-ellipsis w-full">
              {dev.name}
            </div>
            {dev.extraTasks > 0 && (
              <span className="shrink-0 ml-auto text-[0.6em] font-bold text-purple-accent bg-[rgba(179,136,255,0.15)] border border-[rgba(179,136,255,0.3)] rounded-[20px] py-[0.1em] px-[0.45em] whitespace-nowrap">
                +{dev.extraTasks}
              </span>
            )}
          </div>
          {dev.task ? (
            <>
              <div className="text-[0.75em] text-text-soft leading-[1.3] line-clamp-2 w-full opacity-90" title={dev.task.title}>
                {dev.task.title}
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-[0.9em] text-purple-accent opacity-70 whitespace-nowrap overflow-hidden text-ellipsis">
                  {dev.task.cliente}
                </span>
                {dev.task.points != null && (
                  <span className="text-[0.85em] text-emerald-400 font-semibold">
                    {dev.task.points} pts
                  </span>
                )}
              </div>
            </>
          ) : dev.idleQuote ? (
            <div className="flex-1 flex items-center justify-center px-1">
              <p className="text-[0.68em] text-[#555] italic leading-[1.45] text-center">
                &ldquo;{dev.idleQuote}&rdquo;
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
