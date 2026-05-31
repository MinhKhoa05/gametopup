import { formatCurrency } from '../../lib/format';
import { classNames, pickImage } from '../../lib/ui';
import { GamePackage } from '../../types';

export function PackageGrid({
  packages,
  selectedPackageId,
  onPick,
}: {
  packages: GamePackage[];
  selectedPackageId: number | null;
  onPick: (id: number) => void;
}) {
  return (
    <div className="package-grid">
      {packages.map((item) => {
        const discount = item.originalPrice > 0 ? Math.round(100 - (item.salePrice / item.originalPrice) * 100) : 0;

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onPick(item.id)}
            className={classNames('package-tile', selectedPackageId === item.id && 'package-tile-active')}
          >
            <div className="package-image">
              <img src={pickImage(item)} alt={item.name} />
              {discount > 0 && <span>-{discount}%</span>}
            </div>
            <strong>{item.name}</strong>
            <div className="price-line">
              <span>{formatCurrency(item.salePrice)}</span>
              <del>{formatCurrency(item.originalPrice)}</del>
            </div>
            <small>Còn {item.stockQuantity} suất</small>
          </button>
        );
      })}
    </div>
  );
}
