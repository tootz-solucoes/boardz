import { useEffect, useRef, useState } from "react";
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
  const [shuffledNames, setShuffledNames] = useState(() => shuffle(NAMES));
  const [winner, setWinner] = useState(null);

  const scrollListRef = useRef(null);
  const spinSoundRef = useRef(null);
  const winSoundRef = useRef(null);

  useEffect(() => {
    spinSoundRef.current = new Audio(SPIN_SOUND_URL);
    spinSoundRef.current.preload = "auto";
    spinSoundRef.current.volume = 0.28;

    winSoundRef.current = new Audio(WIN_SOUND_URL);
    winSoundRef.current.preload = "auto";
    winSoundRef.current.volume = 0.55;
  }, []);

  function startSpin() {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    const newShuffle = shuffle(NAMES);
    setShuffledNames(newShuffle);

    try {
      spinSoundRef.current.loop = true;
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play();
    } catch { }

    // Tempo aleatório entre 6 e 9 segundos
    const totalSpinTime = 6 + Math.random() * 3;

    // Reseta scroll e animação
    if (scrollListRef.current) {
      scrollListRef.current.style.transition = "none";
      scrollListRef.current.style.transform = "translateY(0)";
    }

    // Após o tempo, parar o spin e mostrar vencedor
    setTimeout(() => {
      try {
        spinSoundRef.current.pause();
        spinSoundRef.current.currentTime = 0;
      } catch { }

      const chosenWinner = newShuffle[0];
      setWinner(chosenWinner);

      if (scrollListRef.current) {
        const itemHeight = 42;
        const index = newShuffle.indexOf(chosenWinner);
        const scrollPosition = index * itemHeight;

        // Parar animação e mover para o vencedor com transição rápida (0.5s)
        scrollListRef.current.style.transition = "transform 0.5s ease-out";
        scrollListRef.current.style.transform = `translateY(-${scrollPosition}px)`;
      }

      try {
        winSoundRef.current.currentTime = 0;
        winSoundRef.current.play();
      } catch { }

      setSpinning(false);
    }, totalSpinTime * 1000);
  }

  const doubledList = [...shuffledNames, ...shuffledNames];

  return (
    <div className="widget">
      <header>
        <h2 style={{ color: "#b388ff", marginBottom: 8 }}>🎲 bettz.</h2>
      </header>

      <div
        className="scroll-container"
        style={{
          height: 42,
          overflow: "hidden",
          borderRadius: 14,
          border: "1.5px solid #b388ff44",
          boxShadow: "0 0 0 1.5px #b388ffcc, 0 3px 18px #20185c60",
          position: "relative",
          marginBottom: 16,
          backgroundColor: "#1F1F23",
          color: "#eee",
          fontWeight: 500,
          fontSize: "1.2em",
          letterSpacing: ".04em",
          userSelect: "none",
        }}
      >
        <div
          ref={scrollListRef}
          className="scroll-list"
          style={{
            display: "flex",
            flexDirection: "column",
            animation: spinning ? `scrollUp 1.5s linear infinite` : "none",
            // animação constante, rápida, só durante spinning
          }}
        >
          {doubledList.map((name, i) => {
            const isWinner = winner === name && i < shuffledNames.length;
            return (
              <div
                key={i}
                className="scroll-item"
                style={{
                  height: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: isWinner ? 800 : 500,
                  fontSize: isWinner ? "1.4em" : "1.2em",
                  color: isWinner ? "#b388ff" : "#eee",
                  textShadow: isWinner
                    ? "0 3px 18px #b388ff44, 0 1px 1px #fff2"
                    : "0 1px 1px #23213680",
                  filter: isWinner ? "drop-shadow(0 0 8px #b388ff99)" : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {isWinner ? "🎉 " : ""}
                {name} {EMOJIS[i % EMOJIS.length]}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={startSpin}
        disabled={spinning}
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
          borderRadius: 10,
          boxShadow: "0 2px 8px #18102266",
          padding: "12px 0",
          letterSpacing: ".04em",
          transition: "all .13s",
          cursor: spinning ? "not-allowed" : "pointer",
        }}
      >
        {spinning ? "Girando..." : "Girar a roleta!"}
      </button>

      <style>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}
