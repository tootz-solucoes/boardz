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

  return (
    <div className="widget">
      <header>
        <h2>🕐 {weekday}</h2>
      </header>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#e5d7ff",
            letterSpacing: "0.5px",
          }}
        >
          {date}
        </div>

        <div
          style={{
            fontSize: "1.8rem",
            fontWeight: "600",
            color: "#fff",
            fontFamily: "monospace",
            letterSpacing: "2px",
            textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
          }}
        >
          {time}
        </div>

        <div
          style={{
            fontSize: "0.7rem",
            color: "#888",
            marginTop: "0.5rem",
          }}
        >
          UTC-3
        </div>
      </div>
    </div>
  );
}
