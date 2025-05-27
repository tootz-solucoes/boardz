export default function getWeeklyHeaders(referenceDate = new Date()) {
  const weekdayNames = ["SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"];
  const dayOfWeek = referenceDate.getDay();
  const isSaturday = dayOfWeek === 6;

  const monday = new Date(referenceDate);
  monday.setDate(
    referenceDate.getDate() - ((dayOfWeek + 6) % 7) + (isSaturday ? 7 : 0)
  );

  const dynamicHeaders = weekdayNames.map((name, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return `${name} (${date.getDate().toString().padStart(2, "0")})`;
  });

  return ["DEV", ...dynamicHeaders];
}
