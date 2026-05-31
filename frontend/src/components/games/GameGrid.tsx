import { Game } from '../../types';
import { pickImage } from '../../lib/ui';

export function GameGrid({ games, onPick }: { games: Game[]; onPick: (game: Game) => void }) {
  return (
    <div className="game-grid">
      {games.map((game) => (
        <button type="button" key={game.id} onClick={() => onPick(game)} className="game-tile">
          <img src={pickImage(game)} alt={game.name} />
          <span>{game.name}</span>
          <small>{game.isActive ? 'Đang bán' : 'Tạm ẩn'}</small>
        </button>
      ))}
    </div>
  );
}
