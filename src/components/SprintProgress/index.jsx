import { useState, useEffect, useMemo } from "react";
import { Clock3, TriangleAlert, Zap } from "lucide-react";
import { sprintsData } from "../Calendar2026/sprintsData";
import DevCards from "../DevTaskTracker/DevCards";
import {
  CLICKUP_SPACE_ID,
  CLICKUP_SPRINT_FOLDER_NAME,
  SPRINT_LIST_NAME_PREFIX,
  STORY_POINTS_FIELD_NAME,
  CLIENTE_FIELD_NAME,
  STATUSES_DONE,
  LAG_THRESHOLD,
  PROJECTS,
} from "../../config/clickupConfig";
import { clickupApi } from "../../services/clickupApi";
import { readSnapshot, writeSnapshot } from "../../utils/snapshotCache";
import {
  getProgressFillWidth,
  getProgressFillClassName,
  getProgressPctClassName,
} from "./progressUtils";
import "./SprintProgress.css";

const PROXY_URL = import.meta.env.VITE_CLICKUP_PROXY_URL;
const FETCH_INTERVAL = 2 * 60 * 1000;
const SNAPSHOT_KEY_PREFIX = "sprint-progress";

function useNow(interval = 60000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

function getCurrentSprint(date) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  return (
    sprintsData.find((s) => {
      const start = new Date(
        s.calendarStart.year,
        s.calendarStart.month,
        s.calendarStart.day,
      );
      const end = new Date(
        s.calendarEnd.year,
        s.calendarEnd.month,
        s.calendarEnd.day,
      );
      return start <= today && today <= end;
    }) || null
  );
}

