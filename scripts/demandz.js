const sheetId = "1Ou52m0GMMBFj39TI7_4p1A3alDXOcqtWRWdWH7IV5tU";
const url = `https://opensheet.elk.sh/${sheetId}/1`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    // Monta a tabela
    const demandzContainer = document.getElementById("demandz");
    if (!demandzContainer) return;

    console.log(data)
    // Cabeçalhos (ajuste conforme as colunas da sua planilha)
    const headers = Object.keys(data[0] || {});
    let tableHTML = '<table class="demandz-table"><thead><tr>';
    headers.forEach(h => {
      tableHTML += `<th>${h}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Linhas
    data.forEach(row => {
      tableHTML += '<tr>';
      headers.forEach(h => {
        tableHTML += `<td>${row[h] || ""}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    demandzContainer.innerHTML = tableHTML;
  })
  .catch(err => {
    console.error("Erro ao buscar dados:", err);
    const demandzContainer = document.getElementById("demandz");
    if (demandzContainer) {
      demandzContainer.textContent = "Erro ao carregar tabela.";
    }
  });