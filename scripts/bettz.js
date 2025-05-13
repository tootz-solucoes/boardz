function bettz() {
  const names = ["Milton", "Eliaquim", "Douglas", "Wendell", "Adelino", "Davi", "Luan"];
  const randomIndex = Math.floor(Math.random() * names.length);
  const pickedName = names[randomIndex];

  const resultElement = document.getElementById("bet-result");
  resultElement.innerText = "..." + pickedName + " 🍀";

  setTimeout(() => {
    resultElement.innerText = "";
  }, 1000 * 60 * 5);
}