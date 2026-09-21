import games from '../data/games';
import Card from './Card';

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {games.map((game: (typeof games)[number]) => (
          <Card key={game.name} game={game} />
        ))}
      </div>
    </div>
  );
}