import { clsx } from 'clsx';

interface ShimmerProps {
  className?: string;
}

const Shimmer = ({ className }: ShimmerProps) => (
  <div className={clsx('animate-pulse rounded bg-gray-200', className)} />
);

const TableRowSkeleton = ({ cols = 4 }: { cols?: number }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Shimmer className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

const StatCardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <Shimmer className="mb-3 h-3 w-28" />
    <Shimmer className="h-9 w-20" />
  </div>
);

const BarSkeleton = () => (
  <div>
    <div className="mb-1.5 flex items-center justify-between">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-4 w-10" />
    </div>
    <Shimmer className="h-3 w-full rounded-full" />
    <Shimmer className="mt-1 h-3 w-20" />
  </div>
);

const CardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="flex-1">
        <Shimmer className="mb-2 h-6 w-24" />
        <Shimmer className="h-4 w-48" />
      </div>
      <Shimmer className="ml-4 h-6 w-20 rounded-lg" />
    </div>
    <div className="flex gap-2">
      <Shimmer className="h-9 w-24 rounded-lg" />
      <Shimmer className="h-9 w-28 rounded-lg" />
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
    <div className="mb-6 flex items-center gap-4">
      <Shimmer className="h-16 w-16 shrink-0 rounded-full" />
      <div>
        <Shimmer className="mb-2 h-5 w-28" />
        <Shimmer className="h-4 w-52" />
      </div>
    </div>
    <div className="space-y-5">
      <div>
        <Shimmer className="mb-1 h-4 w-20" />
        <Shimmer className="mt-1 h-10 w-full rounded-lg" />
      </div>
      <div>
        <Shimmer className="mb-1 h-4 w-28" />
        <Shimmer className="mt-1 h-10 w-full rounded-lg" />
      </div>
      <div className="flex justify-end">
        <Shimmer className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>
);

const ReviewItemSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50 px-6 py-4">
      <Shimmer className="mt-0.5 h-5 w-5 shrink-0 rounded-full" />
      <div className="flex-1">
        <Shimmer className="mb-2 h-3 w-8" />
        <Shimmer className="h-4 w-full" />
      </div>
    </div>
    <div className="space-y-2 px-6 py-4">
      {[1, 2, 3, 4].map((i) => (
        <Shimmer key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
    <div className="border-t border-blue-100 bg-blue-50 px-6 py-4">
      <Shimmer className="mb-2 h-3 w-20" />
      <Shimmer className="h-4 w-3/4" />
    </div>
  </div>
);

export { Shimmer, TableRowSkeleton, StatCardSkeleton, BarSkeleton, CardSkeleton, FormSkeleton, ReviewItemSkeleton };
