const BASE = "block w-full py-1.5 px-4 [font-size:1em] text-[#f1d8ff] rounded-[7px] bg-gradient-to-br from-[#502f8d] to-[#47326e] shadow-[0_0_10px_rgba(98,70,142,0.5)] transition-transform duration-200 hover:scale-[1.02]";

const VARIANTS = {
  "badge-highlight-today": "!bg-gradient-to-br !from-[#fbbf24] !to-[#f59e0b] border border-[rgba(255,200,0,0.8)] !text-[#5d0092] shadow-[0_6px_18px_rgba(245,158,11,0.45)]",
  "badge-calendar-holiday": "!bg-gradient-to-br !from-[#1e3a5f] !to-[#2563eb] border border-[rgba(59,130,246,0.5)] !text-[#bfdbfe] shadow-[0_4px_12px_rgba(37,99,235,0.3)]",
  "badge-calendar-optional": "!bg-gradient-to-br !from-[#3b2a00] !to-[#92400e] border border-[rgba(217,119,6,0.5)] !text-[#fde68a] shadow-[0_4px_12px_rgba(146,64,14,0.3)]",
  "badge-calendar-event":   "!bg-gradient-to-br !from-[#14532d] !to-[#15803d] border border-[rgba(21,128,61,0.5)] !text-[#bbf7d0] shadow-[0_4px_12px_rgba(21,128,61,0.3)]",
  "badge-birthday":         "!bg-gradient-to-br !from-[#4a1942] !to-[#7c3aed] border border-[rgba(124,58,237,0.4)] !text-[#e9d5ff] shadow-[0_4px_12px_rgba(124,58,237,0.25)]",
  "badge-copa-brasil":      "!bg-gradient-to-br !from-[#1a4a1a] !to-[#14532d] border border-[rgba(234,179,8,0.6)] !text-[#fef08a] shadow-[0_4px_14px_rgba(234,179,8,0.3)]",
};

export default function LembrettzBadge({ children, pulse, className = "" }) {
  const variant = VARIANTS[className] ?? "";
  const pulseClass = pulse ? "[animation:pulse_4s_infinite]" : "";
  return (
    <span className={[BASE, variant, pulseClass].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
