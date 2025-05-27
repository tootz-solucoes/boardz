import React, { useRef } from "react";
import doTheLSound from "/assets/sound.mp3";
import endSound from "/assets/end.ogg";

export default function Efeittz() {
  const soundLRef = useRef(null);
  const soundEndRef = useRef(null);

  const playSoundById = (id) => {
    if (id === "sound-l" && soundLRef.current) {
      soundLRef.current.currentTime = 0;
      soundLRef.current.play();
    }
    if (id === "sound-end" && soundEndRef.current) {
      soundEndRef.current.currentTime = 0;
      soundEndRef.current.play();
    }
  };

  return (
    <div className="widget">
      <header>
        <h2>🔊 efeittz.</h2>
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        <button onClick={() => playSoundById("sound-l")} className="btn">
          Faz o 🇱
        </button>
        <audio
          id="sound-l"
          ref={soundLRef}
          src={doTheLSound}
          preload="auto"
        ></audio>

        <button onClick={() => playSoundById("sound-end")} className="btn">
          Acabou 🔚
        </button>
        <audio
          id="sound-end"
          ref={soundEndRef}
          src={endSound}
          preload="auto"
        ></audio>
      </div>
    </div>
  );
}
