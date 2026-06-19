import { useEffect, useState, useMemo } from "react";
import { Cake, CalendarDays, ClipboardList, MapPin, PartyPopper, Popcorn, UserRound } from "lucide-react";
import LembrettzBadge from "./Badge";
import { getAllHolidays, getAllOptionalDays, normalizeDate } from "../Calendar2026/utils";
import { aniversariantes } from "../CalendarGeral2026/aniversariantesData";
import { confraternizacoes } from "../CalendarGeral2026/confraternizacoesData";

const SWEET_DAY_SHEET_ID = "1UBZcGXJJDd2FJTZ0AA-m-IM8iQ6YIFmdGAl7AvnPAT4";
const SWEET_DAY_SHEET_URL = `https://opensheet.elk.sh/${SWEET_DAY_SHEET_ID}/1`;

function getStartOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date) {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getFirstFridayOfMonth(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  while (first.getDay() !== 5) first.setDate(first.getDate() + 1);
  return first;
}

function getLastFridayOfMonth(date) {
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  while (last.getDay() !== 5) last.setDate(last.getDate() - 1);
  return last;
}

function useNow(interval = 60000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

function useSweetDay(now) {
  const [sweetDay, setSweetDay] = useState({ names: null, error: null });
  useEffect(() => {
    let cancelled = false;
    fetch(SWEET_DAY_SHEET_URL)
      .then((res) => res.json())
      .then((data) => {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        if (today.getDay() === 0) today.setDate(today.getDate() + 1);
        const current = data.find((row) => {
          const rowDate = new Date(row["Data"]);
          rowDate.setDate(rowDate.getDate() - 2);
          rowDate.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(rowDate);
          endOfWeek.setDate(rowDate.getDate() + 7);
          return rowDate <= today && today <= endOfWeek;
        });
        if (cancelled) return;
        setSweetDay(current
          ? { names: (current["Pagantes"] || "").replace("&", "e").trim(), error: null }
          : { names: null, error: null }
        );
      })
      .catch(() => { if (!cancelled) setSweetDay({ names: null, error: "Erro ao carregar dupla." }); });
    return () => (cancelled = true);
  }, [now]);
  return sweetDay;
}

function formatShortDate(date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function useWeekCalendarEvents(now) {
  return useMemo(() => {
    const year = now.getFullYear();
    const weekStart = getStartOfWeek(now);
    const weekEnd = getEndOfWeek(now);
    const inWeek = (date) => {
      const d = normalizeDate(date);
      return d >= normalizeDate(weekStart) && d <= normalizeDate(weekEnd);
    };
    const holidays = getAllHolidays(year).filter((h) => inWeek(h.date));
    const optionals = getAllOptionalDays(year).filter((h) => inWeek(h.date));
    const events = confraternizacoes
      .filter((c) => c.data && inWeek(new Date(c.data + "T12:00:00")))
      .map((c) => ({ date: new Date(c.data + "T12:00:00"), type: "event", name: c.evento }));
    return [...holidays, ...optionals, ...events].sort(
      (a, b) => normalizeDate(a.date) - normalizeDate(b.date)
    );
  }, [now]);
}

function useMonthBirthdays(now) {
  return useMemo(() => {
    const month = now.getMonth() + 1;
    return aniversariantes
      .filter((a) => { const [, m] = a.data.split("-").map(Number); return m === month; })
      .sort((a, b) => Number(a.data.split("-")[2]) - Number(b.data.split("-")[2]));
  }, [now]);
}

function calendarEventIcon(type) {
  if (type === "national" || type === "state" || type === "municipal") return <CalendarDays size={14} />;
  if (type === "optional") return <MapPin size={14} />;
  if (type === "event") return <PartyPopper size={14} />;
  return <CalendarDays size={14} />;
}

function calendarEventBadgeClass(type) {
  if (type === "national" || type === "state" || type === "municipal") return "badge-calendar-holiday";
  if (type === "optional") return "badge-calendar-optional";
  if (type === "event") return "badge-calendar-event";
  return "";
}

export default function Lembrettz() {
  const now = useNow(60000);
  const sweetDay = useSweetDay(now);
  const weekEvents = useWeekCalendarEvents(now);
  const monthBirthdays = useMonthBirthdays(now);

  const isTuesday = now.getDay() === 2;
  const isWednesday = now.getDay() === 3;
  const isFriday = now.getDay() === 5;

  const tuesdayPulse =
    (isTuesday && now.getHours() === 12 && now.getMinutes() >= 30) ||
    (isTuesday && now.getHours() === 13 && now.getMinutes() <= 30);

  const fridayPulse =
    isFriday &&
    (now.getHours() === 14 || now.getHours() === 15 || (now.getHours() === 16 && now.getMinutes() <= 30));

  const weekStart = getStartOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const firstFriday = getFirstFridayOfMonth(now);
  const lastFriday = getLastFridayOfMonth(now);
  const isFirstWeek = weekStart <= firstFriday && firstFriday <= weekEnd;
  const isLastFridayWeek = weekStart <= lastFriday && lastFriday <= weekEnd;

  return (
    <div className="rounded-2xl grow bg-bg-widget p-[1.2rem] shadow-[0_0_30px_rgba(0,0,0,0.4)]">
      <header className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <ClipboardList size={22} className="text-purple-accent shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[1.26rem] font-bold text-white leading-none tracking-tight [filter:drop-shadow(0_0_6px_rgba(179,136,255,0.6))]">lembrettz.</span>
            <span className="text-[0.84rem] text-text-soft opacity-60 font-medium tracking-wide leading-none">eventos & avisos da semana</span>
          </div>
        </div>
      </header>
      <div className="flex flex-col gap-[0.75em]">
        <LembrettzBadge pulse={tuesdayPulse} className={isWednesday ? "badge-highlight-today" : ""}>
          <span className="inline-flex items-center gap-[0.35rem]"><Popcorn size={14} /><b>Brigadeiro:</b></span>{" "}
          {sweetDay.error
            ? <span style={{ color: "red" }}>{sweetDay.error}</span>
            : sweetDay.names || <span style={{ color: "#bbb" }}>Sem info</span>
          }
        </LembrettzBadge>

        {isFriday && (
          <LembrettzBadge pulse={fridayPulse} className="badge-highlight-today">
            <span className="inline-flex items-center gap-[0.35rem]"><PartyPopper size={14} /><b>Sexta:</b> Coringagem</span>
          </LembrettzBadge>
        )}

        {isFirstWeek && (
          <LembrettzBadge className={isFriday ? "badge-highlight-today" : ""}>
            <span className="inline-flex items-center gap-[0.35rem]"><UserRound size={14} /><b>Sexta da Véia</b></span>
          </LembrettzBadge>
        )}

        {isLastFridayWeek && (
          <LembrettzBadge className={isFriday ? "badge-highlight-today" : ""}>
            <span className="inline-flex items-center gap-[0.35rem]"><PartyPopper size={14} /><b>Sexta:</b> Happy Hour</span>
          </LembrettzBadge>
        )}

        {weekEvents.map((ev, i) => (
          <LembrettzBadge key={i} className={calendarEventBadgeClass(ev.type)}>
            <span className="inline-flex items-center gap-[0.35rem]">{calendarEventIcon(ev.type)}</span>{" "}
            <b>{formatShortDate(ev.date)}</b> {ev.name}
          </LembrettzBadge>
        ))}

        {monthBirthdays.map((a) => {
          const [, , day] = a.data.split("-");
          const isToday = Number(day) === now.getDate();
          return (
            <LembrettzBadge key={a.nome} className={isToday ? "badge-highlight-today" : "badge-birthday"}>
              <span className="inline-flex items-center gap-[0.35rem]"><Cake size={14} /><b>{a.nome}</b></span>{" "}
              <span style={{ opacity: 0.75 }}>
                {day}/{String(now.getMonth() + 1).padStart(2, "0")}
              </span>
            </LembrettzBadge>
          );
        })}
      </div>
    </div>
  );
}
