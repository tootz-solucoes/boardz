import { useMemo } from "react";
import { aniversariantes } from "./aniversariantesData";
import "./CalendarGeral2026.css";

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

function getCurrentMonthIndex() {
  const monthText = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    month: "numeric",
  }).format(new Date());
  const monthIndex = Number(monthText) - 1;
  return Number.isNaN(monthIndex) ? new Date().getMonth() : monthIndex;
}

function getCurrentDayNumber() {
  const dayText = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "numeric",
  }).format(new Date());
  const dayNumber = Number(dayText);
  return Number.isNaN(dayNumber) ? new Date().getDate() : dayNumber;
}

export function AniversariantesMesWidget() {
  const monthIndex = getCurrentMonthIndex();
  const currentDay = getCurrentDayNumber();
  const title = "🎂 aniversarianttz.";

  const aniversariantesDoMes = useMemo(() => {
    return aniversariantes
      .map((a) => ({ ...a, dateObj: parseDateUTC3(a.data) }))
      .filter((a) => a.dateObj.getMonth() === monthIndex)
      .sort((a, b) => a.dateObj.getDate() - b.dateObj.getDate());
  }, [monthIndex]);

  return (
    <div className="widget">
      <header>
        <h2>{title}</h2>
      </header>
      {aniversariantesDoMes.length === 0 ? (
        <div className="birthday-widget-empty">Nenhum aniversariante neste mês</div>
      ) : (
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
      )}
    </div>
  );
}
