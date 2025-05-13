function updateWeekdayHeaders() {
  const weekdayNames = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (domingo) a 6 (sábado)

  // Calcula a data da segunda-feira da semana atual
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // ajusta para segunda

  // Seleciona os headers da tabela (começa do índice 1, ignorando o "DESENVOLVEDOR")
  const headers = document.querySelectorAll('#quadroTabela thead th');

  for (let i = 1; i <= 5; i++) { // Segunda a Sexta
    const date = new Date(monday);
    date.setDate(monday.getDate() + (i - 1)); // Incrementa os dias a partir de segunda
    const dayName = weekdayNames[date.getDay()];
    const dayNumber = date.getDate().toString().padStart(2, '0');

    headers[i].textContent = `${dayName} (${dayNumber})`;
  }
}

// Executa assim que a página carregar
window.addEventListener('DOMContentLoaded', updateWeekdayHeaders);