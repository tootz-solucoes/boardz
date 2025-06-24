function setupKeySoundListener() {
  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;

    switch (event.key) {
      case "ChannelUp":
        playSoundById("sound-l");
        break;
      case "ChannelDown":
        playSoundById("sound-end");
        break;
      case "1":
        window.CAN_GIRLS = !window.CAN_GIRLS;
        document.dispatchEvent(new Event("toggleGirls"));
        break;
      case "2":
        window.CAN_GAMEMIND = !window.CAN_GAMEMIND;
        document.dispatchEvent(new Event("toggleGamemind"));
        break;
      case "Unidentified":
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