function getSprintProgress(sprint) {
  if (!sprint) return 0;
  const start = new Date(
    sprint.calendarStart.year,
    sprint.calendarStart.month,
    sprint.calendarStart.day,
  );
  const end = new Date(
    sprint.calendarEnd.year,
    sprint.calendarEnd.month,
    sprint.calendarEnd.day,
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const total = end - start;
  const elapsed = Math.min(Math.max(today - start, 0), total);
  return Math.round((elapsed / total) * 100);
}

function formatSprintDates(sprint) {
  if (!sprint) return "";
  const start = new Date(sprint.calendarStart.year, sprint.calendarStart.month, sprint.calendarStart.day);
  const end = new Date(sprint.calendarEnd.year, sprint.calendarEnd.month, sprint.calendarEnd.day);
  const fmt = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  return `${fmt(start)} → ${fmt(end)}`;
}

function getSprintEnd(sprint) {
  if (!sprint) return null;
  return new Date(sprint.calendarEnd.year, sprint.calendarEnd.month, sprint.calendarEnd.day);
}


function getSprintDaysLeft(sprint, now) {
  if (!sprint) return null;
  const end = getSprintEnd(sprint);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}


function getFieldValue(task, fieldName) {
  // Tenta custom_fields primeiro
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

  // Fallback: propriedade direta na task (ex: task.points)
  const direct = task[fieldName];
  return direct !== undefined ? direct : null;
}

async function fetchCurrentSprintListId(sprintNumber) {
  const foldersData = await clickupApi.get(`/space/${CLICKUP_SPACE_ID}/folder`);
  const folder = (foldersData.folders || []).find(
    (f) => f.name?.trim() === CLICKUP_SPRINT_FOLDER_NAME,
  );
  if (!folder) return null;

  const listsData = await clickupApi.get(`/folder/${folder.id}/list`);
  const lists = listsData.lists || [];
  const target = `${SPRINT_LIST_NAME_PREFIX} ${sprintNumber}`.toLowerCase();
  const match = lists.find((l) => l.name?.toLowerCase().startsWith(target));
  return match?.id || null;
}

async function fetchSprintTasks(listId) {
  if (!listId) return [];
  let allTasks = [];
  let page = 0;
  while (true) {
    const data = await clickupApi.get(`/list/${listId}/task?include_closed=true&page=${page}`);
    const tasks = data.tasks || [];
    allTasks = [...allTasks, ...tasks];
    if (tasks.length < 100) break;
    page++;
  }
  return allTasks;
}

function computeProjectProgress(tasks) {
  const result = {};
  for (const project of PROJECTS) {
    const doneTasks = tasks.filter((t) => {
      const cliente = getFieldValue(t, CLIENTE_FIELD_NAME);
      const isDone = STATUSES_DONE.includes(t.status?.status?.toLowerCase());
      return String(cliente) === String(project.clienteFieldValue) && isDone;
    });
    const donePts = doneTasks.reduce((sum, t) => {
      const pts = getFieldValue(t, STORY_POINTS_FIELD_NAME);
      return sum + (Number(pts) || 0);
    }, 0);
    // totalPts vem da config estática (project.sprintPoints)
    result[project.name] = { donePts, totalPts: project.sprintPoints };
  }
  return result;
}

// Mock data para fase 1 (layout) — substituído por dados reais após config
const MOCK_PROJECT_DATA = Object.fromEntries(
  PROJECTS.map((p) => [p.name, { donePts: 0, totalPts: p.sprintPoints }]),
);

export default function SprintProgress() {
  const now = useNow(60000);
  const [projectData, setProjectData] = useState(MOCK_PROJECT_DATA);
  const [sprintListId, setSprintListId] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentSprint = useMemo(() => getCurrentSprint(now), [now]);
  const sprintPct = useMemo(
    () => getSprintProgress(currentSprint),
    [currentSprint],
  );

  const clockStr = useMemo(() => {
    return now.toLocaleTimeString("pt-BR", {
      timeZone: "America/Recife",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [now]);

  const dateStr = useMemo(() => {
    return now.toLocaleDateString("pt-BR", {
      timeZone: "America/Recife",
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }, [now]);

  useEffect(() => {
    if (!PROXY_URL || !currentSprint) return;

    let cancelled = false;
    const snapshotKey = `${SNAPSHOT_KEY_PREFIX}:${currentSprint.sprint}`;

    const cached = readSnapshot(snapshotKey, FETCH_INTERVAL);
    if (cached?.value) {
      setProjectData(cached.value.projectData || MOCK_PROJECT_DATA);
      setSprintListId(cached.value.sprintListId || null);
    }

    async function load() {
      setLoading(true);
      try {
        const listId = await fetchCurrentSprintListId(currentSprint.sprint);
        if (cancelled || !listId) return;
        setSprintListId(listId);
        const tasks = await fetchSprintTasks(listId);
        if (cancelled || tasks.length === 0) return;
        const nextProjectData = computeProjectProgress(tasks);
        setProjectData(nextProjectData);
        writeSnapshot(snapshotKey, {
          sprintListId: listId,
          projectData: nextProjectData,
        });
      } catch {
        // Keep the last snapshot rendered when refresh fails.
      } finally {
        if (!cancelled) setLoading(false);
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
  }, [currentSprint]);

  const rows = useMemo(() => {
    return PROJECTS.map((p) => {
      const data = projectData[p.name] || { donePts: 0, totalPts: 0 };
      const pct =
        data.totalPts > 0
          ? Math.round((data.donePts / data.totalPts) * 100)
          : 0;
      const lagging = sprintPct - pct > LAG_THRESHOLD;
      return {
        name: p.name,
        pct,
        donePts: data.donePts,
        totalPts: data.totalPts,
        lagging,
      };
    });
  }, [projectData, sprintPct]);

  return (
    <div className="rounded-2xl grow bg-bg-widget p-[1.2rem] h-full box-border overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.4)]">
      <header className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <Zap size={22} className="text-purple-accent shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[1.26rem] font-bold text-white leading-none tracking-tight [filter:drop-shadow(0_0_6px_rgba(179,136,255,0.6))]">
              {currentSprint ? `Sprint ${currentSprint.sprint}` : "sprint progress."}
            </span>
            {currentSprint && (() => {
              const daysLeft = getSprintDaysLeft(currentSprint, now);
              const isToday = daysLeft === 0;
              return (
                <span className="inline-flex items-center gap-1.5 text-[0.84rem] font-medium tracking-wide leading-none">
                  <span className="text-text-soft opacity-60">{formatSprintDates(currentSprint)}</span>
                  {isToday ? (
                    <span className="px-1.5 py-0.5 rounded text-[0.85em] font-semibold bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.3)] leading-none">
                      Até hoje!
                    </span>
                  ) : daysLeft > 0 ? (
                    <span className="px-1.5 py-0.5 rounded text-[0.85em] font-semibold bg-[rgba(179,136,255,0.12)] text-purple-accent border border-[rgba(179,136,255,0.25)] leading-none">
                      Faltam {daysLeft}d
                    </span>
                  ) : null}
                </span>
              );
            })()}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[0.86rem] text-text-soft opacity-60 tabular-nums whitespace-nowrap">
          <Clock3 size={12} />
          <span className="font-semibold">{clockStr}</span>
          <span className="opacity-50">·</span>
          <span>{dateStr}</span>
        </div>
      </header>

      <div className="flex gap-3 items-stretch">
        {/* Coluna de labels */}
        <div className="w-28 shrink-0 flex flex-col gap-4 pt-4">
          {rows.map((row) => (
            <span key={row.name} className={`h-[22px] flex items-center justify-end text-[0.8em] opacity-[0.85] ${row.lagging ? "text-orange-400 !opacity-100" : "text-text-soft"}`}>
              {row.name}
            </span>
          ))}
        </div>

        {/* Coluna das barras com linha contínua */}
        <div className="flex-1 flex flex-col gap-4 relative pt-4">
          {rows.map((row) => (
            <div key={row.name} className="h-[22px] bg-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden border border-[rgba(179,136,255,0.15)]">
              <div
                className={getProgressFillClassName(row)}
                style={{ width: `${getProgressFillWidth(row.pct)}%` }}
              />
            </div>
          ))}
          {/* Linha vertical contínua com marcador */}
          <div
            className="absolute top-2 bottom-[-8px] pointer-events-none z-10"
            style={{ left: `${sprintPct}%` }}
          >
            {/* Marcador circular */}
            <div className="absolute left-0 -translate-x-1/2 -top-[1.65rem] w-[1.65rem] h-[1.65rem] rounded-full border-2 border-white/40 bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[0.55rem] font-bold text-white/80 leading-none">
              {sprintPct}%
            </div>
            {/* Linha tracejada */}
            <div className="absolute top-0 bottom-0 left-0 w-0 border-l-2 border-dashed border-white/40" />
          </div>
        </div>

        {/* Coluna de percentuais */}
        <div className="flex flex-col gap-4 pt-4">
          {rows.map((row) => (
            <span key={row.name} className={`h-[22px] flex items-center w-[2.8em] ${getProgressPctClassName(row)}`}>{row.pct}%</span>
          ))}
        </div>

        {/* Coluna de ícones */}
        <div className="flex flex-col gap-4 pt-4">
          {rows.map((row) => (
            <span key={row.name} className="h-[22px] w-[1em] flex items-center justify-center text-[0.85em] text-orange-500">
              {row.lagging ? <TriangleAlert size={14} /> : null}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", height: 0 }}>
        {loading && (
          <div className="text-purple-accent opacity-50" style={{ position: "absolute", top: 6, right: 0 }}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: "spinIcon 0.8s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        )}
      </div>

      <DevCards sprintListId={sprintListId} />
    </div>
  );
}
