import type { ReactNode } from 'react';
import { classNames } from '@/lib/ui';
import { IconBox } from '@/components/ui';

export function SidebarNavItem({
  active = false,
  icon,
  label,
  collapsed = false,
  onClick,
  secondary = false,
}: {
  active?: boolean;
  icon: ReactNode;
  collapsed?: boolean;
  label: string;
  onClick?: () => void;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={classNames(
        'group relative flex min-h-[3.4rem] w-full items-center text-left transition-[background-color,color,transform] duration-200 ease-out',
        collapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-3',
        secondary
          ? 'bg-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-100'
          : active
            ? `${collapsed ? '' : 'translate-x-[2px] '}bg-cyan/10 text-white before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-full before:bg-cyan before:content-[""]`
            : 'bg-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-100',
      )}
      onClick={onClick}
      aria-label={label}
    >
      <IconBox
        size="sm"
        className={classNames(
          'h-8 w-8 rounded-xl border-0 bg-white/[0.03] transition-[background-color,color,transform] duration-200 ease-out',
          secondary
            ? 'text-slate-400 group-hover:bg-white/[0.05] group-hover:text-cyan-50'
            : active
              ? 'bg-cyan/12 text-cyan-50'
              : 'text-slate-400 group-hover:bg-white/[0.05] group-hover:text-cyan-50',
        )}
      >
        {icon}
      </IconBox>
      {collapsed ? null : <span className="min-w-0 flex-1 text-[0.95rem] font-medium leading-tight">{label}</span>}
    </button>
  );
}
