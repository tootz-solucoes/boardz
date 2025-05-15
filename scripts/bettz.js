function bettz() {
  let names = ["Milton", "Eliaquim", "Douglas", "Wendell", "Adelino", "Davi", "Luan"];
  const emojis = ["🍀", "🔥", "🎯", "💥", "⚡️", "🌀", "🌟"];
  const slotText = document.getElementById("slot-text");

  // Embaralha os nomes (Fisher-Yates)
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }

  slotText.innerText = "--";
  slotText.classList.remove("slot-final");

  // Duração total aleatória entre 3s e 10s
  const totalDuration = Math.floor(Math.random() * (5000 - 1500 + 1)) + 3000;

  // Cálculo dos delays com desaceleração
  let delays = [];
  let delay = 50;
  let accumulatedTime = 0;

  while (accumulatedTime + delay < totalDuration) {
    delays.push(delay);
    accumulatedTime += delay;
    delay += 20; // desaceleração progressiva
  }

  let currentIndex = 0;
  let current = 0;

  function spin() {
    if (current >= delays.length) {
      const finalName = names[currentIndex % names.length];
      const finalEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const finalText = `🎉 ${finalName} ${finalEmoji}`;

      slotText.innerText = finalText;
      slotText.style.transform = "translateY(0)";
      slotText.classList.add("slot-final");

      setTimeout(() => {
        slotText.innerText = "";
        slotText.classList.remove("slot-final");
      }, 1000 * 60 * 5);

      return;
    }

    const name = names[currentIndex % names.length];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const nextText = `${name} ${emoji}`;

    slotText.style.transform = "translateY(-100%)";
    setTimeout(() => {
      slotText.innerText = nextText;
      slotText.style.transition = "none";
      slotText.style.transform = "translateY(100%)";
      void slotText.offsetWidth;
      slotText.style.transition = "transform 0.05s ease-in-out";
      slotText.style.transform = "translateY(0)";
    }, delays[current] / 2);

    currentIndex++;
    setTimeout(spin, delays[current]);
    current++;
  }

  spin();
}
