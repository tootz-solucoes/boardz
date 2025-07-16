import { useEffect, useState } from "react";

import mapSheetRows from "./mapSheetRows";
import WeeklyPlanningTable from "./Table";

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

  return (
    <div className="widget">
      <header style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
        <h1>📋 planejamento semanal</h1>
      </header>
      <WeeklyPlanningTable rows={rows} loading={loading} error={error} />
    </div>
  );
}
