const sweetDaySheetId = "1UBZcGXJJDd2FJTZ0AA-m-IM8iQ6YIFmdGAl7AvnPAT4";
const seetDaySheetUrl = `https://opensheet.elk.sh/${sweetDaySheetId}/1`;

fetch(seetDaySheetUrl)
  .then((res) => res.json())
  .then((data) => {
    const today = new Date();

    const current = data.find((row) => {
      const rowDate = new Date(row["Data"]);
      rowDate.setDate(rowDate.getDate() - 2);
      rowDate.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(rowDate);
      endOfWeek.setDate(rowDate.getDate() + 7);

      return rowDate <= today && today <= endOfWeek;
    });

    const sweetDayBadge = document.getElementById("sweet-day");
    sweetDayBadge.className = "badge";

    if (current && sweetDayBadge) {
      const names = current["Pagantes"].replace("&", "e");

      sweetDayBadge.innerHTML =
        "<b>🧁Quarta do Brigadeiro:</b> " + names.trim();
    } else {
      sweetDayBadge.innerHTML = "<b>🧁Quarta do Brigadeiro:</b>: Sem info";
    }
  })
  .catch((err) => {
    console.error("Erro ao buscar dados:", err);
    document.getElementById("sweet-day").textContent =
      "Erro ao carregar dupla.";
  });
