import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';

export function OrderStatusBadge({ status }: { status: number }) {
  switch (status) {
    case 0:
      return <Badge className="w-fit ml-auto" icon={<Clock size={14} />} tone="warning">Chờ xử lý</Badge>;
    case 1:
      return <Badge className="w-fit ml-auto" icon={<CheckCircle2 size={14} />} tone="success">Hoàn thành</Badge>;
    case 2:
      return <Badge className="w-fit ml-auto" icon={<XCircle size={14} />} tone="danger">Đã hủy</Badge>;
    default:
      return <Badge className="w-fit ml-auto">{status}</Badge>;
  }
}
