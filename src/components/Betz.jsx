import { useEffect, useRef, useState } from "react";
import { Bomb, Clover, Dices, Flame, Orbit, PartyPopper, Slash, Star, Target, Trophy, Zap } from "lucide-react";
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

const CONFETTI_COLORS = ["#f5c842", "#e53e3e", "#38a169", "#3182ce", "#b388ff", "#ed64a6", "#fff"];

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

const confettiParticles = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 2 + Math.random() * 3,
  size: 6 + Math.random() * 8,
  color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  rotation: Math.random() * 360,
  shape: Math.random() > 0.5 ? "rect" : "circle",
}));

function CasinoConfetti() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10, borderRadius: 16 }}>
      {confettiParticles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: "-10px",
            left: `${p.left}%`,
            width: p.shape === "circle" ? p.size : p.size * 0.6,
            height: p.shape === "circle" ? p.size : p.size * 1.4,
            borderRadius: p.shape === "circle" ? "50%" : 2,
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function Betz() {
  const [spinning, setSpinning] = useState(false);
  const [names, setNames] = useState(() => getNames());
  const [shuffledNames, setShuffledNames] = useState(() => shuffle(names));
  const [winner, setWinner] = useState(null);
  const [casinoMode, setCasinoMode] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const scrollListRef = useRef(null);
  const spinSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const celebrateTimerRef = useRef(null);

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

  useEffect(() => {
    return () => {
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    };
  }, []);

  function startSpin() {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    setCasinoMode(true);
    setCelebrating(false);
    if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);

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
      setCelebrating(true);

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

      celebrateTimerRef.current = setTimeout(() => {
        setCasinoMode(false);
        setCelebrating(false);
        setWinner(null);
      }, 60000);
    }, totalSpinTime * 1000);
  }

  const doubledList = [...shuffledNames, ...shuffledNames];

  const containerStyle = casinoMode
    ? {
        background: "radial-gradient(ellipse at center, #1a0a00 0%, #0d0500 100%)",
        border: "2px solid #f5c842",
        boxShadow: "0 0 50px #f5c84266, inset 0 0 30px #1a080088, 0 0 0 4px #b8860b44",
        animation: "casinoBorderPulse 1.5s ease-in-out infinite",
      }
    : {};

  return (
    <div
      className="rounded-2xl grow p-[1.2rem] shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col bg-bg-widget"
      style={{ position: "relative", transition: "all 0.4s ease", ...containerStyle }}
    >
      {celebrating && <CasinoConfetti />}

      <header className="flex justify-between items-center mb-5" style={{ position: "relative", zIndex: 2 }}>
        <div className="flex items-center gap-3">
          <Dices
            size={22}
            style={
              casinoMode
                ? { color: "#f5c842", filter: "drop-shadow(0 0 8px #f5c84288)", animation: "casinoBlink 0.8s ease-in-out infinite alternate" }
                : {}
            }
            className={casinoMode ? "" : "text-purple-accent shrink-0"}
          />
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[1.26rem] font-bold leading-none tracking-tight"
              style={
                casinoMode
                  ? { color: "#f5c842", filter: "drop-shadow(0 0 8px #f5c84288)" }
                  : { color: "#fff", filter: "drop-shadow(0 0 6px rgba(179,136,255,0.6))" }
              }
            >
              bettz.
            </span>
            <span
              className="text-[0.84rem] font-medium tracking-wide leading-none"
              style={casinoMode ? { color: "#f5c842aa" } : { color: "var(--color-text-soft)", opacity: 0.6 }}
            >
              {casinoMode ? "boa sorte!" : "sorteio de responsável"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {casinoMode && (
            <div className="flex gap-1.5 mr-1">
              {["#e53e3e", "#f5c842", "#38a169"].map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: color,
                    boxShadow: `0 0 6px ${color}`,
                    animation: `casinoBlink ${0.6 + i * 0.2}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
          <button
            onClick={toggleTtz}
            className={`py-1 px-3 font-mono text-[0.75rem] rounded-lg cursor-pointer border transition-all duration-150 ${
              window.CAN_TTZ
                ? casinoMode
                  ? "bg-[rgba(245,200,66,0.18)] border-[rgba(245,200,66,0.5)]"
                  : "bg-[rgba(179,136,255,0.18)] text-purple-accent border-[rgba(179,136,255,0.45)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
                : "bg-[rgba(255,255,255,0.04)] text-[#666] border-[rgba(255,255,255,0.07)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
            }`}
            style={casinoMode && window.CAN_TTZ ? { color: "#f5c842" } : {}}
          >
            TTZ.
          </button>
          <button
            onClick={toggleGirls}
            className={`py-1 px-3 font-mono text-[0.75rem] rounded-lg cursor-pointer border transition-all duration-150 ${
              window.CAN_GIRLS
                ? casinoMode
                  ? "bg-[rgba(245,200,66,0.18)] border-[rgba(245,200,66,0.5)]"
                  : "bg-[rgba(179,136,255,0.18)] text-purple-accent border-[rgba(179,136,255,0.45)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
                : "bg-[rgba(255,255,255,0.04)] text-[#666] border-[rgba(255,255,255,0.07)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
            }`}
            style={casinoMode && window.CAN_GIRLS ? { color: "#f5c842" } : {}}
          >
            Girls
          </button>
          <button
            onClick={toggleGamemind}
            className={`py-1 px-3 font-mono text-[0.75rem] rounded-lg cursor-pointer border transition-all duration-150 ${
              window.CAN_GAMEMIND
                ? casinoMode
                  ? "bg-[rgba(245,200,66,0.18)] border-[rgba(245,200,66,0.5)]"
                  : "bg-[rgba(179,136,255,0.18)] text-purple-accent border-[rgba(179,136,255,0.45)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
                : "bg-[rgba(255,255,255,0.04)] text-[#666] border-[rgba(255,255,255,0.07)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
            }`}
            style={casinoMode && window.CAN_GAMEMIND ? { color: "#f5c842" } : {}}
          >
            GM
          </button>
        </div>
      </header>


      <div className="flex-1 flex flex-col justify-center gap-4" style={{ position: "relative", zIndex: 2 }}>
        {celebrating && winner && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              animation: "winnerPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
              color: "#f5c842",
              filter: "drop-shadow(0 0 8px #f5c84288)",
            }}
          >
            <Trophy size={14} />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Vencedor!
            </span>
            <Trophy size={14} />
          </div>
        )}
        <div
          style={{
            height: 42,
            overflow: "hidden",
            borderRadius: 14,
            border: casinoMode ? "1.5px solid #f5c84299" : "1.5px solid #b388ff44",
            boxShadow: casinoMode
              ? "0 0 0 1.5px #f5c842cc, 0 3px 18px #5a380060"
              : "0 0 0 1.5px #b388ffcc, 0 3px 18px #20185c60",
            position: "relative",
            backgroundColor: casinoMode ? "#110800" : "#1F1F23",
            color: "#eee",
            fontWeight: 500,
            fontSize: "1.2em",
            letterSpacing: ".04em",
            userSelect: "none",
            transition: "all 0.4s ease",
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
                    color: isWinner ? (casinoMode ? "#f5c842" : "#b388ff") : "#eee",
                    textShadow: isWinner
                      ? casinoMode
                        ? "0 3px 18px #f5c84266, 0 1px 1px #fff2"
                        : "0 3px 18px #b388ff44, 0 1px 1px #fff2"
                      : "0 1px 1px #23213680",
                    filter: isWinner
                      ? casinoMode
                        ? "drop-shadow(0 0 8px #f5c84299)"
                        : "drop-shadow(0 0 8px #b388ff99)"
                      : "none",
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
            background: casinoMode
              ? spinning
                ? "linear-gradient(90deg, #c53030aa 0%, #d4880088 100%)"
                : "linear-gradient(90deg, #e53e3e 0%, #f6ad55 100%)"
              : spinning
              ? "linear-gradient(90deg, #b388ff88 0%, #b388ff44 100%)"
              : "linear-gradient(90deg, #b388ff 0%, #5b21b6 100%)",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.08rem",
            border: casinoMode ? "1px solid #f5c84266" : "none",
            borderRadius: 10,
            boxShadow: casinoMode
              ? spinning
                ? "0 2px 8px #c5303044"
                : "0 2px 16px #e53e3e66, 0 0 30px #f6ad5533"
              : "0 2px 8px #18102266",
            padding: "12px 0",
            letterSpacing: ".04em",
            transition: "all .13s",
            cursor: spinning ? "not-allowed" : "pointer",
            animation: casinoMode && !spinning ? "casinoButtonPulse 1.2s ease-in-out infinite" : "none",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {spinning
              ? <><Slash size={16} /> Girando...</>
              : casinoMode
              ? <><Dices size={16} /> Girar!</>
              : "Girar a roleta!"}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes casinoBorderPulse {
          0%, 100% { box-shadow: 0 0 50px #f5c84266, inset 0 0 30px #1a080088, 0 0 0 4px #b8860b44; }
          50% { box-shadow: 0 0 70px #f5c842aa, inset 0 0 30px #1a080088, 0 0 0 4px #f5c84266; }
        }
        @keyframes casinoBlink {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        @keyframes casinoButtonPulse {
          0%, 100% { box-shadow: 0 2px 16px #e53e3e66, 0 0 30px #f6ad5533; }
          50% { box-shadow: 0 2px 24px #e53e3eaa, 0 0 40px #f6ad5566; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(350px) rotate(720deg); opacity: 0; }
        }
        @keyframes winnerPop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
