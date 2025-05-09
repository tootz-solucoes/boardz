const sheetId = "1UBZcGXJJDd2FJTZ0AA-m-IM8iQ6YIFmdGAl7AvnPAT4";
const url = `https://opensheet.elk.sh/${sheetId}/1`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const today = new Date();

    const current = data.find(row => {
      const rowDate = new Date(row["Data"]);
      rowDate.setDate(rowDate.getDate() - 2);
      rowDate.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(rowDate);
      endOfWeek.setDate(rowDate.getDate() + 6);

      return rowDate <= today && today <= endOfWeek;
    });

    const sweetDayBadge = document.getElementById("sweet-day");

    if (current && sweetDayBadge) {
      const names = current["Pagantes"]
        .replace('&', 'e');

      // Apply pulse animation only if it's Tuesday and within the time range
      sweetDayBadge.className = "badge";
      sweetDayBadge.innerHTML = '<b>🧁Terça do Brigadeiro:</b> ' + names.trim();
    } else {
      sweetDayBadge.textContent = "Sem dupla registrada para esta semana.";
    }
  })
  .catch(err => {
    console.error("Erro ao buscar dados:", err);
    document.getElementById("sweet-day").textContent = "Erro ao carregar dupla.";
  });
