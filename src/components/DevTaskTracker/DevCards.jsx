import { useState, useEffect } from "react";
import {
  CLICKUP_TEAM_ID,
  STORY_POINTS_FIELD_NAME,
  CLIENTE_FIELD_NAME,
  STATUS_IN_PROGRESS,
  DEVELOPERS,
} from "../../config/clickupConfig";
import { clickupApi } from "../../services/clickupApi";
import "./DevTaskTracker.css";

const PROXY_URL = import.meta.env.VITE_CLICKUP_PROXY_URL;
const FETCH_INTERVAL = 30 * 60 * 1000;

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
  try {
    const data = await clickupApi.get("/team");
    const team = (data.teams || []).find((t) => t.id === CLICKUP_TEAM_ID);
    return team?.members || [];
  } catch {
    return [];
  }
}

async function fetchInProgressTasks(userId, listId) {
  try {
    const path = listId
      ? `/list/${listId}/task?assignees[]=${userId}&statuses[]=${encodeURIComponent(STATUS_IN_PROGRESS)}&include_closed=true`
      : `/team/${CLICKUP_TEAM_ID}/task?assignees[]=${userId}&statuses[]=${encodeURIComponent(STATUS_IN_PROGRESS)}`;
    const data = await clickupApi.get(path);
    return data.tasks || [];
  } catch {
    return [];
  }
}

function DevAvatar({ name, src }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (src) {
    return <img className="dev-avatar" src={src} alt={name} />;
  }
  return <div className="dev-avatar dev-avatar--initials">{initials}</div>;
}

function DevCardSkeleton() {
  return (
    <div className="dev-card dev-card--skeleton">
      <div className="dev-skeleton dev-skeleton--avatar" />
      <div className="dev-skeleton dev-skeleton--name" />
      <div className="dev-skeleton dev-skeleton--title" />
      <div className="dev-skeleton dev-skeleton--title dev-skeleton--title-short" />
      <div className="dev-skeleton dev-skeleton--meta" />
    </div>
  );
}

export default function DevCards({ sprintListId }) {
  const [devs, setDevs] = useState(null);

  useEffect(() => {
    if (!PROXY_URL) {
      setDevs(DEVELOPERS.map((d) => ({ name: d.name, avatar: null, task: null, extraTasks: 0 })));
      return;
    }

    let cancelled = false;
    async function load() {
      const members = await fetchMembers();
      if (cancelled) return;

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

      if (!cancelled) setDevs(resolved);
    }

    load();
    const id = setInterval(load, FETCH_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sprintListId]);

  if (devs === null) {
    return (
      <div className="dev-tracker-grid">
        {DEVELOPERS.map((d) => (
          <DevCardSkeleton key={d.name} />
        ))}
      </div>
    );
  }

  return (
    <div className="dev-tracker-grid">
      {devs.map((dev) => (
        <div
          key={dev.name}
          className={`dev-card${!dev.task ? " dev-card--idle" : ""}`}
        >
          <div className="dev-card-main-info">
            <DevAvatar name={dev.name} src={dev.avatar} />
            <div className="dev-card-name">{dev.name}</div>
            {dev.extraTasks > 0 && (
              <span className="dev-card-extra">+{dev.extraTasks}</span>
            )}
          </div>
          {dev.task ? (
            <>
              <div className="dev-card-title" title={dev.task.title}>
                {dev.task.title}
              </div>
              <div className="dev-card-meta">
                <span className="dev-card-cliente">{dev.task.cliente}</span>
                {dev.task.points != null && (
                  <span className="dev-card-points">{dev.task.points} pts</span>
                )}
              </div>
            </>
          ) : (
            <div className="dev-card-idle"></div>
          )}
        </div>
      ))}
    </div>
  );
}
