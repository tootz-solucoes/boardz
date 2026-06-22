import { useState, useEffect } from "react";

function getInfo() {
  return {
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    screen: `${window.screen.width} × ${window.screen.height}`,
    dpr: window.devicePixelRatio,
    fontSize: parseFloat(getComputedStyle(document.body).fontSize).toFixed(2) + "px",
    colorDepth: window.screen.colorDepth + "bit",
    orientation: screen.orientation?.type ?? "—",
    userAgent: navigator.userAgent,
  };
}

export default function DebugOverlay() {
  const [info, setInfo] = useState(getInfo);

  useEffect(() => {
    const update = () => setInfo(getInfo());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="fixed bottom-3 left-3 z-[9999] bg-[rgba(0,0,0,0.82)] border border-[rgba(179,136,255,0.3)] rounded-xl px-3 py-2.5 text-[0.6em] font-mono text-purple-accent backdrop-blur-sm pointer-events-none">
      <div className="text-[0.9em] font-bold text-white/60 mb-1.5 uppercase tracking-widest">debug</div>
      <table className="border-separate" style={{ borderSpacing: "0 2px" }}>
        <tbody>
          {Object.entries(info).map(([key, val]) => (
            <tr key={key}>
              <td className="pr-3 text-text-dim opacity-60 whitespace-nowrap">{key}</td>
              <td className={`text-white/80 ${key === "userAgent" ? "max-w-[30ch] truncate block" : "whitespace-nowrap"}`}>{String(val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
