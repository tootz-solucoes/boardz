import { useEffect, useRef, useState } from "react";
import slotSound from "/assets/slot-machine.mp3";
import winSound from "/assets/win.wav";

const BASE_NAMES = [
  "Milton",
  "Eliaquim",
  "Douglas",
  "Wendell",
  "Adelino",
  "Luan",
  "Vinícius",
];
const GIRL_NAMES = ["Samantha", "Jéssica", "Miriã"];
const GAMEMIND_NAMES = ["Joao", "Nathanael", "Mateus"];
const EMOJIS = ["🦇", "🕯️", "🎃", "👻", "🕷️", "☠️", "🧙"];
const SPIN_SOUND_URL = slotSound;
const WIN_SOUND_URL = winSound;

if (typeof window !== "undefined") {
  if (window.CAN_GIRLS === undefined) window.CAN_GIRLS = false;
  if (window.CAN_GAMEMIND === undefined) window.CAN_GAMEMIND = false;
}

function getNames() {
  let names = [...BASE_NAMES];
  if (window.CAN_GIRLS) names = names.concat(GIRL_NAMES);
  if (window.CAN_GAMEMIND) names = names.concat(GAMEMIND_NAMES);
  return names;
}

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
  const [names, setNames] = useState(() => getNames());
  const [shuffledNames, setShuffledNames] = useState(() => shuffle(names));
  const [winner, setWinner] = useState(null);

  const scrollListRef = useRef(null);
  const spinSoundRef = useRef(null);
  const winSoundRef = useRef(null);

  const updateNames = () => setNames(getNames());

  function toggleGirls() {
    window.CAN_GIRLS = !window.CAN_GIRLS;
    updateNames();
  }

  function toggleGamemind() {
    window.CAN_GAMEMIND = !window.CAN_GAMEMIND;
    updateNames();
  }

  useEffect(() => {
    const handleToggle = () => updateNames();
    document.addEventListener("toggleGirls", handleToggle);
    document.addEventListener("toggleGamemind", handleToggle);
    return () => {
      document.removeEventListener("toggleGirls", handleToggle);
      document.removeEventListener("toggleGamemind", handleToggle);
    };
  }, []);

  useEffect(() => {
    setShuffledNames(shuffle(names));
  }, [names]);

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

    const newShuffle = shuffle(names);
    setShuffledNames(newShuffle);

    try {
      spinSoundRef.current.loop = true;
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play();
    } catch {}

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
      } catch {}

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
      } catch {}

      setSpinning(false);
    }, totalSpinTime * 1000);
  }

  const doubledList = [...shuffledNames, ...shuffledNames];

  return (
    <div className="widget">
      <header>
        <div>
          <h2>🎰 roleta macabra</h2>
          <span className="widget-subtitle">quem encara o desafio?</span>
        </div>
      </header>

      <div
        className="scroll-container"
        style={{
          height: 42,
          overflow: "hidden",
          borderRadius: 14,
          border: "1.5px solid rgba(249, 115, 22, 0.45)",
          boxShadow:
            "0 0 0 1.5px rgba(249, 115, 22, 0.65), 0 12px 32px rgba(8, 3, 18, 0.65)",
          position: "relative",
          marginBottom: 16,
          backgroundColor: "rgba(16, 6, 28, 0.88)",
          color: "#fff3e8",
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
                  color: isWinner ? "#f97316" : "#fff3e8",
                  textShadow: isWinner
                    ? "0 3px 18px rgba(249, 115, 22, 0.45), 0 1px 1px #fff2"
                    : "0 1px 1px rgba(35, 21, 54, 0.5)",
                  filter: isWinner
                    ? "drop-shadow(0 0 12px rgba(249, 115, 22, 0.55))"
                    : "none",
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

      <div className="widget-controls">
        <button
          onClick={toggleGirls}
          className={`btn ${window.CAN_GIRLS ? "btn-active" : ""}`}
          style={{ flexGrow: 1 }}
        >
          {window.CAN_GIRLS ? "Girls ON" : "Girls OFF"}
        </button>
        <button
          onClick={toggleGamemind}
          className={`btn ${window.CAN_GAMEMIND ? "btn-active" : ""}`}
          style={{ flexGrow: 1 }}
        >
          {window.CAN_GAMEMIND ? "GM ON" : "GM OFF"}
        </button>
      </div>
      <button
        id="btn-bettz"
        onClick={startSpin}
        disabled={spinning}
        className={`btn btn-cta spin-button ${spinning ? "is-spinning" : ""}`}
      >
        {spinning ? "Conjurando..." : "Invocar destino"}
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
