import { useState, useEffect, useMemo } from "react";
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
  const fmt = (d) =>
    d
      .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      .replace(".", "");
  return `${fmt(start)} → ${fmt(end)}`;
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

  const sprintTitle = currentSprint
    ? `⚡ Sprint ${currentSprint.sprint} · ${formatSprintDates(currentSprint)}`
    : "⚡ sprint progress.";

  return (
    <div className="widget sprint-progress-widget">
      <header>
        <h2>{sprintTitle}</h2>
        <span className="sprint-clock">
          🕐 {clockStr} · {dateStr}
        </span>
      </header>

      <div className="sprint-progress-rows">
        {/* Linha da sprint (régua) */}
        <div className="sprint-row sprint-row--timeline">
          <span className="sprint-row-label">
            {currentSprint ? `Sprint ${currentSprint.sprint}` : "Sprint"}
          </span>
          <div className="sprint-bar-track">
            <div
              className="sprint-bar-fill sprint-bar-fill--timeline"
              style={{ width: `${sprintPct}%` }}
            />
          </div>
          <span className="sprint-row-pct">{sprintPct}%</span>
          <span className="sprint-row-alert" />
        </div>

        {/* Linhas dos projetos */}
        {rows.map((row) => (
          <div
            key={row.name}
            className={`sprint-row${row.lagging ? " sprint-row--lagging" : ""}`}
          >
            <span className="sprint-row-label">{row.name}</span>
            <div className="sprint-bar-track">
              <div
                className={`sprint-bar-fill${row.lagging ? " sprint-bar-fill--lagging" : ""}`}
                style={{ width: `${row.pct}%` }}
              />
              <div className="sprint-ref-marker" style={{ left: `${sprintPct}%` }} />
            </div>
            <span className="sprint-row-pct">{row.pct}%</span>
            <span className="sprint-row-alert">{row.lagging ? "⚠" : ""}</span>
          </div>
        ))}
      </div>

      {loading && <div className="sprint-loading">atualizando...</div>}

      <DevCards sprintListId={sprintListId} />
    </div>
  );
}
