import { useState } from 'react';
import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface PageShellProps {
  children: ReactNode;
}

const PageShell = ({ children }: PageShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-app overflow-hidden">
      {/* Decorative background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-96 w-96 rounded-full bg-amber-400/18 blur-3xl dark:bg-amber-500/12" />
        <div className="absolute top-1/3 -right-48 h-80 w-80 rounded-full bg-orange-400/15 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -bottom-48 left-1/3 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl dark:bg-amber-600/10" />
      </div>
      <Navbar onMenuToggle={() => setIsSidebarOpen((v) => !v)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="relative pt-16 lg:ml-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export { PageShell };
