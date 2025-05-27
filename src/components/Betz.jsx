import { useCallback, useEffect, useRef, useState } from "react";
import slotSound from "/assets/slot-machine.mp3";
import winSound from "/assets/win.wav";

const NAMES = [
  "Milton",
  "Eliaquim",
  "Douglas",
  "Wendell",
  "Adelino",
  "Davi",
  "Luan",
];
const EMOJIS = ["🍀", "🔥", "🎯", "💥", "⚡️", "🌀", "🌟"];
const SPIN_SOUND_URL = slotSound;
const WIN_SOUND_URL = winSound;

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Betz() {
  const [spinning, setSpinning] = useState(false);
  const [stack, setStack] = useState([{ name: "--", emoji: "" }]);
  const slotRef = useRef();
  const spinSoundRef = useRef();
  const winSoundRef = useRef();

  // Carrega os sons só uma vez
  useEffect(() => {
    spinSoundRef.current = new Audio(SPIN_SOUND_URL);
    spinSoundRef.current.preload = "auto";
    spinSoundRef.current.volume = 0.28;
    winSoundRef.current = new Audio(WIN_SOUND_URL);
    winSoundRef.current.preload = "auto";
    winSoundRef.current.volume = 0.55;
  }, []);

  // Limpa slot ao desmontar
  useEffect(() => () => setStack([{ name: "--", emoji: "" }]), []);

  const bettz = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    // Duração mais longa (6 a 9s)
    const totalDuration = Math.floor(Math.random() * (9000 - 6000 + 1)) + 6000;
    let delays = [];
    let delay = 80;
    let accumulatedTime = 0;
    while (accumulatedTime + delay < totalDuration) {
      delays.push(delay);
      accumulatedTime += delay;
      delay += 19;
    }

    const shuffledNames = shuffle(NAMES);
    let rolls = [];
    let currentIndex = 0;
    for (let i = 0; i < delays.length; i++) {
      rolls.push({
        name: shuffledNames[currentIndex % shuffledNames.length],
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      });
      currentIndex++;
    }

    let currentRoll = 0;

    function spinStep() {
      setStack((prev) => [...prev, rolls[currentRoll]]);
      // Som de giro
      try {
        spinSoundRef.current.currentTime = 0;
        spinSoundRef.current.play();
      } catch {}
      if (currentRoll < rolls.length - 1) {
        setTimeout(spinStep, delays[currentRoll]);
        currentRoll++;
      } else {
        // Parar o som do slot imediatamente
        try {
          spinSoundRef.current.pause();
          spinSoundRef.current.currentTime = 0;
        } catch {}

        // Toca som de vitória
        try {
          winSoundRef.current.currentTime = 0;
          winSoundRef.current.play();
        } catch {}

        setSpinning(false);

        setTimeout(() => {
          setStack([{ name: "--", emoji: "" }]);
        }, 1000 * 60 * 5);
      }
    }

    setStack([{ name: "--", emoji: "" }]);
    setTimeout(spinStep, 180);
  }, [spinning]);

  useEffect(() => {
    if (slotRef.current && stack.length > 1) {
      slotRef.current.scrollTo({
        top: slotRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [stack]);

  const winnerIndex = stack.length - 1;
  const isWinnerDisplayed = !spinning && stack.length > 1;

  return (
    <div className="widget">
      <header>
        <h2 style={{ color: "#b388ff", marginBottom: 8 }}>🎲 bettz.</h2>
      </header>
      <div>
        <div
          ref={slotRef}
          className="slot-container"
          style={{
            height: "42px",
            overflow: "hidden",
            borderRadius: 14,
            boxShadow: "0 0 0 1.5px #b388ffcc, 0 3px 18px #20185c60",
            margin: "1rem 0",
            position: "relative",
            width: "100%",
            border: "1.5px solid #b388ff44",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              transition: "none",
              minHeight: "42px",
            }}
          >
            {stack.map((s, i) => (
              <div
                key={i}
                style={{
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize:
                    i === winnerIndex && isWinnerDisplayed ? "1.4em" : "1.2em",
                  fontWeight:
                    i === winnerIndex && isWinnerDisplayed ? 800 : 500,
                  color:
                    i === winnerIndex && isWinnerDisplayed ? "#b388ff" : "#eee",
                  textAlign: "center",
                  opacity:
                    i === winnerIndex || i === stack.length - 1 ? 1 : 0.66,
                  transition: "font-size .22s, color .2s, opacity .16s",
                  letterSpacing:
                    i === winnerIndex && isWinnerDisplayed ? ".01em" : ".04em",
                  textShadow:
                    i === winnerIndex && isWinnerDisplayed
                      ? "0 3px 18px #b388ff44, 0 1px 1px #fff2"
                      : "0 1px 1px #23213680",
                  filter:
                    i === winnerIndex && isWinnerDisplayed
                      ? "drop-shadow(0 0 8px #b388ff99)"
                      : "none",
                }}
              >
                {i === winnerIndex && isWinnerDisplayed ? "🎉 " : ""}
                {s.name} {s.emoji}
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={bettz}
          className="btn"
          style={{
            width: "100%",
            opacity: spinning ? 0.7 : 1,
            pointerEvents: spinning ? "none" : "auto",
            background: spinning
              ? "linear-gradient(90deg, #b388ff88 0%, #b388ff44 100%)"
              : "linear-gradient(90deg, #b388ff 0%, #5b21b6 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.08rem",
            border: "none",
            borderRadius: "10px",
            boxShadow: "0 2px 8px #18102266",
            padding: "12px 0",
            marginTop: "6px",
            letterSpacing: ".04em",
            transition: "all .13s",
          }}
        >
          {spinning ? "Girando..." : "Girar a roleta!"}
        </button>
      </div>
    </div>
  );
}
