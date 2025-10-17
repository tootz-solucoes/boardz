import React, { useState, useEffect } from "react";

export function ClockWidget() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatação para o fuso horário de Recife (UTC-3)
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
  const spookyWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return (
    <div className="widget">
      <header>
        <div>
          <h2>🕒 relógio encantado</h2>
          <span className="widget-subtitle">{spookyWeekday}</span>
        </div>
      </header>
      <div className="clock-face">
        <div className="clock-date">{date}</div>
        <div className="clock-time">{time}</div>
        <div className="clock-zone">UTC-3 • Recife</div>
      </div>
    </div>
  );
}
