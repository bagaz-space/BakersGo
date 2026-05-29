'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Home,
  FlaskConical,
  BookOpen,
  Calculator,
  TrendingDown,
  ShoppingBag,
  BarChart3,
  User,
  LogOut,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './sidebar-context';
import type { UserProfile } from '@bakersgo/types';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Beranda', icon: Home },
  { href: '/dashboard/master-bahan', label: 'Master Bahan', icon: FlaskConical },
  { href: '/dashboard/master-resep', label: 'Master Resep', icon: BookOpen },
  { href: '/dashboard/hpp', label: 'HPP', icon: Calculator },
  { href: '/dashboard/pengeluaran', label: 'Pengeluaran', icon: TrendingDown },
  { href: '/dashboard/penjualan', label: 'Penjualan', icon: ShoppingBag },
  { href: '/dashboard/laporan', label: 'Laporan', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebar();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => null);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  async function handleLogout() {
    setDropdownOpen(false);
    close();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-60 flex-col bg-card border-r border-border transition-transform duration-200',
          'md:relative md:z-auto md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-semibold text-foreground text-lg tracking-tight">
            BakersGo
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {user && (
          <div className="px-3 py-3 border-t border-border" ref={dropdownRef}>
            {/* Dropdown — opens upward */}
            {dropdownOpen && (
              <div className="mb-2 rounded-2xl border border-border bg-background shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{user.brandName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.userId}</p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => { setDropdownOpen(false); close(); }}
                    className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <User size={15} className="text-muted-foreground" />
                    Profil Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Keluar
                  </button>
                </div>
              </div>
            )}

            {/* Trigger button */}
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
              aria-label="Menu pengguna"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A0813A] text-white text-sm font-semibold">
                {user.brandName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.brandName}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.userId}</p>
              </div>
              <ChevronUp
                size={14}
                className={cn(
                  'text-muted-foreground shrink-0 transition-transform duration-200',
                  dropdownOpen ? 'rotate-0' : 'rotate-180',
                )}
              />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
