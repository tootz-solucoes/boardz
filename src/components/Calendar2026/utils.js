function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getFixedHolidays(year) {
  const easter = calculateEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);

  return [
    { date: new Date(year, 0, 1), type: 'national', name: 'Confraternização Universal' },
    { date: goodFriday, type: 'national', name: 'Sexta-feira Santa' },
    { date: new Date(year, 3, 21), type: 'national', name: 'Tiradentes' },
    { date: new Date(year, 4, 1), type: 'national', name: 'Dia do Trabalho' },
    { date: new Date(year, 8, 7), type: 'national', name: 'Independência do Brasil' },
    { date: new Date(year, 9, 12), type: 'national', name: 'Nossa Senhora Aparecida' },
    { date: new Date(year, 10, 2), type: 'national', name: 'Finados' },
    { date: new Date(year, 10, 15), type: 'national', name: 'Proclamação da República' },
    { date: new Date(year, 11, 25), type: 'national', name: 'Natal' },
  ];
}

function getRNStateHolidays(year) {
  return [
    { date: new Date(year, 9, 3), type: 'state', name: 'Mártires de Cunhaú e Uruaçu' },
  ];
}

function getNatalMunicipalHolidays(year) {
  return [
    { date: new Date(year, 0, 6), type: 'municipal', name: 'Dia de Santos Reis' },
    { date: new Date(year, 10, 21), type: 'municipal', name: 'Nossa Senhora da Apresentação' },
  ];
}

function getOptionalDays(year) {
  const easter = calculateEaster(year);

  const carnivalMonday = new Date(easter);
  carnivalMonday.setDate(easter.getDate() - 48);

  const carnivalTuesday = new Date(easter);
  carnivalTuesday.setDate(easter.getDate() - 47);

  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);

  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  return [
    { date: carnivalMonday, type: 'optional', name: 'Segunda-feira de Carnaval' },
    { date: carnivalTuesday, type: 'optional', name: 'Terça-feira de Carnaval' },
    { date: ashWednesday, type: 'optional', name: 'Quarta-feira de Cinzas' },
    { date: corpusChristi, type: 'optional', name: 'Corpus Christi' },
    { date: new Date(year, 11, 24), type: 'optional', name: 'Véspera de Natal' },
    { date: new Date(year, 11, 31), type: 'optional', name: 'Véspera de Ano Novo' },
  ];
}

