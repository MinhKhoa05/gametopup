import { FormEvent } from 'react';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import { GamePackage, User } from '../../types';
import { Field } from '../common/Field';
import { SectionHeading } from '../common/SectionHeading';

export function OrderPanel({
  user,
  selectedPackage,
  quantity,
  setQuantity,
  gameAccountInfo,
  setGameAccountInfo,
  total,
  busy,
  onSubmit,
}: {
  user: User | null;
  selectedPackage: GamePackage | null;
  quantity: number;
  setQuantity: (quantity: number) => void;
  gameAccountInfo: string;
  setGameAccountInfo: (value: string) => void;
  total: number;
  busy: boolean;
  onSubmit: (event: FormEvent) => void;
  }) {
  return (
    <div className="checkout-panel">
      <SectionHeading>
        <div className="section-heading__copy">
          <p className="eyebrow section-heading__eyebrow">Đặt đơn</p>
          <h2 className="section-heading__title">Thông tin nạp</h2>
        </div>
      </SectionHeading>
      <form className="mt-4 grid gap-4 md:grid-cols-[1fr_140px]" onSubmit={onSubmit}>
        <Field
          label="UID / Server / Ghi chú tài khoản"
          value={gameAccountInfo}
          onChange={setGameAccountInfo}
          placeholder="VD: UID 998877, server VN, tên nhân vật..."
        />
        <Field
          label="Số lượng"
          value={String(quantity)}
          onChange={(value) => setQuantity(Math.max(1, Number(value) || 1))}
          type="number"
          placeholder="1"
        />
        <div className="summary-strip md:col-span-2">
          <div>
            <span>Gói đã chọn</span>
            <strong>{selectedPackage?.name ?? 'Chưa chọn gói'}</strong>
          </div>
          <div>
            <span>Tạm tính</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <button className="primary-button" type="submit" disabled={!user || !selectedPackage || !gameAccountInfo.trim() || busy}>
            <ShoppingCart size={18} />
            Đặt gói
          </button>
        </div>
      </form>
    </div>
  );
}
