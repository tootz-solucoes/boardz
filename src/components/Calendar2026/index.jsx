import { useMemo, useState } from "react";
import { ChartColumn } from "lucide-react";
import {
  isWeekend,
  isHoliday,
  isOptionalDay,
  getHolidayType,
  getHolidayName,
  getOptionalDayName,
  getSprintColor,
  getSprintColorLight,
  normalizeDate,
  isWorkingDay,
  getWeekDayName,
  formatDate,
} from "./utils";
import { sprintsData } from "./sprintsData";
import "./Calendar2026.css";

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

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function Calendar2026() {
  const [tooltip, setTooltip] = useState({
    show: false,
    text: "",
    x: 0,
    y: 0,
    position: "top",
  });

  const sprintPeriods = useMemo(() => {
    return sprintsData.map((sprint) => ({
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
  }, []);

  const sprintMap = useMemo(() => {
    const map = new Map();
    sprintPeriods.forEach((period) => {
      const currentDate = new Date(period.calendarStart);
      const endDate = new Date(period.calendarEnd);
      endDate.setHours(23, 59, 59, 999);

      while (currentDate <= endDate) {
        const dateKey = normalizeDate(new Date(currentDate)).getTime();
        map.set(dateKey, period.sprint);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return map;
  }, [sprintPeriods]);

  const sprintWorkingDaysMap = useMemo(() => {
    const map = new Map();
    sprintPeriods.forEach((period) => {
      const currentDate = new Date(period.calendarStart);
      const endDate = new Date(period.calendarEnd);
      endDate.setHours(23, 59, 59, 999);
      let workingDayCount = 0;
      let calendarDayCount = 0;

      while (currentDate <= endDate) {
        const normalized = normalizeDate(new Date(currentDate));
        const dateKey = normalized.getTime();
        calendarDayCount++;

        if (isWorkingDay(normalized, 2026)) {
          workingDayCount++;
          map.set(dateKey, {
            sprint: period.sprint,
            workingDay: workingDayCount,
            calendarDay: calendarDayCount,
          });
        } else {
          map.set(dateKey, {
            sprint: period.sprint,
            workingDay: null,
            calendarDay: calendarDayCount,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    return map;
  }, [sprintPeriods]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const year = 2026;
      const daysInMonth = getDaysInMonth(year, monthIndex);
      const firstDay = getFirstDayOfMonth(year, monthIndex);
      const days = [];

      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        days.push(date);
      }

      return {
        monthIndex,
        monthName: MONTH_NAMES[monthIndex],
        days,
      };
    });
  }, []);

  function getSprintForDate(date) {
    const dateKey = normalizeDate(date).getTime();
    return sprintMap.get(dateKey) || null;
  }

  function isSprintBoundary(date) {
    const sprintNumber = getSprintForDate(date);
    if (!sprintNumber) return false;

    const period = sprintPeriods.find((p) => p.sprint === sprintNumber);
    if (!period) return false;

    const normalizedDateValue = normalizeDate(date).getTime();
    const startTime = period.calendarStart.getTime();
    const endTime = period.calendarEnd.getTime();

    return normalizedDateValue === startTime || normalizedDateValue === endTime;
  }

  const DAY_BASE = "aspect-square min-h-[50px] flex flex-col items-center justify-center p-1 border rounded-lg relative transition-all duration-200 cursor-help hover:scale-[1.08] hover:z-10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),_0_0_0_1px_rgba(179,136,255,0.2)] hover:border-[rgba(179,136,255,0.3)]";
  const DAY_EMPTY = "aspect-square min-h-[50px] flex flex-col items-center justify-center p-1 rounded-lg relative bg-transparent border-transparent cursor-default";

  function getDayBorderStyle(date) {
    const sprintNumber = getSprintForDate(date);
    if (!sprintNumber) return {};

    const isWeekendDay = isWeekend(date);
    const isHolidayDay = isHoliday(date, 2026);
    const isOptionalDayDay = isOptionalDay(date, 2026);
    const isNonWorkingDay = isWeekendDay || isHolidayDay || isOptionalDayDay;
    const isBoundary = isSprintBoundary(date);

    const borderStyle = isNonWorkingDay ? "dashed" : "solid";
    const borderWidth = isBoundary ? "3px" : "2px";

    return {
      borderWidth,
      borderColor: getSprintColor(sprintNumber),
      borderStyle,
    };
  }

  function getDayStyle(date, sprintNumber) {
    if (!sprintNumber) return {};

    return {
      backgroundColor: getSprintColorLight(sprintNumber),
    };
  }

  function handleDayMouseEnter(e, date) {
    const tooltipText = getDayTooltip(date);
    if (!tooltipText) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipHeight = 60;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    const showAbove =
      spaceAbove >= tooltipHeight + 10 || spaceAbove > spaceBelow;

    setTooltip({
      show: true,
      text: tooltipText,
      x: rect.left + rect.width / 2,
      y: showAbove ? rect.top : rect.bottom,
      position: showAbove ? "top" : "bottom",
    });
  }

  function handleDayMouseLeave() {
    setTooltip({ show: false, text: "", x: 0, y: 0, position: "top" });
  }

  function getDayTooltip(date) {
    const parts = [];
    const normalized = normalizeDate(date);
    const dateKey = normalized.getTime();
    const sprintInfo = sprintWorkingDaysMap.get(dateKey);

    if (sprintInfo) {
      const { sprint, workingDay, calendarDay } = sprintInfo;

      if (workingDay !== null) {
        if (workingDay === 1) {
          parts.push(
            `Sprint ${sprint}: ${calendarDay}º dia corrido / ${workingDay}º dia útil (primeiro dia útil)`
          );
        } else {
          parts.push(
            `Sprint ${sprint}: ${calendarDay}º dia corrido / ${workingDay}º dia útil`
          );
        }
      } else {
        parts.push(
          `Sprint ${sprint}: ${calendarDay}º dia corrido (período corrido)`
        );
      }

      const holidayName = getHolidayName(date, 2026);
      if (holidayName) {
        const holidayType = getHolidayType(date, 2026);
        const typeLabel =
          holidayType === "national"
            ? "Feriado Nacional"
            : holidayType === "state"
            ? "Feriado Estadual (RN)"
            : holidayType === "municipal"
            ? "Feriado Municipal (Natal)"
            : "Feriado";
        parts.push(`${holidayName} (${typeLabel})`);
      }

      const optionalName = getOptionalDayName(date, 2026);
      if (optionalName) {
        parts.push(`${optionalName} (Ponto Facultativo)`);
      }

      if (isWeekend(date)) {
        parts.push("Final de semana");
      }
    } else {
      if (isHoliday(date, 2026)) {
        const holidayName = getHolidayName(date, 2026);
        const holidayType = getHolidayType(date, 2026);
        const typeLabel =
          holidayType === "national"
            ? "Feriado Nacional"
            : holidayType === "state"
            ? "Feriado Estadual (RN)"
            : holidayType === "municipal"
            ? "Feriado Municipal (Natal)"
            : "Feriado";
        parts.push(`${holidayName} (${typeLabel})`);
      }

      const optionalName = getOptionalDayName(date, 2026);
      if (optionalName) {
        parts.push(`${optionalName} (Ponto Facultativo)`);
      }

      if (isWeekend(date)) {
        parts.push("Final de semana");
      }

      if (parts.length === 0) {
        return "Dia útil (fora do período de sprints)";
      }
    }

    return parts.join(" - ");
  }

  const LEGEND_COLOR_BASE = "w-6 h-6 rounded-[4px] border border-[rgba(255,255,255,0.2)]";
  const SPRINT_LABEL = "absolute top-[3px] right-[4px] text-[0.7rem] font-extrabold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] bg-[linear-gradient(135deg,rgba(0,0,0,0.6),rgba(0,0,0,0.4))] py-[2px] px-[6px] rounded-[4px] tracking-[0.5px] border border-[rgba(255,255,255,0.1)]";

  return (
    <div className="w-full relative">
      {tooltip.show && (
        <div
          className={`calendar-tooltip-${tooltip.position} fixed bg-[linear-gradient(135deg,#1e1e24,#2a2a2e)] text-white py-2 px-3 rounded-lg text-[0.875rem] font-medium shadow-[0_4px_12px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(179,136,255,0.2)] pointer-events-none z-[10000] border border-[rgba(179,136,255,0.3)] max-w-[300px] break-words text-center`}
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="flex gap-8 mb-8 p-4 bg-bg-surface rounded-xl flex-wrap">
        <div className="flex items-center gap-2 text-text-soft text-[0.9rem]">
          <div className={`${LEGEND_COLOR_BASE} bg-[#3a3a3a]`} />
          <span>Finais de Semana</span>
        </div>
        <div className="flex items-center gap-2 text-text-soft text-[0.9rem]">
          <div className={`${LEGEND_COLOR_BASE} bg-gradient-to-br from-[#dc2626] to-[#b91c1c] shadow-[0_0_8px_rgba(220,38,38,0.4)]`} />
          <span>Feriados</span>
        </div>
        <div className="flex items-center gap-2 text-text-soft text-[0.9rem]">
          <div className={`${LEGEND_COLOR_BASE} bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[0_0_8px_rgba(245,158,11,0.4)]`} />
          <span>Pontos Facultativos</span>
        </div>
        <div className="flex items-center gap-2 text-text-soft text-[0.9rem]">
          <div className={`${LEGEND_COLOR_BASE} bg-gradient-to-br from-[#3b82f6] to-[#10b981] shadow-[0_0_8px_rgba(59,130,246,0.4)]`} />
          <span>Sprints</span>
        </div>
      </div>

      <div className="grid grid-cols-2 max-[1200px]:grid-cols-1 gap-8">
        {months.map(({ monthIndex, monthName, days }) => (
          <div key={monthIndex} className="bg-gradient-to-br from-[#1e1e24] to-[#252529] rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-purple-accent [text-shadow:0_0_5px_rgba(200,166,255,0.4)] mb-4 text-[1.5rem] text-center">{monthName}</h3>
            <div className="w-full">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="text-center py-2 font-semibold text-purple-accent text-[0.85rem]">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} className={DAY_EMPTY} />;

                  const sprintNumber = getSprintForDate(date);
                  const normalizedDate = normalizeDate(date);
                  const isBoundary = isSprintBoundary(date);
                  const isWeekendDay = isWeekend(date);
                  const isHolidayDay = isHoliday(date, 2026);
                  const isOptionalDayDay = isOptionalDay(date, 2026);
                  const isSprintWorkingDay = sprintNumber && isWorkingDay(date, 2026);
                  const combinedStyle = { ...getDayStyle(date), ...getDayBorderStyle(date) };

                  let bgBorder;
                  if (isHolidayDay && isWeekendDay) bgBorder = "bg-gradient-to-br from-[#b91c1c] to-[#991b1b] border-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.3)]";
                  else if (isHolidayDay) bgBorder = "bg-gradient-to-br from-[#dc2626] to-[#b91c1c] border-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.3)]";
                  else if (isOptionalDayDay && isWeekendDay) bgBorder = "bg-gradient-to-br from-[#d97706] to-[#b45309] border-[#fbbf24] shadow-[0_0_8px_rgba(245,158,11,0.3)]";
                  else if (isOptionalDayDay) bgBorder = "bg-gradient-to-br from-[#f59e0b] to-[#d97706] border-[#fbbf24] shadow-[0_0_8px_rgba(245,158,11,0.3)]";
                  else if (isWeekendDay) bgBorder = "bg-gradient-to-br from-[#3a3a40] to-[#35353a] border-[rgba(255,255,255,0.1)] opacity-80";
                  else bgBorder = "bg-gradient-to-br from-[#2a2a2e] to-[#252529] border-[rgba(255,255,255,0.1)]";

                  const fontClass = isBoundary ? "font-bold" : isSprintWorkingDay ? "font-semibold" : "";
                  const dayNumberClass = isHolidayDay ? "text-base text-white font-semibold" : isWeekendDay ? "text-base text-[#bbb] font-medium" : "text-base text-white font-medium";

                  return (
                    <div
                      key={normalizedDate.getTime()}
                      className={`${DAY_BASE} ${bgBorder} ${fontClass}`.trimEnd()}
                      style={combinedStyle}
                      onMouseEnter={(e) => handleDayMouseEnter(e, date)}
                      onMouseLeave={handleDayMouseLeave}
                    >
                      <span className={dayNumberClass}>{date.getDate()}</span>
                      {sprintNumber && <span className={SPRINT_LABEL}>S{sprintNumber}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-br from-[#1e1e24] to-[#252529] rounded-2xl p-8 shadow-[0_4px_16px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)]">
        <h3 className="inline-flex items-center gap-[0.45rem] text-purple-accent [text-shadow:0_0_5px_rgba(200,166,255,0.4)] mb-6 text-[1.5rem] text-center w-full justify-center">
          <ChartColumn size={18} /> Detalhamento das Sprints
        </h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th className="text-left p-4 font-semibold text-[0.9rem] tracking-[0.5px]">Sprint</th>
                <th className="text-left p-4 font-semibold text-[0.9rem] tracking-[0.5px]">Início</th>
                <th className="text-left p-4 font-semibold text-[0.9rem] tracking-[0.5px]">Dia da Semana</th>
                <th className="text-left p-4 font-semibold text-[0.9rem] tracking-[0.5px]">Término</th>
                <th className="text-left p-4 font-semibold text-[0.9rem] tracking-[0.5px]">Dia da Semana</th>
                <th className="text-left p-4 font-semibold text-[0.9rem] tracking-[0.5px]">Dias Úteis</th>
                <th className="text-left p-4 font-semibold text-[0.9rem] tracking-[0.5px]">Dias Corridos</th>
              </tr>
            </thead>
            <tbody>
              {sprintPeriods.map((period) => {
                const workingDaysData = Array.from(sprintWorkingDaysMap.entries())
                  .filter(([, info]) => info.sprint === period.sprint && info.workingDay !== null)
                  .sort(([a], [b]) => a - b);
                const workingDays = workingDaysData.length;
                const workingStartDate = workingDaysData.length > 0 ? new Date(workingDaysData[0][0]) : period.calendarStart;
                const workingEndDate = workingDaysData.length > 0 ? new Date(workingDaysData[workingDaysData.length - 1][0]) : period.calendarEnd;
                const calendarStart = new Date(period.calendarStart);
                const calendarEnd = new Date(period.calendarEnd);
                calendarEnd.setHours(23, 59, 59, 999);
                let calendarDays = 0;
                const currentDate = new Date(calendarStart);
                while (currentDate <= calendarEnd) { calendarDays++; currentDate.setDate(currentDate.getDate() + 1); }

                return (
                  <tr key={period.sprint}>
                    <td className="text-center p-4 text-text-soft text-[0.9rem]">
                      <span className="w-8 h-8 rounded-lg text-white font-bold text-[0.95rem] inline-flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]" style={{ backgroundColor: getSprintColor(period.sprint) }}>
                        {period.sprint}
                      </span>
                    </td>
                    <td className="p-4 text-text-soft text-[0.9rem]">
                      {formatDate(period.calendarStart)}
                      {period.calendarStart.getTime() !== workingStartDate.getTime() && (
                        <span style={{ fontSize: "0.8em", color: "#999", display: "block" }}>(útil: {formatDate(workingStartDate)})</span>
                      )}
                    </td>
                    <td className="p-4 text-text-soft text-[0.9rem]">{getWeekDayName(period.calendarStart)}</td>
                    <td className="p-4 text-text-soft text-[0.9rem]">
                      {formatDate(period.calendarEnd)}
                      {period.calendarEnd.getTime() !== workingEndDate.getTime() && (
                        <span style={{ fontSize: "0.8em", color: "#999", display: "block" }}>(útil: {formatDate(workingEndDate)})</span>
                      )}
                    </td>
                    <td className="p-4 text-text-soft text-[0.9rem]">{getWeekDayName(period.calendarEnd)}</td>
                    <td className="text-center p-4 font-semibold text-purple-accent">{workingDays}</td>
                    <td className="text-center p-4 font-semibold text-purple-accent">{calendarDays}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Calendar2026;
