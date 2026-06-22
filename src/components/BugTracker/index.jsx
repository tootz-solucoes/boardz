import { useState, useEffect } from "react";
import { Bug, Calendar, CheckCircle2 } from "lucide-react";
import { CLIENTE_FIELD_NAME } from "../../config/clickupConfig";
import { clickupApi } from "../../services/clickupApi";
import { readSnapshot, writeSnapshot } from "../../utils/snapshotCache";

const PROXY_URL = import.meta.env.VITE_CLICKUP_PROXY_URL;
const FETCH_INTERVAL = 2 * 60 * 1000;
const SNAPSHOT_KEY_PREFIX = "bug-tracker";

const BUG_SHOW_STATUSES = ["a fazer", "em desenvolvimento", "aguardando equipe", "aguardando cliente"];

function getFieldValue(task, fieldName) {
  const fields = task.custom_fields || [];
  const field = fields.find((f) => f.name?.toLowerCase() === fieldName.toLowerCase());
  if (field) {
    if (field.value === null || field.value === undefined) return null;
    if (field.type === "drop_down") {
      const options = field.type_config?.options || [];
      const option = options.find((o) => o.orderindex === field.value);
      return option?.name ?? null;
    }
    return field.value;
  }
  return null;
}

function formatDueDate(dueDateMs) {
  if (!dueDateMs) return null;
  const d = new Date(Number(dueDateMs));
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function mapTaskToBug(task) {
  const status = task.status?.status?.toLowerCase() ?? "";
  const isRunning = status !== "a fazer";
  const assignee = task.assignees?.[0] ?? null;

  return {
    id: task.id,
    title: task.name,
    status: isRunning ? "em_execucao" : "disponivel",
    dueDate: formatDueDate(task.due_date),
    assignee: assignee ? { name: assignee.username, avatar: assignee.profilePicture } : null,
    project: getFieldValue(task, CLIENTE_FIELD_NAME) ?? "—",
  };
}

async function fetchBugs(sprintListId) {
  let allTasks = [];
  let page = 0;
  while (true) {
    const data = await clickupApi.get(
      `/list/${sprintListId}/task?include_closed=false&tags[]=bug&page=${page}`
    );
    const tasks = data.tasks || [];
    allTasks = [...allTasks, ...tasks];
    if (tasks.length < 100) break;
    page++;
  }
  return allTasks
    .filter((t) => {
      const status = t.status?.status?.toLowerCase() ?? "";
      return BUG_SHOW_STATUSES.includes(status);
    })
    .map(mapTaskToBug);
}

function BugAvatar({ assignee }) {
  if (!assignee) return null;
  if (assignee.avatar) {
    return (
      <img
        src={assignee.avatar}
        alt={assignee.name}
        className="w-9 h-9 rounded-full border border-[rgba(179,136,255,0.3)] shrink-0 object-cover"
      />
    );
  }
  const initials = assignee.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full border border-[rgba(179,136,255,0.3)] shrink-0 flex items-center justify-center bg-linear-to-br from-purple-deep to-purple-dark text-text-soft text-[0.6em] font-semibold">
      {initials}
    </div>
  );
}

const SKELETON_BAR =
  "rounded-[6px] bg-gradient-to-r from-[rgba(255,255,255,0.05)] via-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.05)] bg-[length:200%_100%] [animation:skeleton-loading_1.4s_infinite_linear]";

function BugCardSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 bg-bg-card border border-[rgba(179,136,255,0.08)] rounded-lg p-2 opacity-50">
      <div className="flex justify-between items-center">
        <div className={`${SKELETON_BAR} w-16 h-[1.2em] rounded-full`} />
        <div className={`${SKELETON_BAR} w-24 h-[1em] rounded-full`} />
      </div>
      <div className={`${SKELETON_BAR} w-full h-[0.7em]`} />
      <div className={`${SKELETON_BAR} w-3/4 h-[0.7em]`} />
      <div className="flex justify-between items-center">
        <div className={`${SKELETON_BAR} w-14 h-[0.65em] rounded-full`} />
        <div className={`${SKELETON_BAR} w-20 h-[0.65em] rounded-full`} />
      </div>
    </div>
  );
}

function BugCard({ bug }) {
  const isRunning = bug.status === "em_execucao";

  return (
    <div className={`flex items-center gap-3 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors duration-200 ${
      bug.status === "disponivel"
        ? "bg-orange-950/40 border border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.25)] hover:bg-orange-950/60 animate-[bug-glow_2s_ease-in-out_infinite]"
        : "bg-bg-card border border-[rgba(179,136,255,0.08)] hover:bg-bg-elevated hover:border-[rgba(179,136,255,0.18)]"
    }`}>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p
          className="text-[0.825em] text-text-soft leading-[1.35] line-clamp-2 opacity-90"
          title={bug.title}
        >
          {bug.title}
        </p>
        <span className="flex items-center gap-1.5 text-[0.715em] text-text-dim opacity-70">
          {bug.dueDate && (
            <>
              <Calendar size={10} className="shrink-0" />
              {bug.dueDate}
              <span className="opacity-40">·</span>
            </>
          )}
          {isRunning ? "em execução" : "disponível"}
        </span>
      </div>

      <div className="shrink-0">
        {bug.assignee ? (
          <BugAvatar assignee={bug.assignee} />
        ) : (
          <div className="w-9 h-9 rounded-full border border-orange-500/60 bg-orange-950/60 flex items-center justify-center">
            <span className="text-orange-400 text-[0.55em] font-bold leading-none">?</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BugTracker({ sprintListId }) {
  const [bugs, setBugs] = useState(null);

  useEffect(() => {
    if (!PROXY_URL || !sprintListId) return;

    let cancelled = false;
    const snapshotKey = `${SNAPSHOT_KEY_PREFIX}:${sprintListId}`;
    const cached = readSnapshot(snapshotKey, FETCH_INTERVAL);

    if (cached?.value) {
      setBugs(cached.value);
    }

    async function load() {
      try {
        const result = await fetchBugs(sprintListId);
        if (cancelled) return;
        setBugs(result);
        writeSnapshot(snapshotKey, result);
      } catch {
        // Keep last snapshot on failure
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

  const isLoading = bugs === null;
  const isEmpty = bugs !== null && bugs.length === 0;

  return (
    <div className="rounded-2xl grow bg-bg-widget p-[1.2rem] box-border overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col gap-4 min-h-0">
      <div className="flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <Bug
            size={22}
            className="text-purple-accent shrink-0"
            style={{ filter: "drop-shadow(0 0 6px rgba(179,136,255,0.5))" }}
          />
          <div>
            <h2
              className="text-[1.26rem] font-bold text-white leading-tight"
              style={{ textShadow: "0 0 18px rgba(179,136,255,0.35)" }}
            >
              Bug Tracker
            </h2>
            <p className="text-[0.84rem] text-text-soft opacity-60 leading-tight mt-0.5">
              bugs disponíveis e em execução
            </p>
          </div>
        </div>

        {!isLoading && !isEmpty && (
          <span className="shrink-0 text-[0.65em] font-bold text-purple-accent bg-[rgba(179,136,255,0.12)] border border-[rgba(179,136,255,0.25)] rounded-full px-[0.6em] py-[0.3em] mt-1">
            {bugs.length}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <BugCardSkeleton key={i} />)
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 opacity-50">
            <CheckCircle2 size={28} className="text-emerald-400" />
            <span className="text-[0.8em] text-text-dim">Nenhum bug no radar</span>
          </div>
        ) : (
          bugs.map((bug) => <BugCard key={bug.id} bug={bug} />)
        )}
      </div>
    </div>
  );
}
