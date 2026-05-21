interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex flex-1 items-center gap-4">
      <div className="flex-1 overflow-hidden rounded-full bg-gray-200 h-2">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-medium text-gray-600">
        {current} / {total}
      </span>
    </div>
  );
};

export { ProgressBar };
