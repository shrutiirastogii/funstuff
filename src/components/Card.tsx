import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export interface Game {
  name: string;
  description: string;
  path: string;
  image?: string;
  disabled?: boolean;
}

interface CardProps {
  game: Game;
}

export default function Card({ game }: CardProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (game.disabled) return;
    navigate(game.path);
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(hovered && !game.disabled ? styles.containerHover : {}),
        ...(game.disabled ? styles.containerDisabled : {}),
      }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={game.disabled ? -1 : 0}
      aria-disabled={game.disabled}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
    >
      <div className="gameHeaderContainer">
        {game.image ? (
          <img src={game.image} alt={game.name} className="gameImage" />
        ) : (
          <div style={styles.imagePlaceholder} aria-hidden="true">
            🎮
          </div>
        )}
        <div>
          <h2>{game.name}</h2>
          <p>{game.description}</p>
          {game.disabled && <span style={styles.badge}>Coming soon</span>}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4)',
    width: '100%',
    boxSizing: 'border-box',
  },
  containerHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  containerDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  imagePlaceholder: {
    fontSize: '32px',
    lineHeight: '1',
  },
  badge: {
    display: 'inline-block',
    marginTop: '6px',
    padding: '2px 10px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.1)',
    color: '#aaa',
  },
};
