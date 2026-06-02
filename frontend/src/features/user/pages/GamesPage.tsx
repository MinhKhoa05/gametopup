import { Search, ChevronRight } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';
import { Route } from '../../../lib/routes';
import { Game } from '../../../types';
import { pickImage } from '../../../lib/ui';

export function GamesPage({
  games,
  loading,
  query,
  setQuery,
  navigate,
}: {
  games: Game[];
  loading: boolean;
  query: string;
  setQuery: (query: string) => void;
  navigate: (route: Route) => void;
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-4">Kho Game</h1>
        <div className="search-box max-w-xl">
          <Search size={20} className="text-cyanline" />
          <input 
            value={query} 
            onChange={(event) => setQuery(event.target.value)} 
            placeholder="Tìm game (VD: Free Fire, Liên Quân)..." 
            aria-label="Tìm game" 
          />
        </div>
      </div>
      
      <div className="product-grid">
        {games.map(game => {
          const maxDiscount = 12 + (game.name.length % 10);
          return (
            <button key={game.id} className="product-card" onClick={() => navigate({name: 'games', gameId: game.id})}>
              <div className="product-image">
                <img src={pickImage(game)} alt={game.name} />
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg shadow-red-500/20">CK {maxDiscount}%</div>
                {!game.isActive && <div className="absolute top-10 right-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">Tạm Ẩn</div>}
              </div>
              <div className="product-info">
                <h3 className="product-title">{game.name}</h3>
                <span className="product-meta">Nạp nhanh bằng ID</span>
                <div className="mt-4 flex justify-between items-center w-full">
                  <span className="text-cyanline font-bold text-sm">Nạp game</span>
                  <div className="w-8 h-8 rounded-full bg-cyanline/10 text-cyanline flex items-center justify-center">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {!loading && games.length === 0 && (
        <EmptyState className="mt-8">Không tìm thấy game nào phù hợp với từ khóa "{query}".</EmptyState>
      )}
    </div>
  );
}
