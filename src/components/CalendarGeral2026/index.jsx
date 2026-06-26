import { useMemo, useState, useEffect, useRef } from "react";
import {
  ArrowUp,
  CalendarDays,
  Cake,
  ChartColumn,
  Clock3,
  Flag,
  PartyPopper,
  Zap,
} from "lucide-react";
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
} from "../Calendar2026/utils";
import { sprintsData } from "../Calendar2026/sprintsData";
import { confraternizacoes } from "./confraternizacoesData";
import { aniversariantes } from "./aniversariantesData";
import { jogosDoBrasil } from "./jogosDoBrasilData";
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

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getMonthIndexFromName(monthName) {
  return MONTH_NAMES.findIndex(name => name === monthName);
}

// Converte string de data "YYYY-MM-DD" para Date object usando UTC-3 (Brasília)
function parseDateUTC3(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  // Cria data no timezone local (assumindo que está em UTC-3)
  // Usa month - 1 porque Date usa meses 0-indexed
  return new Date(year, month - 1, day);
}

function CalendarGeral2026() {
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

  const confraternizacoesPorMes = useMemo(() => {
    const map = new Map();
    confraternizacoes.forEach(conf => {
      const mesIndex = getMonthIndexFromName(conf.mes);
      if (mesIndex !== -1) {
        if (!map.has(mesIndex)) {
          map.set(mesIndex, []);
        }
        map.get(mesIndex).push(conf);
      }
    });
    return map;
  }, []);

  const confraternizacoesPorData = useMemo(() => {
    const map = new Map();
    confraternizacoes.forEach(conf => {
      if (conf.data) {
        const date = normalizeDate(parseDateUTC3(conf.data));
        map.set(date.getTime(), conf);
      }
    });
    return map;
  }, []);

  const aniversariantesPorData = useMemo(() => {
    const map = new Map();
    aniversariantes.forEach((a) => {
      const date = normalizeDate(parseDateUTC3(a.data));
      if (!map.has(date.getTime())) map.set(date.getTime(), []);
      map.get(date.getTime()).push(a.nome);
    });
    return map;
  }, []);

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
  const SPRINT_LABEL = "absolute top-[3px] right-[4px] text-[0.7rem] font-extrabold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] bg-[linear-gradient(135deg,rgba(0,0,0,0.6),rgba(0,0,0,0.4))] py-[2px] px-[6px] rounded-[4px] tracking-[0.5px] border border-[rgba(255,255,255,0.1)]";
  const LEGEND_COLOR_BASE = "w-6 h-6 rounded-[4px] border border-[rgba(255,255,255,0.2)]";

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

    const conf = confraternizacoesPorData.get(dateKey);
    if (conf) {
      parts.push(`Evento: ${conf.evento}`);
    }

    const anivNomes = aniversariantesPorData.get(dateKey);
    if (anivNomes && anivNomes.length) {
      parts.push(`Aniversário: ${anivNomes.join(", ")}`);
    }

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

  function getConfraternizacoesDoMes(monthIndex) {
    return confraternizacoesPorMes.get(monthIndex) || [];
  }

  // Ref para cada mês para scroll automático
  const monthRefs = useRef({});
  const [showBackToCurrentMonth, setShowBackToCurrentMonth] = useState(false);

  // Obter mês atual (2026 ou ano atual se diferente)
  const today = useMemo(() => {
    const now = new Date();
    // Se estivermos em 2026, usa a data atual, senão usa 01/01/2026 como referência
    const year = now.getFullYear();
    if (year === 2026) {
      return normalizeDate(now);
    } else {
      return normalizeDate(new Date(2026, 0, 1));
    }
  }, []);

  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();

  // Calcular sprint atual, dias restantes, dia útil e dia corrido (para dashboard)
  const currentSprintInfo = useMemo(() => {
    const todayKey = today.getTime();
    const sprintNumber = sprintMap.get(todayKey);
    const dayInfo = sprintWorkingDaysMap.get(todayKey);

    if (!sprintNumber) {
      const period = sprintPeriods.find(p => {
        const start = p.calendarStart.getTime();
        const end = p.calendarEnd.getTime();
        return todayKey >= start && todayKey <= end;
      });

      if (period) {
        const endDate = new Date(period.calendarEnd);
        endDate.setHours(23, 59, 59, 999);
        const daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          sprint: period.sprint,
          daysRemaining: Math.max(0, daysRemaining),
          workingDay: dayInfo?.workingDay ?? null,
          calendarDay: dayInfo?.calendarDay ?? null,
        };
      }
      return null;
    }

    const period = sprintPeriods.find(p => p.sprint === sprintNumber);
    if (!period) return null;

    const endDate = new Date(period.calendarEnd);
    endDate.setHours(23, 59, 59, 999);
    const daysRemaining = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      sprint: sprintNumber,
      daysRemaining: Math.max(0, daysRemaining),
      workingDay: dayInfo?.workingDay ?? null,
      calendarDay: dayInfo?.calendarDay ?? null,
    };
  }, [today, sprintMap, sprintPeriods, sprintWorkingDaysMap]);

  // Próximo aniversariante e aniversariantes de hoje (para dashboard)
  const dashboardBirthday = useMemo(() => {
    const refDate = currentYear === 2026 ? today : normalizeDate(new Date(2026, 0, 1));
    const refTime = refDate.getTime();
    const todayKey = normalizeDate(new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate())).getTime();

    const todayNames = aniversariantes
      .filter((a) => normalizeDate(parseDateUTC3(a.data)).getTime() === todayKey)
      .map((a) => a.nome);

    const withDates = aniversariantes
      .map((a) => ({ ...a, date: parseDateUTC3(a.data), time: normalizeDate(parseDateUTC3(a.data)).getTime() }))
      .filter((a) => a.time >= refTime)
      .sort((a, b) => a.time - b.time);

    const next = withDates[0] ?? null;
    const nextDays = next ? Math.floor((next.time - refTime) / (1000 * 60 * 60 * 24)) : null;

    return {
      isToday: todayNames.length > 0,
      todayNames,
      next: next ? { nome: next.nome, data: next.date, daysUntil: nextDays } : null,
    };
  }, [today, currentYear]);

  // Próximo happy hour no mês atual (para dashboard)
  const dashboardHappyHour = useMemo(() => {
    if (currentYear !== 2026) return null;
    const monthConfs = confraternizacoes.filter(
      (c) => getMonthIndexFromName(c.mes) === currentMonthIndex && c.data
    );
    const refTime = today.getTime();
    let next = null;
    for (const c of monthConfs) {
      const d = parseDateUTC3(c.data);
      const t = normalizeDate(d).getTime();
      if (t >= refTime) {
        const daysUntil = Math.floor((t - refTime) / (1000 * 60 * 60 * 24));
        if (!next || daysUntil < next.daysUntil) {
          next = { evento: c.evento, data: d, daysUntil };
        }
      }
    }
    return next;
  }, [today, currentYear, currentMonthIndex]);

  // Próximo jogo do Brasil na Copa 2026
  const dashboardJogoBrasil = useMemo(() => {
    const refTime = today.getTime();
    const jogosOrdenados = [...jogosDoBrasil]
      .map((j) => ({ ...j, date: parseDateUTC3(j.data), time: normalizeDate(parseDateUTC3(j.data)).getTime() }))
      .sort((a, b) => a.time - b.time);

    const isToday = jogosOrdenados.find((j) => j.time === refTime);
    if (isToday) return { jogo: isToday, daysUntil: 0 };

    const next = jogosOrdenados.find((j) => j.time > refTime);
    if (!next) return null;

    const daysUntil = Math.floor((next.time - refTime) / (1000 * 60 * 60 * 24));
    return { jogo: next, daysUntil };
  }, [today]);

  // Scroll para o mês atual ao carregar
  useEffect(() => {
    if (currentYear === 2026 && monthRefs.current[currentMonthIndex]) {
      setTimeout(() => {
        monthRefs.current[currentMonthIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [currentMonthIndex, currentYear]);

  // Detectar quando o usuário rola para fora do mês atual
  useEffect(() => {
    if (currentYear !== 2026) return;

    const currentMonthElement = monthRefs.current[currentMonthIndex];
    if (!currentMonthElement) return;

    const handleScroll = () => {
      const rect = currentMonthElement.getBoundingClientRect();
      // Considera visível se o elemento está na viewport com uma margem
      const isVisible = rect.top < window.innerHeight - 150 && rect.bottom > 150;
      setShowBackToCurrentMonth(!isVisible);
    };

    // Usa requestAnimationFrame para melhor performance
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    handleScroll(); // Verifica inicialmente

    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [currentMonthIndex, currentYear]);

  const scrollToCurrentMonth = () => {
    if (monthRefs.current[currentMonthIndex]) {
      monthRefs.current[currentMonthIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const TABLE_SECTION = "mt-12 bg-gradient-to-br from-[#1e1e24] to-[#252529] rounded-2xl p-8 shadow-[0_4px_16px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)]";
  const TABLE_TITLE = "inline-flex items-center gap-[0.45rem] text-purple-accent [text-shadow:0_0_5px_rgba(200,166,255,0.4)] mb-6 text-[1.5rem] text-center w-full justify-center";
  const TH = "text-left p-4 font-semibold text-[0.9rem] tracking-[0.5px]";
  const TD = "p-4 text-text-soft text-[0.9rem]";

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

      {/* Dashboard widgets */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5 mb-8">
        {currentSprintInfo && (
          <div className="bg-gradient-to-br from-[#1e1e24] to-[#252529] rounded-[14px] p-5 border-l-4 border-l-purple-medium border border-[rgba(255,255,255,0.08)] shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-[0.6rem] mb-3 pb-[0.6rem] border-b border-[rgba(255,255,255,0.1)]">
              <span className="inline-flex items-center justify-center"><Zap size={20} /></span>
              <span className="text-[0.85rem] font-semibold text-purple-accent uppercase tracking-[0.5px]">Sprint atual</span>
            </div>
            <div className="text-[0.95rem] text-text-soft">
              <div className="flex flex-col gap-[0.35rem] mb-3">
                <strong className="text-white text-[1.15rem]">Sprint {currentSprintInfo.sprint}</strong>
                {currentSprintInfo.workingDay != null && (
                  <span className="text-[0.85rem] text-text-dim">
                    {currentSprintInfo.workingDay}º dia útil
                    {currentSprintInfo.calendarDay != null && ` · ${currentSprintInfo.calendarDay}º dia corrido`}
                  </span>
                )}
              </div>
              {currentSprintInfo.daysRemaining === 0 ? (
                <span className="inline-flex items-center gap-[0.4rem] py-[0.4rem] px-[0.7rem] rounded-lg text-[0.85rem] font-semibold bg-[linear-gradient(135deg,rgba(255,193,7,0.25),rgba(255,152,0,0.25))] text-[#ffc107] border border-[rgba(255,193,7,0.5)]">
                  <Flag size={14} /> Termina hoje
                </span>
              ) : currentSprintInfo.daysRemaining === 1 ? (
                <span className="inline-flex items-center gap-[0.4rem] py-[0.4rem] px-[0.7rem] rounded-lg text-[0.85rem] font-semibold bg-[linear-gradient(135deg,rgba(255,193,7,0.25),rgba(255,152,0,0.25))] text-[#ffc107] border border-[rgba(255,193,7,0.5)]">
                  <Clock3 size={14} /> Termina amanhã
                </span>
              ) : (
                <span className="inline-flex items-center gap-[0.4rem] py-[0.4rem] px-[0.7rem] rounded-lg text-[0.85rem] font-semibold bg-[rgba(124,90,207,0.25)] text-text-soft border border-[rgba(124,90,207,0.4)]">
                  <CalendarDays size={14} /> Faltam {currentSprintInfo.daysRemaining} dias
                </span>
              )}
            </div>
          </div>
        )}

        <div className={`bg-gradient-to-br rounded-[14px] p-5 border-l-4 border-l-[#ec4899] border border-[rgba(255,255,255,0.08)] shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${dashboardBirthday.isToday ? "from-[rgba(236,72,153,0.12)] to-[rgba(219,39,119,0.08)] border-[rgba(236,72,153,0.35)] shadow-[0_4px_20px_rgba(236,72,153,0.2)]" : "from-[#1e1e24] to-[#252529]"}`}>
          <div className="flex items-center gap-[0.6rem] mb-3 pb-[0.6rem] border-b border-[rgba(255,255,255,0.1)]">
            <span className="inline-flex items-center justify-center"><Cake size={20} /></span>
            <span className={`text-[0.85rem] font-semibold uppercase tracking-[0.5px] ${dashboardBirthday.isToday ? "text-[#ec4899]" : "text-purple-accent"}`}>
              {dashboardBirthday.isToday ? "Aniversariante de hoje" : "Próximo aniversário"}
            </span>
          </div>
          <div className="text-[0.95rem] text-text-soft">
            {dashboardBirthday.isToday ? (
              <div className="text-[1.1rem] font-bold text-white [animation:birthday-pulse_2s_ease-in-out_infinite]">
                {dashboardBirthday.todayNames.join(", ")}
              </div>
            ) : dashboardBirthday.next ? (
              <div>
                <strong className="text-white block mb-1">{dashboardBirthday.next.nome}</strong>
                <span className="text-[0.9rem] text-text-dim">
                  {formatDate(dashboardBirthday.next.data)}
                  {dashboardBirthday.next.daysUntil !== null && dashboardBirthday.next.daysUntil > 0 && (
                    <> · em {dashboardBirthday.next.daysUntil} {dashboardBirthday.next.daysUntil === 1 ? "dia" : "dias"}</>
                  )}
                </span>
              </div>
            ) : (
              <div className="text-[#888] italic">Nenhum aniversário no período</div>
            )}
          </div>
        </div>

        {dashboardHappyHour && (
          <div className="bg-[linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.05))] rounded-[14px] p-5 border-l-4 border-l-[#f59e0b] border border-[rgba(245,158,11,0.25)] shadow-[0_4px_20px_rgba(245,158,11,0.15)]">
            <div className="flex items-center gap-[0.6rem] mb-3 pb-[0.6rem] border-b border-[rgba(255,255,255,0.1)]">
              <span className="inline-flex items-center justify-center"><PartyPopper size={20} /></span>
              <span className="text-[0.85rem] font-semibold text-[#f59e0b] uppercase tracking-[0.5px]">Happy hour</span>
            </div>
            <div className="text-[0.95rem] text-text-soft">
              <div className="text-[0.9rem] text-text-soft mb-[0.6rem] leading-[1.35]">{dashboardHappyHour.evento}</div>
              {dashboardHappyHour.daysUntil === 0 ? (
                <span className="inline-block py-2 px-[0.9rem] rounded-[10px] text-[0.95rem] font-bold bg-[linear-gradient(135deg,#22c55e,#16a34a)] text-white border border-[rgba(255,255,255,0.2)] shadow-[0_2px_12px_rgba(34,197,94,0.5)] [animation:happyhour-today-pulse_1.5s_ease-in-out_infinite]">É hoje!</span>
              ) : dashboardHappyHour.daysUntil === 1 ? (
                <span className="inline-block py-2 px-[0.9rem] rounded-[10px] text-[0.95rem] font-bold bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white border border-[rgba(255,255,255,0.2)] shadow-[0_2px_10px_rgba(245,158,11,0.4)]">Amanhã!</span>
              ) : (
                <span className="inline-block py-2 px-[0.9rem] rounded-[10px] text-[0.95rem] font-bold bg-[linear-gradient(135deg,#f59e0b,#d97706)] text-white border border-[rgba(255,255,255,0.2)] shadow-[0_2px_10px_rgba(245,158,11,0.4)]">Faltam {dashboardHappyHour.daysUntil} dias</span>
              )}
            </div>
          </div>
        )}

        {dashboardJogoBrasil && (
          <div className={`bg-gradient-to-br rounded-[14px] p-5 border-l-4 border-l-[#22c55e] border border-[rgba(255,255,255,0.08)] shadow-[0_4px_16px_rgba(0,0,0,0.3)] ${dashboardJogoBrasil.daysUntil === 0 ? "from-[rgba(34,197,94,0.12)] to-[rgba(21,128,61,0.08)] border-[rgba(34,197,94,0.35)] shadow-[0_4px_20px_rgba(34,197,94,0.2)]" : "from-[#1e1e24] to-[#252529]"}`}>
            <div className="flex items-center gap-[0.6rem] mb-3 pb-[0.6rem] border-b border-[rgba(255,255,255,0.1)]">
              <span className="inline-flex items-center justify-center text-[1.1rem]">🇧🇷</span>
              <span className={`text-[0.85rem] font-semibold uppercase tracking-[0.5px] ${dashboardJogoBrasil.daysUntil === 0 ? "text-[#22c55e]" : "text-purple-accent"}`}>
                {dashboardJogoBrasil.daysUntil === 0 ? "Brasil joga hoje!" : "Próximo jogo do Brasil"}
              </span>
            </div>
            <div className="text-[0.95rem] text-text-soft">
              <strong className="text-white block mb-1 text-[1.05rem]">
                {dashboardJogoBrasil.jogo.dia}: Brasil x {dashboardJogoBrasil.jogo.adversario}
              </strong>
              <span className="text-[0.85rem] text-text-dim block mb-3">
                {dashboardJogoBrasil.jogo.fase} · {dashboardJogoBrasil.jogo.hora}h · {dashboardJogoBrasil.jogo.local}
              </span>
              {dashboardJogoBrasil.daysUntil === 0 ? (
                <span className="inline-block py-2 px-[0.9rem] rounded-[10px] text-[0.95rem] font-bold bg-[linear-gradient(135deg,#22c55e,#16a34a)] text-white border border-[rgba(255,255,255,0.2)] shadow-[0_2px_12px_rgba(34,197,94,0.5)] [animation:happyhour-today-pulse_1.5s_ease-in-out_infinite]">É hoje!</span>
              ) : dashboardJogoBrasil.daysUntil === 1 ? (
                <span className="inline-block py-2 px-[0.9rem] rounded-[10px] text-[0.95rem] font-bold bg-[linear-gradient(135deg,#22c55e,#16a34a)] text-white border border-[rgba(255,255,255,0.2)] shadow-[0_2px_10px_rgba(34,197,94,0.4)]">Amanhã!</span>
              ) : (
                <span className="inline-block py-2 px-[0.9rem] rounded-[10px] text-[0.95rem] font-bold bg-[linear-gradient(135deg,#15803d,#166534)] text-white border border-[rgba(255,255,255,0.2)] shadow-[0_2px_10px_rgba(34,197,94,0.3)]">Faltam {dashboardJogoBrasil.daysUntil} dias</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-8 mb-8 p-4 bg-bg-surface rounded-xl flex-wrap">
        {[
          { cls: "bg-[#3a3a3a]", label: "Finais de Semana" },
          { cls: "bg-gradient-to-br from-[#dc2626] to-[#b91c1c] shadow-[0_0_8px_rgba(220,38,38,0.4)]", label: "Feriados" },
          { cls: "bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[0_0_8px_rgba(245,158,11,0.4)]", label: "Pontos Facultativos" },
          { cls: "bg-gradient-to-br from-[#3b82f6] to-[#10b981] shadow-[0_0_8px_rgba(59,130,246,0.4)]", label: "Sprints" },
          { cls: "bg-gradient-to-br from-[#ec4899] to-[#db2777] shadow-[0_0_8px_rgba(236,72,153,0.4)]", label: "Confraternizações" },
          { cls: "bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-[0_0_8px_rgba(245,158,11,0.4)]", label: "Aniversariantes" },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-2 text-text-soft text-[0.9rem]">
            <div className={`${LEGEND_COLOR_BASE} ${cls}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar months grid */}
      <div className="grid grid-cols-2 max-[1200px]:grid-cols-1 gap-8">
        {months.map(({ monthIndex, monthName, days }) => {
          const confsDoMes = getConfraternizacoesDoMes(monthIndex);
          const isCurrentMonth = currentYear === 2026 && monthIndex === currentMonthIndex;

          return (
            <div
              key={monthIndex}
              className="bg-gradient-to-br from-[#1e1e24] to-[#252529] rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]"
              ref={(el) => { if (isCurrentMonth) monthRefs.current[monthIndex] = el; }}
            >
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
                    const confDateKey = normalizedDate.getTime();
                    const temConfraternizacao = confraternizacoesPorData.has(confDateKey);
                    const temAniversario = aniversariantesPorData.has(confDateKey);
                    const isToday = confDateKey === today.getTime() && currentYear === 2026;

                    const combinedStyle = {
                      ...getDayStyle(date, sprintNumber),
                      ...getDayBorderStyle(date),
                      ...(temConfraternizacao ? { borderColor: '#ec4899', borderWidth: '2px', boxShadow: '0 0 8px rgba(236,72,153,0.4)' } : {}),
                      ...(temAniversario && !temConfraternizacao ? { borderColor: '#f59e0b', borderWidth: '2px', boxShadow: '0 0 8px rgba(245,158,11,0.35)' } : {}),
                    };

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
                        key={confDateKey}
                        className={`${DAY_BASE} ${bgBorder} ${fontClass}`.trimEnd()}
                        style={combinedStyle}
                        onMouseEnter={(e) => handleDayMouseEnter(e, date)}
                        onMouseLeave={handleDayMouseLeave}
                      >
                        <span className={dayNumberClass}>{date.getDate()}</span>
                        {isToday && (
                          <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 text-[0.6rem] font-bold text-white bg-[linear-gradient(135deg,#7c5acf,#6b46c1)] py-[2px] px-[6px] rounded-[4px] tracking-[0.5px] [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] shadow-[0_2px_4px_rgba(124,90,207,0.5)] border border-[rgba(255,255,255,0.2)] z-[6] whitespace-nowrap">HOJE</span>
                        )}
                        {sprintNumber && <span className={SPRINT_LABEL}>S{sprintNumber}</span>}
                        {temConfraternizacao && (
                          <span className="absolute top-[3px] left-[4px] inline-flex items-center [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.8))] z-[5]"><PartyPopper size={12} /></span>
                        )}
                        {temAniversario && (
                          <span className="absolute bottom-[2px] left-[4px] inline-flex items-center [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.8))] z-[5]" title="Aniversário"><Cake size={12} /></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {confsDoMes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <div className="flex items-start gap-3 p-3 bg-[linear-gradient(135deg,rgba(236,72,153,0.1),rgba(219,39,119,0.1))] rounded-lg border border-[rgba(236,72,153,0.3)]">
                    <span className="inline-flex items-center shrink-0"><PartyPopper size={18} /></span>
                    <div className="flex-1 flex flex-col gap-2">
                      {confsDoMes.map((conf, idx) => (
                        <div key={idx} className="text-text-soft text-[0.85rem] leading-[1.4]">
                          {conf.data ? (
                            <>
                              <span className="font-semibold text-[#ec4899]">{formatDate(parseDateUTC3(conf.data))} ({conf.dia})</span>
                              <span className="text-text-soft"> - {conf.evento}</span>
                            </>
                          ) : (
                            <span className="text-text-soft">{conf.evento}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isCurrentMonth && currentSprintInfo && (
                <div className="mt-4 pt-4 border-t-2 border-[rgba(179,136,255,0.3)]">
                  <div className="flex items-center gap-4 py-[0.875rem] px-5 bg-[linear-gradient(135deg,#7c5acf,#6b46c1)] rounded-xl shadow-[0_4px_16px_rgba(124,90,207,0.4),_0_0_0_1px_rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)]">
                    <span className="inline-flex items-center shrink-0 [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.3))] [animation:pulse-icon_2s_ease-in-out_infinite]"><Zap size={24} /></span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4 w-full">
                        <div className="text-white text-[1.1rem] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
                          <strong className="text-[1.25rem] tracking-[0.5px]">Sprint {currentSprintInfo.sprint}</strong>
                        </div>
                        <div className="inline-flex items-center shrink-0">
                          {currentSprintInfo.daysRemaining === 0 ? (
                            <span className="inline-flex items-center gap-2 py-2 px-3 bg-[linear-gradient(135deg,rgba(255,193,7,0.9),rgba(255,152,0,0.9))] backdrop-blur-sm rounded-lg text-white text-[0.9rem] font-semibold border border-[rgba(255,255,255,0.4)] shadow-[0_2px_8px_rgba(0,0,0,0.2)] [animation:urgent-pulse_1.5s_ease-in-out_infinite]">
                              <Flag size={16} /> Sprint encerra hoje!
                            </span>
                          ) : currentSprintInfo.daysRemaining === 1 ? (
                            <span className="inline-flex items-center gap-2 py-2 px-3 bg-[linear-gradient(135deg,rgba(255,193,7,0.9),rgba(255,152,0,0.9))] backdrop-blur-sm rounded-lg text-white text-[0.9rem] font-semibold border border-[rgba(255,255,255,0.4)] shadow-[0_2px_8px_rgba(0,0,0,0.2)] [animation:urgent-pulse_1.5s_ease-in-out_infinite]">
                              <Clock3 size={16} /> Acaba amanhã
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 py-2 px-3 bg-[rgba(255,255,255,0.2)] backdrop-blur-sm rounded-lg text-white text-[0.9rem] font-semibold border border-[rgba(255,255,255,0.3)] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                              <CalendarDays size={16} /> Faltam {currentSprintInfo.daysRemaining} dias para o término
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sprint details table */}
      <div className={TABLE_SECTION}>
        <h3 className={TABLE_TITLE}><ChartColumn size={18} /> Detalhamento das Sprints</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {["Sprint","Início","Dia da Semana","Término","Dia da Semana","Dias Úteis","Dias Corridos"].map(h => <th key={h} className={TH}>{h}</th>)}
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
                const cur = new Date(calendarStart);
                while (cur <= calendarEnd) { calendarDays++; cur.setDate(cur.getDate() + 1); }

                return (
                  <tr key={period.sprint}>
                    <td className="text-center p-4 text-text-soft text-[0.9rem]">
                      <span className="w-8 h-8 rounded-lg text-white font-bold text-[0.95rem] inline-flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]" style={{ backgroundColor: getSprintColor(period.sprint) }}>{period.sprint}</span>
                    </td>
                    <td className={TD}>{formatDate(period.calendarStart)}{period.calendarStart.getTime() !== workingStartDate.getTime() && <span style={{ fontSize: "0.8em", color: "#999", display: "block" }}>(útil: {formatDate(workingStartDate)})</span>}</td>
                    <td className={TD}>{getWeekDayName(period.calendarStart)}</td>
                    <td className={TD}>{formatDate(period.calendarEnd)}{period.calendarEnd.getTime() !== workingEndDate.getTime() && <span style={{ fontSize: "0.8em", color: "#999", display: "block" }}>(útil: {formatDate(workingEndDate)})</span>}</td>
                    <td className={TD}>{getWeekDayName(period.calendarEnd)}</td>
                    <td className="text-center p-4 font-semibold text-purple-accent">{workingDays}</td>
                    <td className="text-center p-4 font-semibold text-purple-accent">{calendarDays}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confraternizações table */}
      <div className={TABLE_SECTION}>
        <h3 className={TABLE_TITLE}><PartyPopper size={18} /> Agenda de Confraternizações dos Colaboradores</h3>
        <div className="overflow-x-auto">
          <table>
            <thead><tr>{["Mês","Data","Dia da Semana","Evento"].map(h => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {confraternizacoes.map((conf, index) => (
                <tr key={index}>
                  <td className={TD}>{conf.mes}</td>
                  <td className={TD}>{conf.data ? formatDate(parseDateUTC3(conf.data)) : "Data a definir"}</td>
                  <td className={TD}>{conf.dia || "-"}</td>
                  <td className={TD}>{conf.evento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aniversariantes table */}
      <div className={TABLE_SECTION}>
        <h3 className={TABLE_TITLE}><Cake size={18} /> Aniversariantes do Ano</h3>
        <div className="overflow-x-auto">
          <table>
            <thead><tr>{["Nome","Data","Dia da Semana"].map(h => <th key={h} className={TH}>{h}</th>)}</tr></thead>
            <tbody>
              {[...aniversariantes]
                .map((a) => ({ ...a, dateObj: parseDateUTC3(a.data) }))
                .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
                .map((a, index) => (
                  <tr key={index}>
                    <td className={TD}>{a.nome}</td>
                    <td className={TD}>{formatDate(a.dateObj)}</td>
                    <td className={TD}>{getWeekDayName(a.dateObj)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showBackToCurrentMonth && currentYear === 2026 && (
        <button
          className="fixed bottom-8 right-8 flex flex-col items-center justify-center gap-2 p-4 px-5 bg-[linear-gradient(135deg,#7c5acf,#6b46c1)] border-2 border-[rgba(255,255,255,0.2)] rounded-2xl text-white font-semibold text-[0.9rem] cursor-pointer shadow-[0_4px_16px_rgba(124,90,207,0.5),_0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-300 z-[1000] [animation:slideInUp_0.3s_ease-out] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(124,90,207,0.6),_0_0_0_1px_rgba(255,255,255,0.2)]"
          onClick={scrollToCurrentMonth}
          aria-label="Voltar para o mês atual"
          title="Voltar para o mês atual"
        >
          <span className="inline-flex items-center font-bold [filter:drop-shadow(0_2px_4px_rgba(0,0,0,0.3))] [animation:bounce_2s_ease-in-out_infinite]"><ArrowUp size={18} /></span>
          <span className="text-[0.75rem] tracking-[0.5px] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">Mês Atual</span>
        </button>
      )}
    </div>
  );
}

export default CalendarGeral2026;
