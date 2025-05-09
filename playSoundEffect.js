let audio;
let audioReady = false;
let lastPlayedHour = null; // Stores the last hour the audio was played

// Prepares the audio after user interaction
function prepareAudio() {
  if (!audioReady) {
    audio = new Audio("sound.mp3");
    audio.volume = 1.0;
    audio.muted = false;
    audio.load();
    audioReady = true;
    console.log("Audio is ready to play at 17:00.");
  }
}

// Checks the time and plays the audio at 22:30 if it hasn't played this hour
function checkAndPlayAudio() {
  const now = new Date();
  const currentHour = now.getHours();
  const isScheduledTime =
    currentHour === 17 &&
    now.getMinutes() === 0;

  // Only plays if it's the right time and hasn't played during this hour
  if (audioReady && isScheduledTime && lastPlayedHour !== currentHour) {
    audio.play()
      .then(() => {
        console.log("Audio played at 22:30.");
        lastPlayedHour = currentHour; // Mark as played this hour
      })
      .catch(err => {
        console.warn("Failed to play audio:", err);
      });
  }
}

// Wait for user interaction to unlock audio playback
window.addEventListener("click", prepareAudio, { once: true });
window.addEventListener("keypress", prepareAudio, { once: true });

// Check every 30 seconds
setInterval(checkAndPlayAudio, 30 * 1000);