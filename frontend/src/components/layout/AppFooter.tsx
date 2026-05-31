import { Gamepad2, ShieldCheck, Headset, Zap } from 'lucide-react';
import { Route } from '../../lib/routes';

export function AppFooter({ navigate }: { navigate: (route: Route) => void }) {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#0d1f36]/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyanline/20 text-cyanline">
              <Gamepad2 size={24} />
            </span>
            <div>
              <strong className="block text-white text-lg">GameTopUp</strong>
              <span className="text-sm text-cyanline font-bold">ĐẠI LÝ NẠP GAME TRUNG GIAN</span>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-400 max-w-sm">
            Dịch vụ nạp game trung gian an toàn và tiết kiệm. Chúng tôi mang đến giải pháp tối ưu chi phí nạp với mức giá tốt nhất, đi kèm sự hỗ trợ tận tâm và uy tín.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-white mb-4">Dịch vụ</h3>
          <div className="flex flex-col gap-3">
            <button type="button" className="text-left text-sm text-slate-400 hover:text-cyanline transition-colors" onClick={() => navigate({ name: 'games' })}>Kho game</button>
            <button type="button" className="text-left text-sm text-slate-400 hover:text-cyanline transition-colors" onClick={() => navigate({ name: 'wallet' })}>Nạp ví VietQR</button>
            <button type="button" className="text-left text-sm text-slate-400 hover:text-cyanline transition-colors" onClick={() => navigate({ name: 'orders' })}>Tra cứu đơn hàng</button>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white mb-4">Hỗ trợ</h3>
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-sm text-slate-400"><ShieldCheck size={16} className="text-cyanline" /> Bảo mật 100%</p>
            <p className="flex items-center gap-2 text-sm text-slate-400"><Zap size={16} className="text-cyanline" /> Xử lý tức thì</p>
            <p className="flex items-center gap-2 text-sm text-slate-400"><Headset size={16} className="text-cyanline" /> Hỗ trợ 24/7</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center">
        <p className="text-sm text-slate-500">© 2026 GameTopUp. All rights reserved.</p>
      </div>
    </footer>
  );
}
