function createBadge(html, id) {
  const container = document.getElementById("reminders");
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.innerHTML = html;
  if (id) {
    badge.id = id;
  }
  container.appendChild(badge);
}

function createFridayBadges() {
  const today = new Date();
  const weekStart = getStartOfWeek(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const firstFriday = getFirstFridayOfMonth(today);
  const lastFriday = getLastFridayOfMonth(today);

  // Always show coringagem badge
  createBadge("<b>Sexta</b>: Coringagem🃏", "coringa");

  // If the first Friday of the month is in this week
  if (firstFriday >= weekStart && firstFriday <= weekEnd) {
    createBadge("Sexta da Véia👵🏻");
  }

  // If the last Friday of the month is in this week
  if (lastFriday >= weekStart && lastFriday <= weekEnd) {
    createBadge("<b>Sexta:</b> Happy Hour🎉");
  }
}

function getStartOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

function getFirstFridayOfMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);

  // Go forward to first Friday
  while (firstDay.getDay() !== 5) {
    firstDay.setDate(firstDay.getDate() + 1);
  }

  return firstDay;
}

function getLastFridayOfMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0);

  // Go backward to last Friday
  while (lastDay.getDay() !== 5) {
    lastDay.setDate(lastDay.getDate() - 1);
  }

  return lastDay;
}

// Run on load
createFridayBadges();
