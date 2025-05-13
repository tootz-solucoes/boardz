function playSoundById(audioId) {
  const audioElement = document.getElementById(audioId);
  if (audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch((err) => {
      console.warn("Falha ao tocar o som:", err);
    });
  } else {
    console.warn(`Áudio com ID "${audioId}" não encontrado.`);
  }
}
