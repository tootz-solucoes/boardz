import { useMemo, useState } from "react";
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

  function getDayClassName(date) {
    const classes = ["calendar-day"];

    if (!date) {
      classes.push("calendar-day-empty");
      return classes.join(" ");
    }

    const sprintNumber = getSprintForDate(date);
    const isBoundary = isSprintBoundary(date);

    if (isBoundary) {
      classes.push("calendar-day-sprint-boundary");
    }

    if (isWeekend(date)) {
      classes.push("calendar-day-weekend");
    }

    if (isHoliday(date, 2026)) {
      const holidayType = getHolidayType(date, 2026);
      classes.push(`calendar-day-holiday calendar-day-holiday-${holidayType}`);
    }

    if (isOptionalDay(date, 2026)) {
      classes.push("calendar-day-optional");
    }

    if (sprintNumber && isWorkingDay(date, 2026)) {
      classes.push("calendar-day-sprint");
    }

    return classes.join(" ");
  }

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

  return (
    <div className="calendar-2026">
      {tooltip.show && (
        <div
          className={`calendar-tooltip calendar-tooltip-${tooltip.position}`}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
        </div>
      )}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color weekend"></div>
          <span>Finais de Semana</span>
        </div>
        <div className="legend-item">
          <div className="legend-color holiday"></div>
          <span>Feriados</span>
        </div>
        <div className="legend-item">
          <div className="legend-color optional"></div>
          <span>Pontos Facultativos</span>
        </div>
        <div className="legend-item">
          <div className="legend-color sprint"></div>
          <span>Sprints</span>
        </div>
      </div>

      <div className="calendar-months">
        {months.map(({ monthIndex, monthName, days }) => (
          <div key={monthIndex} className="calendar-month">
            <h3 className="calendar-month-title">{monthName}</h3>
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>
              <div className="calendar-days">
                {days.map((date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="calendar-day calendar-day-empty"
                      />
                    );
                  }

                  const sprintNumber = getSprintForDate(date);
                  const normalizedDate = normalizeDate(date);
                  const borderStyle = getDayBorderStyle(date);
                  const combinedStyle = {
                    ...getDayStyle(date),
                    ...borderStyle,
                  };

                  return (
                    <div
                      key={normalizedDate.getTime()}
                      className={getDayClassName(date)}
                      style={combinedStyle}
                      onMouseEnter={(e) => handleDayMouseEnter(e, date)}
                      onMouseLeave={handleDayMouseLeave}
                    >
                      <span className="calendar-day-number">
                        {date.getDate()}
                      </span>
                      {sprintNumber && (
                        <span className="calendar-day-sprint-label">
                          S{sprintNumber}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

       <div className="calendar-sprint-details">
         <h3 className="sprint-details-title">📊 Detalhamento das Sprints</h3>
         <div className="sprint-details-table-wrapper">
           <table className="sprint-details-table">
             <thead>
               <tr>
                 <th>Sprint</th>
                 <th>Início</th>
                 <th>Dia da Semana</th>
                 <th>Término</th>
                 <th>Dia da Semana</th>
                 <th>Dias Úteis</th>
                 <th>Dias Corridos</th>
               </tr>
             </thead>
             <tbody>
               {sprintPeriods.map((period) => {
                 const workingDaysData = Array.from(
                   sprintWorkingDaysMap.entries()
                 )
                   .filter(
                     ([, info]) =>
                       info.sprint === period.sprint && info.workingDay !== null
                   )
                   .sort(([a], [b]) => a - b);

                 const workingDays = workingDaysData.length;
                 const workingStartDate =
                   workingDaysData.length > 0
                     ? new Date(workingDaysData[0][0])
                     : period.calendarStart;
                 const workingEndDate =
                   workingDaysData.length > 0
                     ? new Date(workingDaysData[workingDaysData.length - 1][0])
                     : period.calendarEnd;

                 const calendarStart = new Date(period.calendarStart);
                 const calendarEnd = new Date(period.calendarEnd);
                 calendarEnd.setHours(23, 59, 59, 999);

                 let calendarDays = 0;
                 const currentDate = new Date(calendarStart);
                 while (currentDate <= calendarEnd) {
                   calendarDays++;
                   currentDate.setDate(currentDate.getDate() + 1);
                 }

                 return (
                   <tr key={period.sprint}>
                     <td className="sprint-number-cell">
                       <span
                         className="sprint-number-badge"
                         style={{
                           backgroundColor: getSprintColor(period.sprint),
                         }}
                       >
                         {period.sprint}
                       </span>
                     </td>
                     <td>
                       {formatDate(period.calendarStart)}
                       {period.calendarStart.getTime() !==
                         workingStartDate.getTime() && (
                         <span
                           style={{
                             fontSize: "0.8em",
                             color: "#999",
                             display: "block",
                           }}
                         >
                           (útil: {formatDate(workingStartDate)})
                         </span>
                       )}
                     </td>
                     <td>{getWeekDayName(period.calendarStart)}</td>
                     <td>
                       {formatDate(period.calendarEnd)}
                       {period.calendarEnd.getTime() !==
                         workingEndDate.getTime() && (
                         <span
                           style={{
                             fontSize: "0.8em",
                             color: "#999",
                             display: "block",
                           }}
                         >
                           (útil: {formatDate(workingEndDate)})
                         </span>
                       )}
                     </td>
                     <td>{getWeekDayName(period.calendarEnd)}</td>
                     <td className="days-cell">{workingDays}</td>
                     <td className="days-cell">{calendarDays}</td>
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
