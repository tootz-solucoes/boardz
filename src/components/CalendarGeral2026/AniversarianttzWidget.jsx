import { useMemo } from "react";
import { aniversariantes } from "./aniversariantesData";
import "./CalendarGeral2026.css";
import { ClockWidget } from "../ClockWidget";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const TIME_ZONE = "America/Recife";

function parseDateUTC3(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getTodayInTimeZone() {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  if (!year || !month || !day) {
    const fallback = new Date();
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }
  return new Date(year, month - 1, day);
}

export function AniversariantesMesWidget() {
  const today = getTodayInTimeZone();
  const monthIndex = today.getMonth();
  const currentDay = today.getDate();
  const title = "🎂 aniversarianttz.";

  const aniversariantesDoMes = useMemo(() => {
    return aniversariantes
      .map((a) => ({ ...a, dateObj: parseDateUTC3(a.data) }))
      .filter((a) => a.dateObj.getMonth() === monthIndex)
      .sort((a, b) => a.dateObj.getDate() - b.dateObj.getDate());
  }, [monthIndex]);

  if (aniversariantesDoMes.length === 0) {
    return <ClockWidget />;
  }

  return (
    <div className="widget">
      <header>
        <h2>{title}</h2>
      </header>
      <div className="birthday-cards">
        {aniversariantesDoMes.map((a) => {
          const dayNumber = a.dateObj.getDate();
          const monthNumber = a.dateObj.getMonth() + 1;
          const isToday = dayNumber === currentDay;
          const dateLabel = `${String(dayNumber).padStart(2, "0")}/${String(
            monthNumber
          ).padStart(2, "0")}`;
          return (
            <div
              key={`${a.nome}-${a.data}`}
              className={`birthday-card ${isToday ? "birthday-card-today" : ""}`}
            >
              <div className="birthday-day">{dateLabel}</div>
              <div className="birthday-name">{a.nome}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
