import { useEffect, useRef, useState } from "react";
import { Bomb, Clover, Dices, Flame, Loader2, Orbit, PartyPopper, Star, Target, Trophy, Zap } from "lucide-react";
import slotSound from "/assets/slot-machine.mp3";
import winSound from "/assets/win.wav";

const BASE_NAMES = ["Milton", "Eliaquim", "Henrique", "Douglas", "Wendell", "Adelino", "Luan"];
const GIRL_NAMES = ["Samanta", "Jéssica", "Miriã"];
const GAMEMIND_NAMES = ["Nathanael", "Mateus"];
const SYMBOLS = [Clover, Flame, Target, Bomb, Zap, Orbit, Star];
const CONFETTI_COLORS = ["#f5c842", "#e53e3e", "#38a169", "#3182ce", "#b388ff", "#ed64a6", "#fff"];
const MARQUEE_COLORS = ["#e53e3e", "#f5c842", "#38a169", "#3182ce", "#ed64a6", "#f5c842", "#e53e3e", "#38a169", "#3182ce"];

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

function generateConfetti() {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));
}

function CasinoConfetti({ particles }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 10, borderRadius: 16 }}>
      {particles.map((p) => (
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

const ITEM_HEIGHT = 42;

export default function Betz() {
  const [spinning, setSpinning] = useState(false);
  const [names, setNames] = useState(() => getNames());
  const [shuffledNames, setShuffledNames] = useState(() => shuffle(names));
  const [winner, setWinner] = useState(null);
  const [casinoMode, setCasinoMode] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [slotFlash, setSlotFlash] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState([]);

  const scrollListRef = useRef(null);
  const spinSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const celebrateTimerRef = useRef(null);
  const slowdownTimerRef = useRef(null);

  const updateNames = () => setNames(getNames());

  function toggleTtz() { window.CAN_TTZ = !window.CAN_TTZ; updateNames(); }
  function toggleGirls() { window.CAN_GIRLS = !window.CAN_GIRLS; updateNames(); }
  function toggleGamemind() { window.CAN_GAMEMIND = !window.CAN_GAMEMIND; updateNames(); }

  useEffect(() => {
    const handleToggle = () => updateNames();
    document.addEventListener("toggleGirls", handleToggle);
    document.addEventListener("toggleGamemind", handleToggle);
    return () => {
      document.removeEventListener("toggleGirls", handleToggle);
      document.removeEventListener("toggleGamemind", handleToggle);
    };
  }, []);

  useEffect(() => { setShuffledNames(shuffle(names)); }, [names]);

  useEffect(() => {
    spinSoundRef.current = new Audio(slotSound);
    spinSoundRef.current.preload = "auto";
    spinSoundRef.current.volume = 0.28;
    winSoundRef.current = new Audio(winSound);
    winSoundRef.current.preload = "auto";
    winSoundRef.current.volume = 0.55;
  }, []);

  useEffect(() => {
    return () => {
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
      if (slowdownTimerRef.current) clearTimeout(slowdownTimerRef.current);
    };
  }, []);

  function startSpin() {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    setCasinoMode(true);
    setCelebrating(false);
    setSlotFlash(false);
    if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    if (slowdownTimerRef.current) clearTimeout(slowdownTimerRef.current);

    const newShuffle = shuffle(names);
    setShuffledNames(newShuffle);

    try {
      spinSoundRef.current.loop = true;
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play();
    } catch { /* ignore autoplay failures */ }

    const totalSpinTime = 6 + Math.random() * 3;
    if (scrollListRef.current) {
      scrollListRef.current.style.transition = "none";
      scrollListRef.current.style.transform = "translateY(0)";
      scrollListRef.current.style.animation = `scrollUp 1.5s linear infinite`;
    }

    // Stop and reveal at 100%
    setTimeout(() => {
      try {
        spinSoundRef.current.pause();
        spinSoundRef.current.currentTime = 0;
      } catch { /* ignore */ }

      const chosenWinner = newShuffle[0];
      setWinner(chosenWinner);

      if (scrollListRef.current) {
        const index = newShuffle.indexOf(chosenWinner);
        // Target the second copy of the list so centering works with 1 item visible above
        const scrollPosition = Math.max(0, (newShuffle.length + index) * ITEM_HEIGHT - Math.floor(ITEM_HEIGHT / 2));

        scrollListRef.current.style.animation = "none";
        void scrollListRef.current.offsetHeight;
        scrollListRef.current.style.transition = "transform 0.6s cubic-bezier(0.34,1.2,0.64,1)";
        scrollListRef.current.style.transform = `translateY(-${scrollPosition}px)`;
      }

      // Flash reveal
      setSlotFlash(true);
      setTimeout(() => setSlotFlash(false), 700);

      try {
        winSoundRef.current.currentTime = 0;
        winSoundRef.current.play();
      } catch { /* ignore */ }

      setSpinning(false);
      setCelebrating(true);
      setConfettiParticles(generateConfetti());

      celebrateTimerRef.current = setTimeout(() => {
        setCasinoMode(false);
        setCelebrating(false);
        setWinner(null);
        if (scrollListRef.current) {
          scrollListRef.current.style.transition = "none";
          scrollListRef.current.style.transform = "translateY(0)";
        }
      }, 60000);
    }, totalSpinTime * 1000);
  }

  // Triple list so centering works at both ends
  const tripleList = [...shuffledNames, ...shuffledNames, ...shuffledNames];

  const containerStyle = casinoMode
    ? {
        background: "radial-gradient(ellipse at center, #1a0a00 0%, #0d0500 100%)",
        border: "2px solid #f5c842",
        boxShadow: "0 0 50px #f5c84266, inset 0 0 30px #1a080088, 0 0 0 4px #b8860b44",
        animation: "casinoBorderPulse 1.5s ease-in-out infinite",
      }
    : {};

  const slotBorderStyle = slotFlash
    ? { boxShadow: "0 0 0 3px #fff, 0 0 30px #f5c842, 0 0 60px #f5c84288" }
    : casinoMode
    ? { boxShadow: "0 0 0 1.5px #f5c842cc, 0 3px 18px #5a380060" }
    : { boxShadow: "0 0 0 1.5px #b388ffcc, 0 3px 18px #20185c60" };

  return (
    <div
      className="rounded-2xl grow p-[1.2rem] shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col bg-bg-widget"
      style={{ position: "relative", transition: "background 0.4s ease, border 0.4s ease, box-shadow 0.4s ease", ...containerStyle }}
    >
      {celebrating && <CasinoConfetti particles={confettiParticles} />}

      {/* Header */}
      <header className="flex justify-between items-center mb-4" style={{ position: "relative", zIndex: 2 }}>
        <div className="flex items-center gap-3">
          <Dices
            size={22}
            style={
              casinoMode
                ? {
                    color: "#f5c842",
                    filter: "drop-shadow(0 0 8px #f5c84288)",
                    animation: spinning ? "casinoTitleFlicker 0.5s ease-in-out infinite" : "casinoBlink 0.8s ease-in-out infinite alternate",
                  }
                : {}
            }
            className={casinoMode ? "" : "text-purple-accent shrink-0"}
          />
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[1.26rem] font-bold leading-none tracking-tight"
              style={
                casinoMode
                  ? {
                      color: "#f5c842",
                      filter: "drop-shadow(0 0 8px #f5c84288)",
                      animation: spinning ? "casinoTitleFlicker 0.5s ease-in-out infinite" : "none",
                    }
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
                    width: 10, height: 10, borderRadius: "50%",
                    backgroundColor: color, boxShadow: `0 0 6px ${color}`,
                    animation: `casinoBlink ${0.6 + i * 0.2}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
          {[
            { label: "TTZ.", active: window.CAN_TTZ, toggle: toggleTtz },
            { label: "Girls", active: window.CAN_GIRLS, toggle: toggleGirls },
            { label: "GM", active: window.CAN_GAMEMIND, toggle: toggleGamemind },
          ].map(({ label, active, toggle }) => (
            <button
              key={label}
              onClick={toggle}
              className={`py-1 px-3 font-mono text-[0.75rem] rounded-lg cursor-pointer border transition-all duration-150 ${
                active
                  ? casinoMode
                    ? "bg-[rgba(245,200,66,0.18)] border-[rgba(245,200,66,0.5)]"
                    : "bg-[rgba(179,136,255,0.18)] text-purple-accent border-[rgba(179,136,255,0.45)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
                  : "bg-[rgba(255,255,255,0.04)] text-[#666] border-[rgba(255,255,255,0.07)] shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
              }`}
              style={casinoMode && active ? { color: "#f5c842" } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center gap-3" style={{ position: "relative", zIndex: 2 }}>

        {/* "Vencedor!" label */}
        {celebrating && winner && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
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

        {/* Marquee lights above slot */}
        {casinoMode && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
            {MARQUEE_COLORS.map((color, i) => (
              <div
                key={i}
                style={{
                  width: 9, height: 9, borderRadius: "50%",
                  backgroundColor: color,
                  boxShadow: `0 0 7px ${color}, 0 0 14px ${color}66`,
                  animation: `casinoBlink 0.5s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Slot machine panel */}
        <div
          style={{
            height: casinoMode ? 84 : 42,
            overflow: "hidden",
            borderRadius: 14,
            border: casinoMode ? "1.5px solid #f5c84299" : "1.5px solid #b388ff44",
            position: "relative",
            backgroundColor: casinoMode ? "#110800" : "#1F1F23",
            color: "#eee",
            fontWeight: 500,
            fontSize: "1.2em",
            letterSpacing: ".04em",
            userSelect: "none",
            transition: "height 0.4s ease, background-color 0.4s ease, border 0.4s ease",
            ...slotBorderStyle,
          }}
        >
          {/* Fade gradients top/bottom */}
          {casinoMode && (
            <>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 36, zIndex: 3, pointerEvents: "none",
                background: "linear-gradient(to bottom, #110800ee 0%, transparent 100%)",
              }} />
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 36, zIndex: 3, pointerEvents: "none",
                background: "linear-gradient(to top, #110800ee 0%, transparent 100%)",
              }} />
              {/* Center selection lines */}
              <div style={{
                position: "absolute", top: 21, left: 0, right: 0, height: 1, zIndex: 4, pointerEvents: "none",
                background: "linear-gradient(90deg, transparent 0%, #f5c842 20%, #f5c842 80%, transparent 100%)",
                opacity: 0.25,
              }} />
              <div style={{
                position: "absolute", top: 63, left: 0, right: 0, height: 1, zIndex: 4, pointerEvents: "none",
                background: "linear-gradient(90deg, transparent 0%, #f5c842 20%, #f5c842 80%, transparent 100%)",
                opacity: 0.25,
              }} />
            </>
          )}

          <div
            ref={scrollListRef}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {tripleList.map((name, i) => {
              const isWinner = winner === name && i >= shuffledNames.length && i < shuffledNames.length * 2;
              const SymbolIcon = SYMBOLS[i % SYMBOLS.length];
              return (
                <div
                  key={i}
                  style={{
                    height: ITEM_HEIGHT,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: isWinner ? 800 : 500,
                    fontSize: isWinner ? "1.4em" : "1.2em",
                    color: isWinner ? (casinoMode ? "#f5c842" : "#b388ff") : "#eee",
                    textShadow: isWinner
                      ? casinoMode ? "0 3px 18px #f5c84266, 0 1px 1px #fff2" : "0 3px 18px #b388ff44, 0 1px 1px #fff2"
                      : "0 1px 1px #23213680",
                    filter: isWinner
                      ? casinoMode ? "drop-shadow(0 0 8px #f5c84299)" : "drop-shadow(0 0 8px #b388ff99)"
                      : "none",
                    animation: isWinner && casinoMode ? "casinoTitleFlicker 0.5s ease-in-out infinite" : "none",
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

        {/* Marquee lights below slot */}
        {casinoMode && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
            {[...MARQUEE_COLORS].reverse().map((color, i) => (
              <div
                key={i}
                style={{
                  width: 9, height: 9, borderRadius: "50%",
                  backgroundColor: color,
                  boxShadow: `0 0 7px ${color}, 0 0 14px ${color}66`,
                  animation: `casinoBlink 0.5s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.07 + 0.035}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Spin button */}
        <button
          id="btn-bettz"
          onClick={startSpin}
          disabled={spinning}
          style={{
            width: "100%",
            opacity: spinning ? 0.7 : 1,
            pointerEvents: spinning ? "none" : "auto",
            background: spinning
              ? "linear-gradient(270deg, #c53030, #f6ad55, #c53030)"
              : casinoMode
              ? "linear-gradient(90deg, #e53e3e 0%, #f6ad55 100%)"
              : "linear-gradient(90deg, #b388ff 0%, #5b21b6 100%)",
            backgroundSize: spinning ? "200% 200%" : "100% 100%",
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.08rem",
            border: casinoMode ? "1px solid #f5c84266" : "none",
            borderRadius: 10,
            boxShadow: casinoMode
              ? spinning ? "0 2px 8px #c5303044" : "0 2px 16px #e53e3e66, 0 0 30px #f6ad5533"
              : "0 2px 8px #18102266",
            padding: "12px 0",
            letterSpacing: ".04em",
            transition: "all .13s",
            cursor: spinning ? "not-allowed" : "pointer",
            animation: spinning
              ? "casinoButtonSpin 1s ease-in-out infinite"
              : casinoMode
              ? "casinoButtonPulse 1.2s ease-in-out infinite"
              : "none",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {spinning
              ? <>
                  <Loader2 size={16} style={{ animation: "spinIcon 0.8s linear infinite" }} />
                  Girando
                  <span style={{ display: "inline-flex", gap: 2 }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} style={{ animation: `dotBounce 1s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>.</span>
                    ))}
                  </span>
                </>
              : casinoMode
              ? <><Dices size={16} /> Girar!</>
              : "Girar a roleta!"}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.333%); }
        }
        @keyframes casinoBorderPulse {
          0%, 100% { box-shadow: 0 0 50px #f5c84266, inset 0 0 30px #1a080088, 0 0 0 4px #b8860b44; }
          50% { box-shadow: 0 0 70px #f5c842aa, inset 0 0 30px #1a080088, 0 0 0 4px #f5c84266; }
        }
        @keyframes casinoBlink {
          0% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes spinIcon {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes casinoButtonSpin {
          0% { background-position: 0% 50%; opacity: 0.7; }
          50% { background-position: 100% 50%; opacity: 1; }
          100% { background-position: 0% 50%; opacity: 0.7; }
        }
        @keyframes casinoButtonPulse {
          0%, 100% { box-shadow: 0 2px 16px #e53e3e66, 0 0 30px #f6ad5533; }
          50% { box-shadow: 0 2px 24px #e53e3eaa, 0 0 40px #f6ad5566; }
        }
        @keyframes casinoTitleFlicker {
          0%, 100% { color: #f5c842; filter: drop-shadow(0 0 8px #f5c84288); }
          50% { color: #e53e3e; filter: drop-shadow(0 0 8px #e53e3e88); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        @keyframes winnerPop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