export function normalizeDate(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function datesMatch(date1, date2) {
  return normalizeDate(date1).getTime() === normalizeDate(date2).getTime();
}

export function getAllHolidays(year) {
  const fixed = getFixedHolidays(year);
  const state = getRNStateHolidays(year);
  const municipal = getNatalMunicipalHolidays(year);

  return [...fixed, ...state, ...municipal];
}

export function getAllOptionalDays(year) {
  return getOptionalDays(year);
}

export function getHolidayType(date, year) {
  const holidays = getAllHolidays(year);
  const normalized = normalizeDate(date);

  const holiday = holidays.find(h => datesMatch(h.date, normalized));
  return holiday ? holiday.type : null;
}

export function getHolidayName(date, year) {
  const holidays = getAllHolidays(year);
  const normalized = normalizeDate(date);

  const holiday = holidays.find(h => datesMatch(h.date, normalized));
  return holiday ? holiday.name : null;
}

export function isHoliday(date, year) {
  return getHolidayType(date, year) !== null;
}

export function isOptionalDay(date, year) {
  const optionalDays = getAllOptionalDays(year);
  const normalized = normalizeDate(date);

  return optionalDays.some(opt => datesMatch(opt.date, normalized));
}

export function getOptionalDayName(date, year) {
  const optionalDays = getAllOptionalDays(year);
  const normalized = normalizeDate(date);

  const optionalDay = optionalDays.find(opt => datesMatch(opt.date, normalized));
  return optionalDay ? optionalDay.name : null;
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isWorkingDay(date, year) {
  if (isWeekend(date)) return false;
  if (isHoliday(date, year)) return false;
  if (isOptionalDay(date, year)) return false;
  return true;
}

export function allocateSprints(startDate, endDate, workingDaysPerSprint) {
  const sprints = [];
  const sprintMap = new Map();
  const sprintDayMap = new Map();
  const sprintCalendarDayMap = new Map();
  let currentDate = normalizeDate(new Date(startDate));
  let currentSprint = 1;
  let daysInCurrentSprint = 0;
  let calendarDaysInCurrentSprint = 0;
  let sprintStartDates = {};
  let sprintEndDates = {};

  const normalizedEnd = normalizeDate(endDate);
  const sprint11End = normalizeDate(new Date(2026, 10, 13));
  const sprint12Start = normalizeDate(new Date(2026, 10, 16));

  while (currentDate <= normalizedEnd && currentSprint <= 12) {
    const dateKey = normalizeDate(currentDate).getTime();
    const isWithinSprint11 = currentSprint === 11 && currentDate <= sprint11End;
    const isWithinSprint12 = currentSprint === 12 && currentDate >= sprint12Start;

    if (currentSprint in sprintStartDates || (currentSprint <= 10) || isWithinSprint11 || isWithinSprint12) {
      if (currentSprint in sprintStartDates) {
        calendarDaysInCurrentSprint++;
      }
    }

    if (isWorkingDay(currentDate, 2026)) {
      if (!sprintStartDates[currentSprint]) {
        sprintStartDates[currentSprint] = new Date(currentDate);
        calendarDaysInCurrentSprint = 1;
      }

      if (currentSprint <= 10) {
        daysInCurrentSprint++;
        sprints.push({
          date: new Date(currentDate),
          sprint: currentSprint,
          day: daysInCurrentSprint,
        });
        sprintMap.set(dateKey, currentSprint);
        sprintDayMap.set(dateKey, daysInCurrentSprint);
        sprintCalendarDayMap.set(dateKey, calendarDaysInCurrentSprint);

        if (daysInCurrentSprint >= workingDaysPerSprint) {
          sprintEndDates[currentSprint] = new Date(currentDate);
          currentSprint++;
          daysInCurrentSprint = 0;
          calendarDaysInCurrentSprint = 0;
        }
      } else if (currentSprint === 11) {
        if (currentDate <= sprint11End) {
          daysInCurrentSprint++;
          sprints.push({
            date: new Date(currentDate),
            sprint: currentSprint,
            day: daysInCurrentSprint,
          });
          sprintMap.set(dateKey, currentSprint);
          sprintDayMap.set(dateKey, daysInCurrentSprint);
          sprintCalendarDayMap.set(dateKey, calendarDaysInCurrentSprint);
        }

        if (currentDate >= sprint11End) {
          sprintEndDates[currentSprint] = new Date(currentDate);
          currentSprint = 12;
          daysInCurrentSprint = 0;
          calendarDaysInCurrentSprint = 0;
        }
      } else if (currentSprint === 12) {
        if (currentDate >= sprint12Start) {
          daysInCurrentSprint++;
          sprints.push({
            date: new Date(currentDate),
            sprint: currentSprint,
            day: daysInCurrentSprint,
          });
          sprintMap.set(dateKey, currentSprint);
          sprintDayMap.set(dateKey, daysInCurrentSprint);
          sprintCalendarDayMap.set(dateKey, calendarDaysInCurrentSprint);
        }
      }
    }

    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    currentDate = normalizeDate(nextDate);
  }

  if (!sprintEndDates[12]) {
    sprintEndDates[12] = normalizedEnd;
  }

  return { sprints, sprintMap, sprintDayMap, sprintCalendarDayMap, sprintStartDates, sprintEndDates };
}

export function getSprintDayNumber(date, sprintDayMap) {
  const dateKey = normalizeDate(date).getTime();
  return sprintDayMap.get(dateKey) || null;
}

export function getSprintForDate(date, sprintMap) {
  const dateKey = normalizeDate(date).getTime();
  return sprintMap.get(dateKey) || null;
}

export function getSprintColor(sprintNumber) {
  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#8b5cf6',
    '#f97316',
    '#14b8a6',
    '#ec4899',
    '#6366f1',
    '#22c55e',
    '#eab308',
  ];
  return colors[(sprintNumber - 1) % colors.length];
}

export function getSprintColorLight(sprintNumber) {
  const colors = [
    'rgba(59, 130, 246, 0.2)',
    'rgba(16, 185, 129, 0.2)',
    'rgba(245, 158, 11, 0.2)',
    'rgba(239, 68, 68, 0.2)',
    'rgba(6, 182, 212, 0.2)',
    'rgba(139, 92, 246, 0.2)',
    'rgba(249, 115, 22, 0.2)',
    'rgba(20, 184, 166, 0.2)',
    'rgba(236, 72, 153, 0.2)',
    'rgba(99, 102, 241, 0.2)',
    'rgba(34, 197, 94, 0.2)',
    'rgba(234, 179, 8, 0.2)',
  ];
  return colors[(sprintNumber - 1) % colors.length];
}

const WEEK_DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export function getWeekDayName(date) {
  return WEEK_DAY_NAMES[date.getDay()];
}

export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function balanceSprintCalendarDays(sprintStartDates, sprintEndDates) {
  const balanced = {};
  const sprintNums = Object.keys(sprintStartDates).map(Number).sort((a, b) => a - b);

  for (let i = 0; i < sprintNums.length; i++) {
    const sprintNum = sprintNums[i];
    const nextSprintNum = sprintNums[i + 1];

    const workingStart = normalizeDate(sprintStartDates[sprintNum]);
    const workingEnd = normalizeDate(sprintEndDates[sprintNum]);

    let calendarStart = new Date(workingStart);
    let calendarEnd = new Date(workingEnd);

    if (nextSprintNum) {
      const nextWorkingStart = normalizeDate(sprintStartDates[nextSprintNum]);
      const gap = (nextWorkingStart.getTime() - workingEnd.getTime()) / (1000 * 60 * 60 * 24);

      const currentCalendarDays = Math.ceil((workingEnd.getTime() - workingStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (gap > 1) {
        const daysToExtend = Math.floor(gap / 2);
        calendarEnd = new Date(workingEnd);
        calendarEnd.setDate(calendarEnd.getDate() + daysToExtend);
      }

      if (i > 0) {
        const prevSprintNum = sprintNums[i - 1];
        const prevWorkingEnd = normalizeDate(sprintEndDates[prevSprintNum]);
        const prevGap = (workingStart.getTime() - prevWorkingEnd.getTime()) / (1000 * 60 * 60 * 24);

        if (prevGap > 1) {
          const daysToShift = Math.floor(prevGap / 2);
          calendarStart = new Date(workingStart);
          calendarStart.setDate(calendarStart.getDate() - daysToShift);
        }
      }
    } else {
      calendarEnd = new Date(workingEnd);
    }

    balanced[sprintNum] = {
      calendarStart: normalizeDate(calendarStart),
      calendarEnd: normalizeDate(calendarEnd),
      workingStart: workingStart,
      workingEnd: workingEnd,
    };
  }

  return balanced;
}

export function getSprintDetails(sprints, sprintStartDates, sprintEndDates) {
  const details = [];
  const sprintGroups = {};
  const balanced = balanceSprintCalendarDays(sprintStartDates, sprintEndDates);

  sprints.forEach(sprint => {
    if (!sprintGroups[sprint.sprint]) {
      sprintGroups[sprint.sprint] = [];
    }
    sprintGroups[sprint.sprint].push(new Date(sprint.date));
  });

  Object.keys(sprintGroups).sort((a, b) => Number(a) - Number(b)).forEach(sprintNum => {
    const num = Number(sprintNum);
    const dates = sprintGroups[sprintNum].sort((a, b) => a.getTime() - b.getTime());
    const workingDays = dates.length;

    const balancedPeriod = balanced[num];
    const calendarStart = balancedPeriod.calendarStart;
    const calendarEnd = balancedPeriod.calendarEnd;

    let calendarDays = 0;
    const currentDate = new Date(calendarStart);
    const endDateNorm = new Date(calendarEnd);

    while (currentDate <= endDateNorm) {
      calendarDays++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    details.push({
      sprint: num,
      startDate: new Date(calendarStart),
      endDate: new Date(calendarEnd),
      workingStartDate: new Date(balancedPeriod.workingStart),
      workingEndDate: new Date(balancedPeriod.workingEnd),
      startWeekDay: getWeekDayName(calendarStart),
      endWeekDay: getWeekDayName(calendarEnd),
      workingDays,
      calendarDays,
    });
  });

  return details;
}

export function getSprintForCalendarDate(date, balancedPeriods) {
  const dateKey = normalizeDate(date).getTime();

  for (const [sprintNum, period] of Object.entries(balancedPeriods)) {
    const startTime = period.calendarStart.getTime();
    const endTime = period.calendarEnd.getTime();

    if (dateKey >= startTime && dateKey <= endTime) {
      return Number(sprintNum);
    }
  }

  return null;
}

export function getCalendarDayNumber(date, balancedPeriods, sprintNumber) {
  if (!sprintNumber) return null;

  const period = balancedPeriods[sprintNumber];
  if (!period) return null;

  const dateKey = normalizeDate(date).getTime();
  const startTime = period.calendarStart.getTime();
  const endTime = period.calendarEnd.getTime();

  if (dateKey < startTime || dateKey > endTime) return null;

  let dayCount = 0;
  const currentDate = new Date(period.calendarStart);

  while (currentDate <= date) {
    dayCount++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dayCount;
}

