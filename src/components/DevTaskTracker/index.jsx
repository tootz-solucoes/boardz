import { useState, useEffect } from "react";
import {
  CLICKUP_TEAM_ID,
  STORY_POINTS_FIELD_NAME,
  CLIENTE_FIELD_NAME,
  STATUS_IN_PROGRESS,
  DEVELOPERS,
} from "../../config/clickupConfig";
import "./DevTaskTracker.css";

const CLICKUP_TOKEN = import.meta.env.VITE_CLICKUP_TOKEN;
const FETCH_INTERVAL = 30 * 60 * 1000;

function getFieldValue(task, fieldName) {
  const fields = task.custom_fields || [];
  const field = fields.find(
    (f) => f.name?.toLowerCase() === fieldName.toLowerCase()
  );
  if (!field) return null;
  if (typeof field.value === "number") return field.value;
  if (field.value !== null && field.value !== undefined) return field.value;
  return null;
}

async function fetchMembers() {
  if (!CLICKUP_TOKEN) return [];
  const res = await fetch(
    `https://api.clickup.com/api/v2/team/${CLICKUP_TEAM_ID}/member`,
    { headers: { Authorization: CLICKUP_TOKEN } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.members || [];
}

async function fetchInProgressTask(userId) {
  if (!CLICKUP_TOKEN) return null;
  const res = await fetch(
    `https://api.clickup.com/api/v2/team/${CLICKUP_TEAM_ID}/task?assignees[]=${userId}&statuses[]=${encodeURIComponent(STATUS_IN_PROGRESS)}`,
    { headers: { Authorization: CLICKUP_TOKEN } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const tasks = data.tasks || [];
  return tasks[0] || null;
}

// Mock data para fase 1 (layout)
const MOCK_DEV_DATA = [
  {
    name: "Adelino",
    avatar: null,
    task: { title: "Implementar autenticação OAuth", cliente: "Alpha", points: 8 },
  },
  {
    name: "Douglas",
    avatar: null,
    task: { title: "Refatorar módulo de relatórios", cliente: "Beta", points: 5 },
  },
  {
    name: "Eliaquim",
    avatar: null,
    task: { title: "Criar tela de dashboard do cliente", cliente: "Alpha", points: 13 },
  },
  {
    name: "Henrique",
    avatar: null,
    task: null,
  },
  {
    name: "Luan",
    avatar: null,
    task: { title: "Integração com API de pagamentos Pix", cliente: "Gamma", points: 8 },
  },
  {
    name: "Wendell",
    avatar: null,
    task: { title: "Correção de bugs no mobile", cliente: "Beta", points: 3 },
  },
];

function DevAvatar({ name, src }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        className="dev-avatar"
        src={src}
        alt={name}
        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
      />
    );
  }
  return <div className="dev-avatar dev-avatar--initials">{initials}</div>;
}

export default function DevTaskTracker() {
  const [devs, setDevs] = useState(MOCK_DEV_DATA);

  useEffect(() => {
    if (!CLICKUP_TOKEN || CLICKUP_TOKEN === "PLACEHOLDER") return;

    let cancelled = false;
    async function load() {
      const members = await fetchMembers();
      if (cancelled) return;

      const resolved = await Promise.all(
        DEVELOPERS.map(async (dev) => {
          const member = members.find(
            (m) => m.user?.email?.toLowerCase() === dev.email.toLowerCase()
          );
          if (!member) return { name: dev.name, avatar: null, task: null };

          const userId = member.user.id;
          const avatar = member.user.profilePicture || null;
          const task = await fetchInProgressTask(userId);
          if (cancelled) return { name: dev.name, avatar, task: null };

          if (!task) return { name: dev.name, avatar, task: null };

          return {
            name: dev.name,
            avatar,
            task: {
              title: task.name,
              cliente: getFieldValue(task, CLIENTE_FIELD_NAME) || "—",
              points: getFieldValue(task, STORY_POINTS_FIELD_NAME),
            },
          };
        })
      );

      if (!cancelled) setDevs(resolved);
    }

    load();
    const id = setInterval(load, FETCH_INTERVAL);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="widget dev-tracker-widget">
      <header>
        <h2>👨‍💻 devtz.</h2>
      </header>
      <div className="dev-tracker-grid">
        {devs.map((dev) => (
          <div key={dev.name} className={`dev-card${!dev.task ? " dev-card--idle" : ""}`}>
            <DevAvatar name={dev.name} src={dev.avatar} />
            <div className="dev-card-name">{dev.name}</div>
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
              <div className="dev-card-idle">— idle</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
