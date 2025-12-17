import { useMemo, useState } from "react";
import {
  allocateSprints,
  getSprintForDate,
  getSprintDayNumber,
  isWeekend,
  isHoliday,
  isOptionalDay,
  getHolidayType,
  getHolidayName,
  getOptionalDayName,
  getSprintColor,
  getSprintColorLight,
  normalizeDate,
  getSprintDetails,
  formatDate,
  balanceSprintCalendarDays,
  getSprintForCalendarDate,
  getCalendarDayNumber,
} from "./utils";
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
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0, position: "top" });

  const { sprints, sprintMap, sprintDayMap, sprintCalendarDayMap, sprintStartDates, sprintEndDates } = useMemo(() => {
    const startDate = new Date(2026, 0, 7);
    const endDate = new Date(2026, 11, 18);
    return allocateSprints(startDate, endDate, 19);
  }, []);

  const balancedPeriods = useMemo(() => {
    return balanceSprintCalendarDays(sprintStartDates, sprintEndDates);
  }, [sprintStartDates, sprintEndDates]);

  const sprintDetails = useMemo(() => {
    return getSprintDetails(sprints, sprintStartDates, sprintEndDates);
  }, [sprints, sprintStartDates, sprintEndDates]);

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

  function isSprintBoundary(date) {
    const calendarSprintNumber = getSprintForCalendarDate(date, balancedPeriods);
    if (!calendarSprintNumber) return false;

    const period = balancedPeriods[calendarSprintNumber];
    const normalizedDateValue = normalizeDate(date).getTime();
    const startTime = period.calendarStart.getTime();
    const endTime = period.calendarEnd.getTime();

    return normalizedDateValue === startTime || normalizedDateValue === endTime;
  }

  function getDayClassName(date, sprintNumber) {
    const classes = ["calendar-day"];

    if (!date) {
      classes.push("calendar-day-empty");
      return classes.join(" ");
    }

    const calendarSprintNumber = getSprintForCalendarDate(date, balancedPeriods);
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

    if (sprintNumber) {
      classes.push("calendar-day-sprint");
    }

    if (calendarSprintNumber && !sprintNumber) {
      classes.push("calendar-day-sprint-period");
    }

    return classes.join(" ");
  }

  function getDayBorderStyle(date, sprintNumber) {
    const calendarSprintNumber = getSprintForCalendarDate(date, balancedPeriods);
    const isBoundary = isSprintBoundary(date);

    if (isBoundary && calendarSprintNumber) {
      return {
        borderWidth: '3px',
        borderColor: getSprintColor(calendarSprintNumber),
        borderStyle: 'solid',
      };
    }

    if (calendarSprintNumber && !sprintNumber) {
      const period = balancedPeriods[calendarSprintNumber];
      const normalizedDateValue = normalizeDate(date).getTime();
      const startTime = period.calendarStart.getTime();
      const endTime = period.calendarEnd.getTime();

      if (normalizedDateValue === startTime || normalizedDateValue === endTime) {
        return {
          borderWidth: '3px',
          borderColor: getSprintColor(calendarSprintNumber),
          borderStyle: 'dashed',
        };
      }

      return {
        borderWidth: '2px',
        borderColor: getSprintColor(calendarSprintNumber),
        borderStyle: 'dashed',
        opacity: 0.6,
      };
    }

    return {};
  }

  function getDayStyle(date, sprintNumber) {
    if (!sprintNumber) return {};

    return {
      backgroundColor: getSprintColorLight(sprintNumber),
      borderColor: getSprintColor(sprintNumber),
      borderWidth: '2px',
    };
  }

  function handleDayMouseEnter(e, date) {
    const tooltipText = getDayTooltip(date);
    if (!tooltipText) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipHeight = 60;
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    const showAbove = spaceAbove >= tooltipHeight + 10 || spaceAbove > spaceBelow;

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

    const sprintNumber = getSprintForDate(date, sprintMap);
    const calendarSprintNumber = getSprintForCalendarDate(date, balancedPeriods);

    if (sprintNumber) {
      const sprintDay = getSprintDayNumber(date, sprintDayMap);
      const calendarDay = getCalendarDayNumber(date, balancedPeriods, sprintNumber);
      if (sprintDay) {
        if (calendarDay && calendarDay !== sprintDay) {
          parts.push(`Sprint ${sprintNumber}: ${calendarDay}º dia corrido / ${sprintDay}º dia útil`);
        } else {
          parts.push(`Sprint ${sprintNumber}: ${sprintDay}º dia útil`);
        }
      }
    } else if (calendarSprintNumber) {
      const calendarDay = getCalendarDayNumber(date, balancedPeriods, calendarSprintNumber);
      if (calendarDay) {
        parts.push(`Sprint ${calendarSprintNumber}: ${calendarDay}º dia corrido (período corrido)`);
      }
    }

    const holidayName = getHolidayName(date, 2026);
    if (holidayName) {
      const holidayType = getHolidayType(date, 2026);
      const typeLabel = holidayType === 'national' ? 'Feriado Nacional' :
                       holidayType === 'state' ? 'Feriado Estadual (RN)' :
                       holidayType === 'municipal' ? 'Feriado Municipal (Natal)' : 'Feriado';
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

                  const sprintNumber = getSprintForDate(date, sprintMap);
                  const normalizedDate = normalizeDate(date);
                  const borderStyle = getDayBorderStyle(date, sprintNumber);
                  const combinedStyle = { ...getDayStyle(date, sprintNumber), ...borderStyle };

                  return (
                    <div
                      key={normalizedDate.getTime()}
                      className={getDayClassName(date, sprintNumber)}
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
              {sprintDetails.map((detail) => (
                <tr key={detail.sprint}>
                  <td className="sprint-number-cell">
                    <span
                      className="sprint-number-badge"
                      style={{ backgroundColor: getSprintColor(detail.sprint) }}
                    >
                      {detail.sprint}
                    </span>
                  </td>
                  <td>
                    {formatDate(detail.startDate)}
                    {detail.startDate.getTime() !== detail.workingStartDate.getTime() && (
                      <span style={{ fontSize: '0.8em', color: '#999', display: 'block' }}>
                        (útil: {formatDate(detail.workingStartDate)})
                      </span>
                    )}
                  </td>
                  <td>{detail.startWeekDay}</td>
                  <td>
                    {formatDate(detail.endDate)}
                    {detail.endDate.getTime() !== detail.workingEndDate.getTime() && (
                      <span style={{ fontSize: '0.8em', color: '#999', display: 'block' }}>
                        (útil: {formatDate(detail.workingEndDate)})
                      </span>
                    )}
                  </td>
                  <td>{detail.endWeekDay}</td>
                  <td className="days-cell">{detail.workingDays}</td>
                  <td className="days-cell">{detail.calendarDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Calendar2026;

