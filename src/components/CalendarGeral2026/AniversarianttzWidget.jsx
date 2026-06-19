import { useMemo } from "react";
import { Cake } from "lucide-react";
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
    <div className="rounded-2xl grow bg-bg-widget p-[1.2rem] shadow-[0_0_30px_rgba(0,0,0,0.4)]">
      <header className="flex justify-between items-center mb-2">
        <h2 className="inline-flex items-center gap-[0.45rem]"><Cake size={18} /> aniversarianttz.</h2>
      </header>
      <div className="grid [grid-template-columns:repeat(2,minmax(140px,1fr))] gap-3">
        {aniversariantesDoMes.map((a) => {
          const dayNumber = a.dateObj.getDate();
          const monthNumber = a.dateObj.getMonth() + 1;
          const isToday = dayNumber === currentDay;
          const dateLabel = `${String(dayNumber).padStart(2, "0")}/${String(monthNumber).padStart(2, "0")}`;
          return (
            <div
              key={`${a.nome}-${a.data}`}
              className={
                isToday
                  ? "flex items-center gap-3 py-[0.45rem] px-[0.7rem] rounded-xl bg-gradient-to-br from-[#e9b021] to-[#f59e0b] border border-[rgba(255,200,0,0.8)] text-white shadow-[0_6px_18px_rgba(245,158,11,0.45)]"
                  : "flex items-center gap-3 py-[0.45rem] px-[0.7rem] rounded-xl bg-gradient-to-br from-[#502f8d] to-[#47326e] border border-[rgba(98,70,142,0.45)] text-[#f1d8ff] shadow-[0_0_10px_rgba(98,70,142,0.5)]"
              }
            >
              <div className={
                isToday
                  ? "min-w-[2.6rem] h-[1.7rem] px-[0.4rem] rounded-full grid place-items-center bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.35)] font-bold text-white shrink-0 text-[0.75rem]"
                  : "min-w-[2.6rem] h-[1.7rem] px-[0.4rem] rounded-full grid place-items-center bg-[rgba(255,255,255,0.12)] border border-[rgba(241,216,255,0.25)] font-bold text-[#f1d8ff] shrink-0 text-[0.75rem]"
              }>
                {dateLabel}
              </div>
              <div className="font-semibold text-[0.95rem]">{a.nome}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
