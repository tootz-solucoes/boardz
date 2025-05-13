function updateBadgesPulse() {
  const now = new Date();

  // Define time windows for Tuesday and Friday badge pulsing
  const tuesdayStart = new Date(now);
  tuesdayStart.setHours(12, 30, 0, 0);
  const tuesdayEnd = new Date(now);
  tuesdayEnd.setHours(13, 30, 0, 0);

  const fridayStart = new Date(now);
  fridayStart.setHours(14, 0, 0, 0);
  const fridayEnd = new Date(now);
  fridayEnd.setHours(16, 30, 0, 0);

  const isTuesday = now.getDay() === 2; // Tuesday
  const isFriday = now.getDay() === 5;  // Friday

  const sweetDayBadge = document.getElementById("sweet-day");
  const coringaBadge = document.getElementById("coringa");

  if (sweetDayBadge) {
    const shouldPulse = isTuesday && now >= tuesdayStart && now <= tuesdayEnd;
    sweetDayBadge.classList.toggle("pulse", shouldPulse);
  }

  if (coringaBadge) {
    const shouldPulse = isFriday && now >= fridayStart && now <= fridayEnd;
    coringaBadge.classList.toggle("pulse", shouldPulse);
  }
}

// Initial check
updateBadgesPulse();

setInterval(updateBadgesPulse, 60 * 1000);
