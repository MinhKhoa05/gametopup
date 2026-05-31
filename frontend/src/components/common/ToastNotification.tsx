import { CSSProperties, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

const successDurationMs = 3200;
const errorDurationMs = 4500;

export function ToastNotification({
  loading,
  message,
  error,
}: {
  loading: boolean;
  message: string | null;
  error: string | null;
}) {
  const type = loading ? 'loading' : error ? 'error' : 'success';
  const text = loading ? 'Đang xử lý yêu cầu...' : error || message;
  const duration = type === 'error' ? errorDurationMs : successDurationMs;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!text) {
      setVisible(false);
      return;
    }

    setVisible(true);
    if (loading) return;

    const timeout = window.setTimeout(() => setVisible(false), duration);

    return () => window.clearTimeout(timeout);
  }, [duration, loading, text, type]);

  if (!text || !visible) return null;

  return (
    <div
      className={`toast-notification ${type}`}
      role="status"
      aria-live="polite"
      style={{ '--toast-duration': `${duration}ms` } as CSSProperties}
    >
      <div className="toast-icon">
        {type === 'loading' && <Loader2 className="animate-spin" size={20} />}
        {type === 'success' && <CheckCircle2 size={20} />}
        {type === 'error' && <AlertCircle size={20} />}
      </div>
      <div className="toast-content">
        <strong>{type === 'loading' ? 'Đang xử lý' : type === 'success' ? 'Thành công' : 'Có lỗi xảy ra'}</strong>
        <span>{text}</span>
      </div>
      <button type="button" aria-label="Đóng thông báo" onClick={() => setVisible(false)}>
        <X size={16} />
      </button>
      <div className="toast-progress" />
    </div>
  );
}
