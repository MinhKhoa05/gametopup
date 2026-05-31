import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export function OrderStatusBadge({ status }: { status: number }) {
  switch (status) {
    case 0:
      return (
        <span className="pill !border-yellow-500/30 !bg-yellow-500/10 !text-yellow-400 flex items-center justify-center gap-1 w-fit ml-auto">
          <Clock size={14} /> Chờ xử lý
        </span>
      );
    case 1:
      return (
        <span className="pill !border-green-500/30 !bg-green-500/10 !text-green-400 flex items-center justify-center gap-1 w-fit ml-auto">
          <CheckCircle2 size={14} /> Hoàn thành
        </span>
      );
    case 2:
      return (
        <span className="pill !border-red-500/30 !bg-red-500/10 !text-red-400 flex items-center justify-center gap-1 w-fit ml-auto">
          <XCircle size={14} /> Đã hủy
        </span>
      );
    default:
      return <span className="pill flex items-center justify-center gap-1 w-fit ml-auto">{status}</span>;
  }
}
