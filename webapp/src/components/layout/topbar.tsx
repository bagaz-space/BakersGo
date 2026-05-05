'use client';

import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UserProfile } from '@bakersgo/types';

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export function TopBar({ title, onMenuClick }: TopBarProps) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => null);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user.brandName}</p>
            <p className="text-xs text-muted-foreground">@{user.userId}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#A0813A] text-white text-sm font-semibold">
            {user.brandName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}
