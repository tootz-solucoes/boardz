import { useEffect, useState, useMemo } from "react";
import LembrettzBadge from "./Badge";

const SWEET_DAY_SHEET_ID = "1UBZcGXJJDd2FJTZ0AA-m-IM8iQ6YIFmdGAl7AvnPAT4";
const SWEET_DAY_SHEET_URL = `https://opensheet.elk.sh/${SWEET_DAY_SHEET_ID}/1`;

function getStartOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
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
        // Domingo: já avança para semana seguinte
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        if (today.getDay() === 0) {
          today.setDate(today.getDate() + 1);
        }
        const current = data.find((row) => {
          const rowDate = new Date(row["Data"]);
          rowDate.setDate(rowDate.getDate() - 2);
          rowDate.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(rowDate);
          endOfWeek.setDate(rowDate.getDate() + 7);
          return rowDate <= today && today <= endOfWeek;
        });
        if (cancelled) return;
        if (current) {
          setSweetDay({
            names: (current["Pagantes"] || "").replace("&", "e").trim(),
            error: null,
          });
        } else {
          setSweetDay({
            names: null,
            error: null,
          });
        }
      })
      .catch(() => {
        if (!cancelled)
          setSweetDay({ names: null, error: "Erro ao carregar dupla." });
      });
    return () => (cancelled = true);
  }, [now]);
  return sweetDay;
}

export default function Lembrettz() {
  const now = useNow(60000);
  const sweetDay = useSweetDay(now);

  const isTuesday = now.getDay() === 2;
  const isFriday = now.getDay() === 5;

  const tuesdayPulse =
    isTuesday && now.getHours() === 12 && now.getMinutes() >= 30
      ? true
      : isTuesday && now.getHours() === 13 && now.getMinutes() <= 30;

  const fridayPulse =
    isFriday &&
    (now.getHours() === 14 ||
      now.getHours() === 15 ||
      (now.getHours() === 16 && now.getMinutes() <= 30));

  // Cálculo das semanas especiais
  const weekStart = getStartOfWeek(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const firstFriday = getFirstFridayOfMonth(now);
  const lastFriday = getLastFridayOfMonth(now);

  const isFirstWeek = weekStart <= firstFriday && firstFriday <= weekEnd;
  const isLastFridayWeek = weekStart <= lastFriday && lastFriday <= weekEnd;

  return (
    <div className="widget">
      <header>
        <h2>⏰ lembrettz.</h2>
      </header>
      <div className="reminders">
        <LembrettzBadge pulse={tuesdayPulse}>
          <b>🧁Terça do Brigadeiro:</b>{" "}
          {sweetDay.error ? (
            <span style={{ color: "red" }}>{sweetDay.error}</span>
          ) : (
            sweetDay.names || <span style={{ color: "#bbb" }}>Sem info</span>
          )}
        </LembrettzBadge>

        {/* Só mostra nas sextas */}
        {isFriday && (
          <LembrettzBadge pulse={fridayPulse}>
            <b>Sexta:</b> Coringagem🃏
          </LembrettzBadge>
        )}

        {/* Só mostra na primeira semana do mês */}
        {isFirstWeek && (
          <LembrettzBadge>
            <b>Sexta da Véia</b>👵🏻
          </LembrettzBadge>
        )}

        {/* Só mostra na semana do último friday */}
        {isLastFridayWeek && (
          <LembrettzBadge>
            <b>Sexta:</b> Happy Hour🎉
          </LembrettzBadge>
        )}
      </div>
    </div>
  );
}
