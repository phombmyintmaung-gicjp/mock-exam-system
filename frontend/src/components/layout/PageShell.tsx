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
    <div className="min-h-screen bg-slate-50 bg-dot-pattern">
      <Navbar onMenuToggle={() => setIsSidebarOpen((v) => !v)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16 lg:ml-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export { PageShell };
