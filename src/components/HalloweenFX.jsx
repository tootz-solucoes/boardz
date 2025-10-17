import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function HalloweenFX() {
  const [showScare, setShowScare] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(false);
  const reduceMotionRef = useRef(false);
  const showTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);

  const decorations = useMemo(
    () => [
      { id: "bat-1", emoji: "🦇", top: "12%", duration: 18 },
      { id: "bat-2", emoji: "🦇", top: "28%", duration: 24 },
      { id: "bat-3", emoji: "🦇", top: "52%", duration: 21 },
      { id: "pumpkin", emoji: "🎃", top: "82%", duration: 16 },
      { id: "ghost", emoji: "👻", top: "65%", duration: 26 },
    ],
    []
  );

  const clearTimers = useCallback(() => {
    if (showTimeoutRef.current) window.clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
  }, []);

  // const scheduleNextScare = useCallback(
  //   (customDelay) => {
  //     if (typeof window === "undefined") return;

  //     clearTimers();

  //     const [min, max] = reduceMotionRef.current
  //       ? [180000, 300000]
  //       : [60000, 120000];
  //     const delay = customDelay ?? getRandomBetween(min, max);

  //     showTimeoutRef.current = window.setTimeout(() => {
  //       const message =
  //         SPOOKY_MESSAGES[getRandomBetween(0, SPOOKY_MESSAGES.length - 1)];
  //       setScareMessage(message);
  //       setShowScare(true);
  //     }, delay);
  //   },
  //   [clearTimers]
  // );

  const stopAudio = useCallback(() => {
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        /* ignore */
      }
      audioContextRef.current = null;
    }
  }, []);

  const playScream = useCallback(() => {
    if (typeof window === "undefined" || reduceMotionRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      audioContextRef.current = context;

      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.exponentialRampToValueAtTime(30, now + 1.8);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.5, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(now);
      oscillator.stop(now + 2.4);

      oscillator.addEventListener("ended", stopAudio, { once: true });
    } catch {
      /* ignore audio errors */
    }
  }, [stopAudio]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const slowUpdateQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(update: slow)")
        : { matches: false };
    const coarsePointerQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: coarse)")
        : { matches: false };

    const evaluatePerformanceMode = () => {
      const prefersReducedMotion = reduceMotionQuery.matches;
      reduceMotionRef.current = prefersReducedMotion;

      if (prefersReducedMotion) {
        clearTimers();
        setShowScare(false);
      }

      const lowRam =
        typeof navigator !== "undefined" && navigator.deviceMemory
          ? navigator.deviceMemory <= 2
          : false;
      const lowCpu =
        typeof navigator !== "undefined" && navigator.hardwareConcurrency
          ? navigator.hardwareConcurrency <= 4
          : false;

      const shouldUsePerformanceMode =
        prefersReducedMotion ||
        slowUpdateQuery.matches ||
        (coarsePointerQuery.matches && (lowRam || lowCpu));

      setPerformanceMode(shouldUsePerformanceMode);
    };

    evaluatePerformanceMode();

    const subscribe = (query, handler) => {
      if (!query || typeof query.addEventListener !== "function") {
        if (query && typeof query.addListener === "function") {
          query.addListener(handler);
        }
        return () => {
          if (query && typeof query.removeListener === "function") {
            query.removeListener(handler);
          }
        };
      }

      query.addEventListener("change", handler);
      return () => query.removeEventListener("change", handler);
    };

    const unsubscribes = [
      subscribe(reduceMotionQuery, evaluatePerformanceMode),
      subscribe(slowUpdateQuery, evaluatePerformanceMode),
      subscribe(coarsePointerQuery, evaluatePerformanceMode),
    ];

    return () => {
      unsubscribes.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") unsubscribe();
      });
      clearTimers();
      stopAudio();
    };
  }, [clearTimers, stopAudio]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    if (performanceMode) {
      document.documentElement.setAttribute("data-low-fx", "");
    } else {
      document.documentElement.removeAttribute("data-low-fx");
    }

    return () => {
      document.documentElement.removeAttribute("data-low-fx");
    };
  }, [performanceMode]);

  useEffect(() => {
    if (!showScare) return undefined;

    playScream();

    hideTimeoutRef.current = window.setTimeout(() => {
      setShowScare(false);
    }, 3800);

    return () => {
      if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
    };
  }, [playScream, showScare]);

  const shouldAnimate = !performanceMode && !reduceMotionRef.current;

  return (
    <div
      className={`halloween-overlay${performanceMode ? " halloween-overlay--low" : ""}`}
      aria-hidden="true"
    >
      <div
        className="halloween-fog"
        data-animate={shouldAnimate ? "true" : "false"}
      />
      {decorations.map((item, index) => (
        <span
          key={item.id}
          className={`floating-token ${item.id}`}
          style={{
            top: item.top,
            animationDuration: shouldAnimate ? `${item.duration}s` : undefined,
            animationDelay: shouldAnimate ? `${index * 3}s` : undefined,
            left: `${10 + index * 18}%`,
          }}
          data-animate={shouldAnimate ? "true" : "false"}
        >
          {item.emoji}
        </span>
      ))}
      <span className="candle candle-left" />
      <span className="candle candle-right" />
    </div>
  );
}
