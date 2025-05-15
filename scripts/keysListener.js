function setupKeySoundListener() {
  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    switch (event.key) {
      case "1":
        playSoundById("sound-l");
        break;
      case "2":
        playSoundById("sound-end");
        break;
      case "3":
        const bettzBtn = document.getElementById("btn-bettz");
        if (bettzBtn) {
          bettzBtn.click();
        } else {
          console.warn('Botão "Escolher sortudo" não encontrado.');
        }
        break;
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupKeySoundListener();
});
