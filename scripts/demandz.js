const demandsSheetId = "1Ou52m0GMMBFj39TI7_4p1A3alDXOcqtWRWdWH7IV5tU";
const damandsSheetUrl = `https://opensheet.elk.sh/${demandsSheetId}/1`;

fetch(damandsSheetUrl)
  .then(res => res.json())
  .then(data => {
    const tableBody = document.querySelector("#quadroTabela tbody");
    if (!tableBody) return;

    // Limpa o conteúdo atual do tbody
    tableBody.innerHTML = "";

    // Cabeçalhos fixos conforme os nomes no thead
    const headers = ["DEV", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA"];

    // Preenche tbody com as linhas da planilha
    data.forEach(row => {
      const tr = document.createElement("tr");

      headers.forEach(header => {
        const td = document.createElement("td");
        td.textContent = row[header] || "";
        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
  })
  .catch(err => {
    console.error("Erro ao buscar dados:", err);
    const tableBody = document.querySelector("#quadroTabela tbody");
    if (tableBody) {
      tableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar dados.</td></tr>';
    }
  });
