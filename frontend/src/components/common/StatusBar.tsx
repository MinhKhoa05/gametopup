import { Clock3, RefreshCw, Sparkles } from 'lucide-react';
import { classNames } from '../../lib/ui';

export function StatusBar({ loading, message, error }: { loading: boolean; message: string | null; error: string | null }) {
  if (!loading && !message && !error) return null;

  return (
    <div className={classNames('status-bar mb-5', error && 'status-error', message && 'status-success')}>
      {loading && <RefreshCw className="animate-spin" size={16} />}
      {!loading && error && <Clock3 size={16} />}
      {!loading && message && <Sparkles size={16} />}
      <span>{loading ? 'Đang đồng bộ dữ liệu...' : error || message}</span>
    </div>
  );
}
