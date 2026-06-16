interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="flex-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10 h-2 border border-slate-200 dark:border-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-medium text-slate-500 dark:text-white/50">
        {current} / {total}
      </span>
    </div>
  );
};

export { ProgressBar };
