import { useEffect, useRef, useState } from "react";
import { Bomb, Clover, Dices, Flame, Orbit, PartyPopper, Star, Target, Zap } from "lucide-react";
import slotSound from "/assets/slot-machine.mp3";
import winSound from "/assets/win.wav";

const BASE_NAMES = [
  "Milton",
  "Eliaquim",
  "Henrique",
  "Douglas",
  "Wendell",
  "Adelino",
  "Luan",
];
const GIRL_NAMES = ["Samantha", "Jéssica", "Miriã"];
const GAMEMIND_NAMES = ["Nathanael", "Mateus"];
const SYMBOLS = [Clover, Flame, Target, Bomb, Zap, Orbit, Star];
const SPIN_SOUND_URL = slotSound;
const WIN_SOUND_URL = winSound;

if (typeof window !== "undefined") {
  if (window.CAN_TTZ === undefined) window.CAN_TTZ = true;
  if (window.CAN_GIRLS === undefined) window.CAN_GIRLS = true;
  if (window.CAN_GAMEMIND === undefined) window.CAN_GAMEMIND = true;
}

function getNames() {
  let names = [];
  if (window.CAN_TTZ) names = names.concat(BASE_NAMES);
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

  function toggleTtz() {
    window.CAN_TTZ = !window.CAN_TTZ;
    updateNames();
  }

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
    } catch {
      // Ignore autoplay failures triggered by the browser.
    }

    const totalSpinTime = 6 + Math.random() * 3;

    if (scrollListRef.current) {
      scrollListRef.current.style.transition = "none";
      scrollListRef.current.style.transform = "translateY(0)";
    }

    setTimeout(() => {
      try {
        spinSoundRef.current.pause();
        spinSoundRef.current.currentTime = 0;
      } catch {
        // Ignore audio stop failures when the spin sound is unavailable.
      }

      const chosenWinner = newShuffle[0];
      setWinner(chosenWinner);

      if (scrollListRef.current) {
        const itemHeight = 42;
        const index = newShuffle.indexOf(chosenWinner);
        const scrollPosition = index * itemHeight;

        scrollListRef.current.style.transition = "transform 0.5s ease-out";
        scrollListRef.current.style.transform = `translateY(-${scrollPosition}px)`;
      }

      try {
        winSoundRef.current.currentTime = 0;
        winSoundRef.current.play();
      } catch {
        // Ignore audio play failures when the win sound is blocked.
      }

      setSpinning(false);
    }, totalSpinTime * 1000);
  }

  const doubledList = [...shuffledNames, ...shuffledNames];

  return (
    <div className="rounded-2xl grow bg-bg-widget p-[1.2rem] shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col">
      <header className="flex justify-between items-center mb-2">
        <h2 className="inline-flex items-center gap-[0.45rem]" style={{ color: "#b388ff", marginBottom: 8 }}><Dices size={28} /> bettz.</h2>
        <div className="flex gap-2">
          <button
            onClick={toggleTtz}
            className={`py-1 px-3 font-mono text-[0.75rem] rounded-lg cursor-pointer border transition-all duration-150 ${
              window.CAN_TTZ
                ? "bg-[rgba(179,136,255,0.18)] text-purple-accent border-[rgba(179,136,255,0.45)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
                : "bg-[rgba(255,255,255,0.04)] text-[#666] border-[rgba(255,255,255,0.07)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
            }`}
          >
            TTZ.
          </button>
          <button
            onClick={toggleGirls}
            className={`py-1 px-3 font-mono text-[0.75rem] rounded-lg cursor-pointer border transition-all duration-150 ${
              window.CAN_GIRLS
                ? "bg-[rgba(179,136,255,0.18)] text-purple-accent border-[rgba(179,136,255,0.45)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
                : "bg-[rgba(255,255,255,0.04)] text-[#666] border-[rgba(255,255,255,0.07)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
            }`}
          >
            Girls
          </button>
          <button
            onClick={toggleGamemind}
            className={`py-1 px-3 font-mono text-[0.75rem] rounded-lg cursor-pointer border transition-all duration-150 ${
              window.CAN_GAMEMIND
                ? "bg-[rgba(179,136,255,0.18)] text-purple-accent border-[rgba(179,136,255,0.45)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
                : "bg-[rgba(255,255,255,0.04)] text-[#666] border-[rgba(255,255,255,0.07)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
            }`}
          >
            GM
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center gap-4">
      <div
        style={{
          height: 42,
          overflow: "hidden",
          borderRadius: 14,
          border: "1.5px solid #b388ff44",
          boxShadow: "0 0 0 1.5px #b388ffcc, 0 3px 18px #20185c60",
          position: "relative",
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
          style={{
            display: "flex",
            flexDirection: "column",
            animation: spinning ? `scrollUp 1.5s linear infinite` : "none",
          }}
        >
          {doubledList.map((name, i) => {
            const isWinner = winner === name && i < shuffledNames.length;
            const SymbolIcon = SYMBOLS[i % SYMBOLS.length];
            return (
              <div
                key={i}
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
                {isWinner ? <PartyPopper size={22} style={{ marginRight: 8 }} /> : null}
                {name} <SymbolIcon size={22} style={{ marginLeft: 8 }} />
              </div>
            );
          })}
        </div>
      </div>

      <button
        id="btn-bettz"
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
      </div>

      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  );
}
