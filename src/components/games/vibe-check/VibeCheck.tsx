import { useCallback, useEffect, useRef, useState } from "react";
import { ALL_COLORS, COLOR_HEX, type Color, type FlashEvent, type GameSummary } from "./types";

const TOTAL_FLASHES = 18;
const FLASH_VISIBLE_MS = 800;
const MIN_GAP_MS = 300;
const MAX_GAP_MS = 600;
const TARGET_RATIO = 0.4; // ~40% of flashes are the target color

function pickTargetColor(): Color {
  return ALL_COLORS[Math.floor(Math.random() * ALL_COLORS.length)];
}

function buildSequence(target: Color): Color[] {
  const sequence: Color[] = [];
  for (let i = 0; i < TOTAL_FLASHES; i++) {
    const isTarget = Math.random() < TARGET_RATIO;
    if (isTarget) {
      sequence.push(target);
    } else {
      const decoys = ALL_COLORS.filter((c) => c !== target);
      sequence.push(decoys[Math.floor(Math.random() * decoys.length)]);
    }
  }
  return sequence;
}

function buildSummary(events: FlashEvent[]): GameSummary {
  const hits = events.filter((e) => e.result === "hit").length;
  const misses = events.filter((e) => e.result === "miss").length;
  const falseClicks = events.filter((e) => e.result === "false_click").length;
  const correctIgnores = events.filter((e) => e.result === "correct_ignore").length;
  const targetFlashes = hits + misses;

  const reactionTimes = events
    .filter((e) => e.result === "hit" && e.clickedAt !== null)
    .map((e) => (e.clickedAt as number) - e.shownAt);
  const avgReactionTimeMs =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : null;

  const totalDecisions = targetFlashes + falseClicks + correctIgnores;
  const correctDecisions = hits + correctIgnores;
  const accuracyPercent =
    totalDecisions > 0 ? Math.round((correctDecisions / totalDecisions) * 100) : 0;

  let label = "Steady but careful";
  if (falseClicks >= 4) label = "Trigger happy";
  else if (accuracyPercent >= 90 && avgReactionTimeMs !== null && avgReactionTimeMs < 450)
    label = "Lightning reflexes";
  else if (misses >= 4) label = "Daydreamer";

  return {
    totalFlashes: events.length,
    targetFlashes,
    hits,
    misses,
    falseClicks,
    correctIgnores,
    avgReactionTimeMs,
    accuracyPercent,
    label,
  };
}

type Phase = "idle" | "countdown" | "playing" | "done";

export default function VibeCheck() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [target, setTarget] = useState<Color | null>(null);
  const [sequence, setSequence] = useState<Color[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentColor, setCurrentColor] = useState<Color | null>(null);
  const [events, setEvents] = useState<FlashEvent[]>([]);
  const [summary, setSummary] = useState<GameSummary | null>(null);

  const currentEventRef = useRef<FlashEvent | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const startGame = () => {
    const t = pickTargetColor();
    const seq = buildSequence(t);
    setTarget(t);
    setSequence(seq);
    setEvents([]);
    setCurrentIndex(-1);
    setCurrentColor(null);
    setSummary(null);
    setPhase("playing");
  };

  const finalizeCurrentEvent = useCallback(
    (result: FlashEvent["result"], clickedAt: number | null) => {
      const ev = currentEventRef.current;
      if (!ev || ev.result !== "pending") return;
      const updated: FlashEvent = { ...ev, result, clickedAt };
      currentEventRef.current = updated;
      setEvents((prev) => {
        const next = [...prev];
        next[next.length - 1] = updated;
        return next;
      });
    },
    []
  );

  const advance = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= sequence.length) {
        setPhase("done");
        return prevIndex;
      }
      const color = sequence[nextIndex];
      const isTarget = color === target;
      const shownAt = performance.now();
      const newEvent: FlashEvent = {
        color,
        isTarget,
        shownAt,
        clickedAt: null,
        result: "pending",
      };
      currentEventRef.current = newEvent;
      setEvents((prev) => [...prev, newEvent]);
      setCurrentColor(color);

      timeoutRef.current = setTimeout(() => {
        finalizeCurrentEvent(isTarget ? "miss" : "correct_ignore", null);
        setCurrentColor(null);
        const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
        timeoutRef.current = setTimeout(advance, gap);
      }, FLASH_VISIBLE_MS);

      return nextIndex;
    });
  }, [sequence, target, finalizeCurrentEvent]);

  useEffect(() => {
    if (phase === "playing" && currentIndex === -1 && sequence.length > 0) {
      advance();
    }
    return clearTimer;
  }, [phase, sequence, currentIndex, advance]);

  useEffect(() => {
    if (phase === "done") {
      clearTimer();
      const finalEvents = events.map((e) =>
        e.result === "pending" ? { ...e, result: e.isTarget ? "miss" : "correct_ignore" } as FlashEvent : e
      );
      setSummary(buildSummary(finalEvents));
    }
  }, [phase, events]);

  const handleScreenClick = () => {
    if (phase !== "playing" || !currentColor) return;
    const ev = currentEventRef.current;
    if (!ev || ev.result !== "pending") return;
    const clickedAt = performance.now();
    finalizeCurrentEvent(ev.isTarget ? "hit" : "false_click", clickedAt);
  };

  if (phase === "idle") {
    return (
      <div style={styles.wrap}>
        <h1>Vibe Check</h1>
        <p style={{ color: "#888", marginBottom: 20 }}>
          A color will be your target. Click only when it flashes, ignore the rest.
        </p>
        <button style={styles.startBtn} onClick={startGame}>
          Start
        </button>
      </div>
    );
  }

  if (phase === "done" && summary) {
    return (
      <div style={styles.wrap}>
        <h1>{summary.label}</h1>
        <div style={styles.statsGrid}>
          <Stat label="Accuracy" value={`${summary.accuracyPercent}%`} />
          <Stat
            label="Avg reaction"
            value={summary.avgReactionTimeMs !== null ? `${summary.avgReactionTimeMs} ms` : "—"}
          />
          <Stat label="Hits" value={`${summary.hits}/${summary.targetFlashes}`} />
          <Stat label="False clicks" value={`${summary.falseClicks}`} />
        </div>
        <button style={styles.startBtn} onClick={startGame}>
          Play again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      {target && (
        <div style={styles.targetBanner}>
          Click only on <strong style={{ color: COLOR_HEX[target] }}>{target}</strong>
        </div>
      )}
      <div style={styles.playArea} onClick={handleScreenClick}>
        {currentColor && (
          <div
            style={{
              ...styles.flashCircle,
              backgroundColor: COLOR_HEX[currentColor],
            }}
          />
        )}
      </div>
      <p style={{ color: "#666", fontSize: 13 }}>
        {currentIndex + 1} / {sequence.length}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.statCard}>
      <div style={{ color: "#888", fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    maxWidth: 480,
    margin: "0 auto",
    padding: 24,
    textAlign: "center",
  },
  startBtn: {
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 16,
  },
  targetBanner: {
    marginBottom: 16,
    fontSize: 16,
  },
  playArea: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
  },
  flashCircle: {
    width: 120,
    height: 120,
    borderRadius: "50%",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    margin: "20px 0",
  },
  statCard: {
    background: "#f4f4f5",
    borderRadius: 10,
    padding: 14,
  },
};