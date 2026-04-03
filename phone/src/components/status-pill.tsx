type StatusPillProps = {
  label: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
};

const toneClasses: Record<StatusPillProps['tone'], string> = {
  neutral: 'bg-slate-800 text-slate-200 ring-slate-700',
  success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  danger: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

export function StatusPill({ label, tone }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
