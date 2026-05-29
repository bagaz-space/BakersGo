'use client';

import { Menu } from 'lucide-react';
import { useSidebar } from './sidebar-context';

interface TopBarProps {
  title: string;
  description?: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, description, onMenuClick }: TopBarProps) {
  const { toggle } = useSidebar();

  return (
    <header className="flex items-center gap-4 border-b border-border bg-background px-6 py-4">
      <button
        onClick={onMenuClick ?? toggle}
        className="md:hidden text-muted-foreground hover:text-foreground"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </header>
  );
}
