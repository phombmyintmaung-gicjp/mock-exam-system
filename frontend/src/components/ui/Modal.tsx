import type { ReactNode } from 'react';
import { XIcon } from '@/components/ui/Icons';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

const Modal = ({ isOpen, title, children, onClose, wide = false }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`glass-card relative w-full rounded-2xl p-6 shadow-2xl shadow-black/20 dark:shadow-black/50 ${wide ? 'max-w-4xl' : 'max-w-lg'}`}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-1.5 text-slate-400 dark:text-white/40 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white/80 group"
          >
            <XIcon className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
          </button>
        </div>
        <div className="text-sm text-slate-700 dark:text-white/80">{children}</div>
      </div>
    </div>
  );
};

export { Modal };
