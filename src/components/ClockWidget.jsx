import React, { useState, useEffect } from "react";
import { Clock3 } from "lucide-react";

export function ClockWidget() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = {
      timeZone: "America/Recife",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat("pt-BR", options);
    const parts = formatter.formatToParts(date);

    const day = parts.find((part) => part.type === "day").value;
    const month = parts.find((part) => part.type === "month").value;
    const year = parts.find((part) => part.type === "year").value;
    const hour = parts.find((part) => part.type === "hour").value;
    const minute = parts.find((part) => part.type === "minute").value;
    const second = parts.find((part) => part.type === "second").value;

    return {
      date: `${day}/${month}/${year}`,
      time: `${hour}:${minute}:${second}`,
    };
  };

  const formatWeekday = (date) => {
    return date.toLocaleDateString("pt-BR", {
      timeZone: "America/Recife",
      weekday: "long",
    });
  };

  const { date, time } = formatDateTime(currentDateTime);
  const weekday = formatWeekday(currentDateTime);

  return (
    <div className="rounded-2xl grow bg-bg-widget p-[1.2rem] shadow-[0_0_30px_rgba(0,0,0,0.4)]">
      <header className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <Clock3 size={22} className="text-purple-accent shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[1.26rem] font-bold text-white leading-none tracking-tight [filter:drop-shadow(0_0_6px_rgba(179,136,255,0.6))] capitalize">{weekday}</span>
            <span className="text-[0.84rem] text-text-soft opacity-60 font-medium tracking-wide leading-none">{date}</span>
          </div>
        </div>
      </header>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-[1.1rem] font-semibold text-text-soft tracking-[0.5px]">
          {date}
        </div>

        <div className="text-[1.8rem] font-semibold text-white font-mono tracking-[2px] [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">
          {time}
        </div>

        <div className="text-[0.7rem] text-[#888] mt-2">
          UTC-3
        </div>
      </div>
    </div>
  );
}
