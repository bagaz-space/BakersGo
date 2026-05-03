'use client';

import { Menu } from 'lucide-react';

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-background px-6 py-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-muted-foreground hover:text-foreground"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
    </header>
  );
}
