import { useEffect, useState } from "react";
import { type GameState, type BlankState } from "./types";
import { fetchGeneratedPuzzle } from "./api";
import {
  createBlanks,
  checkBlank,
  revealHintLetter,
  getHintPrefix,
  isPuzzleSolved,
  getDisplayWord,
} from "./engine";

function createLoadingState(): GameState {
  return {
    puzzle: null,
    blanks: [],
    attempts: 0,
    hintsUsed: 0,
    isSolved: false,
    isLoading: true,
    error: null,
  };
}

export default function ChainReaction() {
  const [state, setState] = useState<GameState>(createLoadingState);

  const loadNewPuzzle = async () => {
    setState(createLoadingState());
    try {
      const puzzle = await fetchGeneratedPuzzle();
      setState({
        puzzle,
        blanks: createBlanks(puzzle),
        attempts: 0,
        hintsUsed: 0,
        isSolved: false,
        isLoading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Couldn't load a puzzle. Try again.",
      }));
    }
  };

  useEffect(() => {
    loadNewPuzzle();
  }, []);

  const { puzzle, blanks } = state;

  const updateBlank = (index: number, updater: (b: BlankState) => BlankState) => {
    setState((prev) => ({
      ...prev,
      blanks: prev.blanks.map((b) => (b.index === index ? updater(b) : b)),
    }));
  };

  const handleInputChange = (index: number, value: string) => {
    updateBlank(index, (b) => ({ ...b, value, status: "empty" }));
  };

  const handleCheckAll = () => {
    if (!puzzle) return;
    setState((prev) => {
      const checked = prev.blanks.map((b) => checkBlank(puzzle, b));
      const solved = isPuzzleSolved(checked);
      return {
        ...prev,
        blanks: checked,
        attempts: prev.attempts + 1,
        isSolved: solved,
      };
    });
  };

  const handleHint = (index: number) => {
    if (!puzzle) return;
    updateBlank(index, (b) => revealHintLetter(puzzle, b));
    setState((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
  };

  if (state.isLoading) {
    return (
      <div style={styles.wrap}>
        <h1>Chain Reaction</h1>
        <p style={{ color: "#888" }}>Generating a fresh puzzle...</p>
      </div>
    );
  }

  if (state.error || !puzzle) {
    return (
      <div style={styles.wrap}>
        <h1>Chain Reaction</h1>
        <p style={{ color: "#ef4444", marginBottom: 16 }}>{state.error}</p>
        <button style={styles.checkBtn} onClick={loadNewPuzzle}>
          Try again
        </button>
      </div>
    );
  }

  const chainLength = puzzle.chain.length;

  return (
    <div style={styles.wrap}>
      <h1 style={{ marginBottom: 4 }}>Chain Reaction</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Fill each blank so it forms a word with both its neighbors.
      </p>

      <div style={styles.chainRow}>
        {puzzle.chain.map((_, index) => {
          const isEndpoint = index === 0 || index === chainLength - 1;
          if (isEndpoint) {
            return (
              <div key={index} style={styles.lockedBox}>
                {getDisplayWord(puzzle, index)}
              </div>
            );
          }

          const blank = blanks.find((b) => b.index === index) as BlankState;
          const hintPrefix = getHintPrefix(puzzle, blank);

          return (
            <div key={index} style={styles.blankColumn}>
              <input
                style={{
                  ...styles.blankBox,
                  ...(blank.status === "correct" ? styles.correctBox : {}),
                  ...(blank.status === "incorrect" ? styles.incorrectBox : {}),
                }}
                value={blank.value}
                placeholder={hintPrefix || "?"}
                onChange={(e) => handleInputChange(index, e.target.value)}
                disabled={blank.status === "correct"}
              />
              {blank.status !== "correct" && (
                <button style={styles.hintBtn} onClick={() => handleHint(index)}>
                  Hint
                </button>
              )}
            </div>
          );
        })}
      </div>

      {state.isSolved ? (
        <div style={styles.solvedBanner}>
          Solved in {state.attempts} {state.attempts === 1 ? "try" : "tries"}
          {state.hintsUsed > 0 ? ` with ${state.hintsUsed} hint(s)` : ""}.
        </div>
      ) : (
        <button style={styles.checkBtn} onClick={handleCheckAll}>
          Check answers
        </button>
      )}

      <button style={styles.newPuzzleBtn} onClick={loadNewPuzzle}>
        New puzzle
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    maxWidth: 560,
    margin: "0 auto",
    padding: 24,
    textAlign: "center",
  },
  chainRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 24,
  },
  lockedBox: {
    padding: "14px 16px",
    borderRadius: 8,
    background: "#111",
    color: "white",
    fontWeight: 700,
    textTransform: "uppercase",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    height: 48,
    boxSizing: "border-box",
  },
  blankColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  blankBox: {
    width: 110,
    height: 48,
    borderRadius: 8,
    border: "2px solid #ccc",
    textAlign: "center",
    fontSize: 14,
    textTransform: "lowercase",
    boxSizing: "border-box",
  },
  correctBox: {
    borderColor: "#22c55e",
    background: "#f0fdf4",
  },
  incorrectBox: {
    borderColor: "#ef4444",
    background: "#fef2f2",
  },
  hintBtn: {
    fontSize: 11,
    color: "#888",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  checkBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
    marginRight: 10,
  },
  newPuzzleBtn: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
    fontSize: 15,
  },
  solvedBanner: {
    padding: "12px 16px",
    borderRadius: 8,
    background: "#f0fdf4",
    color: "#166534",
    fontWeight: 600,
    marginBottom: 12,
  },
};