import { useEffect, useState, useMemo } from "react";

import mapSheetRows from "./mapSheetRows";
import WeeklyPlanningTable from "./Table";
import { normalizeDate } from "../Calendar2026/utils";
import { sprintsData } from "../Calendar2026/sprintsData";

const WEEKLY_PLANNING_SHEET_ID = "1Ou52m0GMMBFj39TI7_4p1A3alDXOcqtWRWdWH7IV5tU";
const WEEKLY_PLANNING_SHEET_URL = `https://opensheet.elk.sh/${WEEKLY_PLANNING_SHEET_ID}/1`;
const DEVS = [
  "Milton",
  "Eliaquim",
  "Douglas",
  "Wendell",
  "Adelino",
  "Luan",
];

export default function WeeklyPlanning() {
  const [rows, setRows] = useState(() =>
    DEVS.map((dev) => ({ dev, days: ["", "", "", "", ""] }))
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch(WEEKLY_PLANNING_SHEET_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados");
        return res.json();
      })
      .then((data) => {
        setRows(mapSheetRows({ data, matchHeaders: true }));
        setError(null);
      })
      .catch(() => {
        setError("Erro ao carregar dados.");
        setRows(DEVS.map((dev) => ({ dev, days: ["", "", "", "", ""] })));
      })
      .finally(() => setLoading(false));
  }, []);

  // Calcular sprint atual e dias restantes
  const sprintInfo = useMemo(() => {
    const today = normalizeDate(new Date());
    const year = today.getFullYear();

    // Se não estiver em 2026, retorna null
    if (year !== 2026) return null;

    const sprintPeriods = sprintsData.map((sprint) => ({
      sprint: sprint.sprint,
      calendarStart: normalizeDate(
        new Date(
          sprint.calendarStart.year,
          sprint.calendarStart.month,
          sprint.calendarStart.day
        )
      ),
      calendarEnd: normalizeDate(
        new Date(
          sprint.calendarEnd.year,
          sprint.calendarEnd.month,
          sprint.calendarEnd.day
        )
      ),
    }));

    const todayKey = today.getTime();

    // Verifica se hoje está dentro de algum período de sprint
    const period = sprintPeriods.find(p => {
      const start = p.calendarStart.getTime();
      const end = p.calendarEnd.getTime();
      return todayKey >= start && todayKey <= end;
    });

    if (period) {
      const endDate = new Date(period.calendarEnd);
      endDate.setHours(23, 59, 59, 999);

      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return { sprint: period.sprint, daysRemaining: Math.max(0, daysRemaining) };
    }

    return null;
  }, []);

  return (
    <div className="widget">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5em", flexWrap: "wrap" }}>
        <h1>📋 planejamento semanal</h1>
        {sprintInfo && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.9rem",
            color: "#e5d7ff"
          }}>
            <span style={{
              background: "linear-gradient(135deg, #7c5acf 0%, #6b46c1 100%)",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(124, 90, 207, 0.3)"
            }}>
              ⚡ Sprint {sprintInfo.sprint}
            </span>
            <span style={{
              background: sprintInfo.daysRemaining <= 1
                ? "linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%)"
                : "rgba(255, 255, 255, 0.05)",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              fontWeight: "600",
              color: sprintInfo.daysRemaining <= 1 ? "#ffc107" : "#e5d7ff"
            }}>
              {sprintInfo.daysRemaining === 0
                ? "🏁 Encerra hoje"
                : sprintInfo.daysRemaining === 1
                ? `⏰ Faltam ${sprintInfo.daysRemaining} dia`
                : `📅 Faltam ${sprintInfo.daysRemaining} dias`
              }
            </span>
          </div>
        )}
      </header>
      <WeeklyPlanningTable rows={rows} loading={loading} error={error} />
    </div>
  );
}
