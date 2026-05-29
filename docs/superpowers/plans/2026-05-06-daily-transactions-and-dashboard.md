# Daily Transactions & Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the remaining webapp features after HPP: Pengeluaran CRUD, Penjualan CRUD, live Dashboard, and Laporan analytics — all connected to the existing backend.

**Architecture:** Next.js 14 App Router webapp consuming the existing Fastify backend. All hooks follow the `getToken() → api.get/post/put/delete` pattern established by `useIngredients.ts`. All components follow the modal+CRUD pattern from `master-bahan-table.tsx`.

**Tech Stack:** Next.js 14, TanStack Query, react-hook-form + zod, Recharts, @bakersgo/types, Tailwind CSS.

---

## Starting State (do NOT redo these)

Already done — skip these:
- `webapp/src/hooks/useExpenses.ts` — exists (untracked, ready to commit)
- `webapp/src/hooks/useSales.ts` — exists (untracked, ready to commit)
- Root `package.json` `dev` script — already present
- All backend routes (expenses, sales, reports, hpp) — fully working

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `webapp/src/hooks/useReports.ts` | Fetch `/reports/summary` with date params |
| Modify | `backend/src/routes/auth.ts` | Add `GET /auth/profile` endpoint |
| Create | `webapp/src/app/api/auth/me/route.ts` | Proxy `/auth/profile` with httpOnly cookie token |
| Modify | `webapp/src/components/layout/topbar.tsx` | Show brand name from `/api/auth/me` |
| Modify | `webapp/src/components/modules/pengeluaran-table.tsx` | Full CRUD: date filter, modal, table, total |
| Modify | `webapp/src/components/modules/penjualan-table.tsx` | Full CRUD: date filter, HPP dropdown, modal |
| Modify | `webapp/src/components/modules/dashboard-summary.tsx` | Live data + month picker + Recharts bar chart |
| Modify | `webapp/src/components/modules/laporan-view.tsx` | Date filter, cards, bar chart, combined table |

---

## Task 1: Commit Existing Hook Files

**Files:**
- Already exists: `webapp/src/hooks/useExpenses.ts`
- Already exists: `webapp/src/hooks/useSales.ts`

- [ ] **Step 1: Stage and commit the two hook files**

```bash
git add webapp/src/hooks/useExpenses.ts webapp/src/hooks/useSales.ts
git commit -m "feat(webapp): add useExpenses and useSales hooks"
```

Expected: commit succeeds, hooks are tracked.

---

## Task 2: `useReports.ts` Hook

**Files:**
- Create: `webapp/src/hooks/useReports.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// webapp/src/hooks/useReports.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ReportResponse } from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useReportSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', from, to],
    queryFn: async () => {
      const token = await getToken();
      return api.get<ReportResponse>(`/reports/summary?from=${from}&to=${to}`, token);
    },
    enabled: !!from && !!to,
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles (no errors)**

```bash
cd webapp && pnpm tsc --noEmit
```

Expected: no errors related to `useReports.ts`.

- [ ] **Step 3: Commit**

```bash
git add webapp/src/hooks/useReports.ts
git commit -m "feat(webapp): add useReports hook"
```

---

## Task 3: Backend `GET /auth/profile` + Next.js `/api/auth/me`

**Files:**
- Modify: `backend/src/routes/auth.ts` (add GET endpoint, lines after the POST /auth/login handler)
- Create: `webapp/src/app/api/auth/me/route.ts`

- [ ] **Step 1: Add `GET /auth/profile` to backend**

In `backend/src/routes/auth.ts`, add the import for `requireAuth` and `getUserId` at the top (after existing imports), then add a new route inside `authRoutes()` after the `/auth/login` handler:

```typescript
// Add to imports at top of backend/src/routes/auth.ts
import { requireAuth, getUserId } from '../middleware/auth';
```

Then add inside `export async function authRoutes(app: FastifyInstance) {` after the login handler:

```typescript
  app.get(
    '/auth/profile',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = getUserId(request);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return reply.status(404).send({ message: 'User tidak ditemukan' });
      return reply.send(toUserProfile(user));
    },
  );
```

- [ ] **Step 2: Verify backend TypeScript**

```bash
cd backend && pnpm tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Create `webapp/src/app/api/auth/me/route.ts`**

```typescript
// webapp/src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { UserProfile } from '@bakersgo/types';

export async function GET() {
  try {
    const token = await getToken();
    if (!token) return NextResponse.json(null, { status: 401 });
    const user = await api.get<UserProfile>('/auth/profile', token);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
```

- [ ] **Step 4: Verify webapp TypeScript**

```bash
cd webapp && pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/auth.ts webapp/src/app/api/auth/me/route.ts
git commit -m "feat: add GET /auth/profile backend + /api/auth/me route"
```

---

## Task 4: `topbar.tsx` — Show User Info

**Files:**
- Modify: `webapp/src/components/layout/topbar.tsx`

The topbar currently only shows a title. It needs to fetch and show `brandName` from `/api/auth/me`.

- [ ] **Step 1: Replace topbar.tsx entirely**

```typescript
// webapp/src/components/layout/topbar.tsx
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
```

- [ ] **Step 2: Verify the dashboard layout passes `title` prop**

Check `webapp/src/app/(dashboard)/layout.tsx`. The TopBar receives `title` from each page. If TopBar is rendered in the layout without a title prop, add a default. Look at how the existing pages pass the title — if they use TopBar inside the page component (not layout), no change needed.

- [ ] **Step 3: Verify TypeScript**

```bash
cd webapp && pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add webapp/src/components/layout/topbar.tsx
git commit -m "feat(webapp): show user brandName and userId in topbar"
```

---

## Task 5: `pengeluaran-table.tsx` — Full CRUD

**Files:**
- Modify: `webapp/src/components/modules/pengeluaran-table.tsx`

Pattern: identical to `master-bahan-table.tsx` — modal, delete confirm, table rows, date range filter above table, total at bottom.

- [ ] **Step 1: Replace pengeluaran-table.tsx entirely**

```typescript
// webapp/src/components/modules/pengeluaran-table.tsx
'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/hooks/useExpenses';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Expense, ExpenseCategory } from '@bakersgo/types';

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  OPERASIONAL: 'Operasional',
  LISTRIK: 'Listrik',
  GAJI: 'Gaji',
  LAINNYA: 'Lainnya',
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ExpenseCategory[];

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = now.toISOString().split('T')[0];
  return { from, to };
}

const schema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  category: z.enum(['BAHAN_BAKU', 'OPERASIONAL', 'LISTRIK', 'GAJI', 'LAINNYA']),
  description: z.string().min(1, 'Keterangan wajib diisi'),
  amount: z.coerce.number().positive('Jumlah harus > 0'),
});
type FormValues = z.infer<typeof schema>;

const fieldCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors';

function ExpenseModal({
  expense,
  onClose,
}: {
  expense: Expense | null;
  onClose: () => void;
}) {
  const create = useCreateExpense();
  const update = useUpdateExpense();
  const isEdit = expense !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? {
          date: expense.date.split('T')[0],
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
        }
      : { date: new Date().toISOString().split('T')[0], category: 'OPERASIONAL' },
  });

  async function onSubmit(values: FormValues) {
    if (isEdit) {
      await update.mutateAsync({ id: expense!.id, dto: values });
    } else {
      await create.mutateAsync(values);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal</label>
            <input type="date" {...register('date')} className={fieldCls} />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Kategori</label>
            <div className="relative">
              <select {...register('category')} className={`${fieldCls} appearance-none pr-9 cursor-pointer`}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]" />
            </div>
            {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Keterangan</label>
            <input {...register('description')} className={fieldCls} placeholder="cth: Beli tepung terigu 25kg" />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Jumlah (Rp)</label>
            <input type="number" step="1" min="0" {...register('amount')} className={fieldCls} placeholder="150000" />
            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-[#A0813A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ description, onConfirm, onCancel }: { description: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background shadow-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Hapus Pengeluaran</h2>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus <span className="font-medium text-foreground">{description}</span>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors">Hapus</button>
        </div>
      </div>
    </div>
  );
}

export function PengeluaranTable() {
  const defaultRange = getMonthRange();
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);

  const { data, isLoading, error } = useExpenses(from, to);
  const deleteExpense = useDeleteExpense();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(e: Expense) { setEditing(e); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteExpense.mutateAsync(deleting.id);
    setDeleting(null);
  }

  const expenses = data?.data ?? [];
  const totalAmount = data?.totalAmount ?? 0;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
          />
          <label className="text-xs text-muted-foreground whitespace-nowrap">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-[#A0813A] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          Tambah Pengeluaran
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gagal memuat data. Pastikan Anda sudah login.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Keterangan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Jumlah</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">Memuat data...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">Belum ada pengeluaran di periode ini.</td></tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#A0813A]/10 px-2.5 py-0.5 text-xs font-medium text-[#A0813A]">
                      {CATEGORY_LABELS[exp.category]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">{exp.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(exp.amount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(exp)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(exp)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Total row */}
      {expenses.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/20 px-4 py-3">
          <span className="text-sm font-medium text-[#A0813A]">Total Pengeluaran ({expenses.length} transaksi)</span>
          <span className="text-sm font-semibold text-[#A0813A]">{formatCurrency(totalAmount)}</span>
        </div>
      )}

      {modalOpen && <ExpenseModal expense={editing} onClose={closeModal} />}
      {deleting && (
        <DeleteConfirm
          description={deleting.description}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd webapp && pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add webapp/src/components/modules/pengeluaran-table.tsx
git commit -m "feat(webapp): implement pengeluaran CRUD with date filter and totals"
```

---

## Task 6: `penjualan-table.tsx` — Full CRUD

**Files:**
- Modify: `webapp/src/components/modules/penjualan-table.tsx`

Key difference from pengeluaran: product can be selected from HPP list (auto-fills `itemName` + `pricePerUnit` based on channel selection), or input manually.

- [ ] **Step 1: Replace penjualan-table.tsx entirely**

```typescript
// webapp/src/components/modules/penjualan-table.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSales,
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
} from '@/hooks/useSales';
import { useHppEntries } from '@/hooks/useHpp';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Sale } from '@bakersgo/types';

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const to = now.toISOString().split('T')[0];
  return { from, to };
}

const schema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  hppEntryId: z.string().optional(),
  channel: z.enum(['RESELLER', 'END_USER']).optional(),
  itemName: z.string().min(1, 'Nama produk wajib diisi'),
  qty: z.coerce.number().int().positive('Qty harus > 0'),
  pricePerUnit: z.coerce.number().positive('Harga harus > 0'),
});
type FormValues = z.infer<typeof schema>;

const fieldCls =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors';

function SaleModal({
  sale,
  onClose,
}: {
  sale: Sale | null;
  onClose: () => void;
}) {
  const create = useCreateSale();
  const update = useUpdateSale();
  const { data: hppData } = useHppEntries();
  const isEdit = sale !== null;

  const hppEntries = hppData?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: sale
      ? {
          date: sale.date.split('T')[0],
          itemName: sale.itemName,
          qty: sale.qty,
          pricePerUnit: sale.pricePerUnit,
        }
      : { date: new Date().toISOString().split('T')[0], qty: 1 },
  });

  const hppEntryId = useWatch({ control, name: 'hppEntryId' });
  const channel = useWatch({ control, name: 'channel' });
  const qty = useWatch({ control, name: 'qty' }) ?? 0;
  const pricePerUnit = useWatch({ control, name: 'pricePerUnit' }) ?? 0;
  const previewTotal = qty * pricePerUnit;

  // Auto-fill itemName and price when hpp entry + channel selected
  useEffect(() => {
    if (!hppEntryId || !channel) return;
    const entry = hppEntries.find((e) => e.id === hppEntryId);
    if (!entry) return;
    setValue('itemName', entry.recipeName);
    setValue(
      'pricePerUnit',
      channel === 'RESELLER' ? entry.hargaReseller : entry.hargaEndUser,
    );
  }, [hppEntryId, channel, hppEntries, setValue]);

  async function onSubmit(values: FormValues) {
    const dto = {
      date: values.date,
      itemName: values.itemName,
      qty: values.qty,
      pricePerUnit: values.pricePerUnit,
      recipeId: values.hppEntryId
        ? hppEntries.find((e) => e.id === values.hppEntryId)?.recipeId
        : undefined,
    };
    if (isEdit) {
      await update.mutateAsync({ id: sale!.id, dto });
    } else {
      await create.mutateAsync(dto);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? 'Edit Penjualan' : 'Tambah Penjualan'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal</label>
            <input type="date" {...register('date')} className={fieldCls} />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {/* Optional: select from HPP */}
          {!isEdit && hppEntries.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Produk (HPP)</label>
                <div className="relative">
                  <select {...register('hppEntryId')} className={`${fieldCls} appearance-none pr-9 cursor-pointer`}>
                    <option value="">— Manual —</option>
                    {hppEntries.map((e) => (
                      <option key={e.id} value={e.id}>{e.recipeName}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Channel</label>
                <div className="relative">
                  <select {...register('channel')} className={`${fieldCls} appearance-none pr-9 cursor-pointer`}>
                    <option value="">— Pilih —</option>
                    <option value="RESELLER">Reseller</option>
                    <option value="END_USER">End User</option>
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#A0813A]" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nama Produk</label>
            <input {...register('itemName')} className={fieldCls} placeholder="cth: Croissant Butter" />
            {errors.itemName && <p className="mt-1 text-xs text-destructive">{errors.itemName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Qty</label>
              <input type="number" min="1" step="1" {...register('qty')} className={fieldCls} placeholder="10" />
              {errors.qty && <p className="mt-1 text-xs text-destructive">{errors.qty.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Harga/pcs (Rp)</label>
              <input type="number" min="0" step="1" {...register('pricePerUnit')} className={fieldCls} placeholder="25000" />
              {errors.pricePerUnit && <p className="mt-1 text-xs text-destructive">{errors.pricePerUnit.message}</p>}
            </div>
          </div>

          {/* Total preview */}
          {previewTotal > 0 && (
            <div className="rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/20 px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#A0813A]">Total</span>
              <span className="text-sm font-semibold text-[#A0813A]">{formatCurrency(previewTotal)}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-[#A0813A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ itemName, onConfirm, onCancel }: { itemName: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-background shadow-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Hapus Penjualan</h2>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus penjualan <span className="font-medium text-foreground">{itemName}</span>?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">Batal</button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors">Hapus</button>
        </div>
      </div>
    </div>
  );
}

export function PenjualanTable() {
  const defaultRange = getMonthRange();
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);

  const { data, isLoading, error } = useSales(from, to);
  const deleteSale = useDeleteSale();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sale | null>(null);
  const [deleting, setDeleting] = useState<Sale | null>(null);

  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(s: Sale) { setEditing(s); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function confirmDelete() {
    if (!deleting) return;
    await deleteSale.mutateAsync(deleting.id);
    setDeleting(null);
  }

  const sales = data?.data ?? [];
  const totalRevenue = data?.totalRevenue ?? 0;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-muted-foreground whitespace-nowrap">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
          />
          <label className="text-xs text-muted-foreground whitespace-nowrap">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-[#A0813A] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          Tambah Penjualan
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Gagal memuat data. Pastikan Anda sudah login.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Produk</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Qty</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Harga/pcs</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Memuat data...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">Belum ada penjualan di periode ini.</td></tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(s.date)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{s.itemName}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{s.qty}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(s.pricePerUnit)}</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(s.totalRevenue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleting(s)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sales.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-[#A0813A]/10 border border-[#A0813A]/20 px-4 py-3">
          <span className="text-sm font-medium text-[#A0813A]">Total Penjualan ({sales.length} transaksi)</span>
          <span className="text-sm font-semibold text-[#A0813A]">{formatCurrency(totalRevenue)}</span>
        </div>
      )}

      {modalOpen && <SaleModal sale={editing} onClose={closeModal} />}
      {deleting && (
        <DeleteConfirm
          itemName={deleting.itemName}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript picks up the correct field names**

`HppEntry` from `@bakersgo/types` has: `recipeName` (string), `hargaReseller` (number), `hargaEndUser` (number), `recipeId` (string). These match the code above — no changes needed.

- [ ] **Step 3: Verify TypeScript**

```bash
cd webapp && pnpm tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add webapp/src/components/modules/penjualan-table.tsx
git commit -m "feat(webapp): implement penjualan CRUD with HPP product selection"
```

---

## Task 7: `dashboard-summary.tsx` — Live Data + Bar Chart

**Files:**
- Modify: `webapp/src/components/modules/dashboard-summary.tsx`

Replace hardcoded `value: 0` with real data from `useReportSummary`. Add month picker and Recharts bar chart using `dailyBreakdown`.

- [ ] **Step 1: Replace dashboard-summary.tsx entirely**

```typescript
// webapp/src/components/modules/dashboard-summary.tsx
'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useReportSummary } from '@/hooks/useReports';
import { formatCurrency } from '@/lib/utils';

function getMonthRange(year: number, month: number) {
  const from = new Date(year, month, 1).toISOString().split('T')[0];
  const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
  return { from, to };
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatAxisCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return String(value);
}

export function DashboardSummary() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { from, to } = getMonthRange(year, month);
  const { data, isLoading } = useReportSummary(from, to);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const summary = data?.summary;
  const daily = data?.dailyBreakdown ?? [];

  const stats = [
    {
      label: 'Total Penjualan',
      value: summary?.totalRevenue ?? 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Pengeluaran',
      value: summary?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Laba Bersih',
      value: summary?.netProfit ?? 0,
      icon: DollarSign,
      color: 'text-[#A0813A]',
      bg: 'bg-[#A0813A]/10',
    },
    {
      label: 'Saldo Aman',
      value: summary?.safeBalance ?? 0,
      icon: ShieldCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Month picker */}
      <div className="flex items-center gap-3">
        <button onClick={prevMonth} className="rounded-lg border border-border p-1.5 hover:bg-muted transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          disabled={year === now.getFullYear() && month === now.getMonth()}
          className="rounded-lg border border-border p-1.5 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <div className={`rounded-xl p-2.5 ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              {isLoading ? (
                <div className="mt-1 h-5 w-24 animate-pulse rounded bg-muted" />
              ) : (
                <p className={`mt-0.5 text-base font-semibold ${value < 0 ? 'text-red-600' : 'text-foreground'}`}>
                  {formatCurrency(value)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {daily.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Penjualan vs Pengeluaran Harian</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={daily} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#8A8A8A' }}
                tickFormatter={(v: string) => v.split('-')[2]}
              />
              <YAxis tick={{ fontSize: 10, fill: '#8A8A8A' }} tickFormatter={formatAxisCurrency} width={40} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'revenue' ? 'Penjualan' : 'Pengeluaran',
                ]}
                labelFormatter={(label: string) => `Tgl ${label.split('-')[2]}`}
              />
              <Bar dataKey="revenue" fill="#A0813A" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar dataKey="expenses" fill="#DC2626" radius={[4, 4, 0, 0]} name="expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!isLoading && daily.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Belum ada data transaksi di bulan ini. Mulai catat penjualan dan pengeluaran.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd webapp && pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add webapp/src/components/modules/dashboard-summary.tsx
git commit -m "feat(webapp): connect dashboard to live reports API with month picker and bar chart"
```

---

## Task 8: `laporan-view.tsx` — Full Analytics

**Files:**
- Modify: `webapp/src/components/modules/laporan-view.tsx`

Includes: date range filter with shortcut buttons (Bulan Ini, 3 Bulan, Tahun Ini), 4 summary cards, bar chart, combined transaction table sorted by date desc, export TODO buttons.

- [ ] **Step 1: Replace laporan-view.tsx entirely**

```typescript
// webapp/src/components/modules/laporan-view.tsx
'use client';

import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, ShieldCheck } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useReportSummary } from '@/hooks/useReports';
import { useExpenses } from '@/hooks/useExpenses';
import { useSales } from '@/hooks/useSales';
import { formatCurrency, formatDate } from '@/lib/utils';

function today() { return new Date().toISOString().split('T')[0]; }
function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}
function threeMonthsAgo() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
}
function yearStart() {
  return `${new Date().getFullYear()}-01-01`;
}

function formatAxisCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return String(value);
}

export function LaporanView() {
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());

  const { data: reportData, isLoading: reportLoading } = useReportSummary(from, to);
  const { data: expenseData } = useExpenses(from, to);
  const { data: saleData } = useSales(from, to);

  const summary = reportData?.summary;
  const daily = reportData?.dailyBreakdown ?? [];

  // Combined transaction list sorted by date desc
  const combined = useMemo(() => {
    const expenses = (expenseData?.data ?? []).map((e) => ({
      id: e.id,
      date: e.date,
      type: 'expense' as const,
      label: e.description,
      badge: e.category,
      amount: -e.amount,
    }));
    const sales = (saleData?.data ?? []).map((s) => ({
      id: s.id,
      date: s.date,
      type: 'sale' as const,
      label: s.itemName,
      badge: `${s.qty} pcs`,
      amount: s.totalRevenue,
    }));
    return [...expenses, ...sales].sort((a, b) => b.date.localeCompare(a.date));
  }, [expenseData, saleData]);

  const stats = [
    { label: 'Total Penjualan', value: summary?.totalRevenue ?? 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Pengeluaran', value: summary?.totalExpenses ?? 0, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Laba Bersih', value: summary?.netProfit ?? 0, icon: DollarSign, color: 'text-[#A0813A]', bg: 'bg-[#A0813A]/10' },
    { label: 'Saldo Aman', value: summary?.safeBalance ?? 0, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
          />
          <span className="text-xs text-muted-foreground">—</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors"
          />
          <div className="flex gap-2">
            <button onClick={() => { setFrom(monthStart()); setTo(today()); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
              Bulan Ini
            </button>
            <button onClick={() => { setFrom(threeMonthsAgo()); setTo(today()); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
              3 Bulan
            </button>
            <button onClick={() => { setFrom(yearStart()); setTo(today()); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">
              Tahun Ini
            </button>
          </div>
        </div>

        {/* TODO: export CSV / PDF */}
        <div className="flex gap-2">
          <button
            onClick={() => alert('Export CSV — belum diimplementasikan')}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs hover:bg-muted transition-colors"
          >
            <Download size={13} />
            CSV
          </button>
          <button
            onClick={() => alert('Export PDF — belum diimplementasikan')}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs hover:bg-muted transition-colors"
          >
            <Download size={13} />
            PDF
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <div className={`rounded-xl p-2.5 ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              {reportLoading ? (
                <div className="mt-1 h-5 w-24 animate-pulse rounded bg-muted" />
              ) : (
                <p className={`mt-0.5 text-base font-semibold ${value < 0 ? 'text-red-600' : 'text-foreground'}`}>
                  {formatCurrency(value)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      {daily.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Penjualan vs Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#8A8A8A' }}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 10, fill: '#8A8A8A' }} tickFormatter={formatAxisCurrency} width={40} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'revenue' ? 'Penjualan' : 'Pengeluaran',
                ]}
              />
              <Bar dataKey="revenue" fill="#A0813A" radius={[4, 4, 0, 0]} name="revenue" />
              <Bar dataKey="expenses" fill="#DC2626" radius={[4, 4, 0, 0]} name="expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Combined transaction table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-medium text-foreground">Semua Transaksi</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tanggal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tipe</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Keterangan</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {combined.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Belum ada transaksi di periode ini.
                </td>
              </tr>
            ) : (
              combined.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.type === 'sale'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {item.type === 'sale' ? 'Penjualan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {item.label}
                    <span className="ml-2 text-xs text-muted-foreground">{item.badge}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${item.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {item.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd webapp && pnpm tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add webapp/src/components/modules/laporan-view.tsx
git commit -m "feat(webapp): implement laporan analytics with charts and combined transaction table"
```

---

## Task 9: Smoke Test — Run the Full App

- [ ] **Step 1: Start backend + webapp**

```bash
# Terminal 1
cd backend && pnpm dev

# Terminal 2
cd webapp && pnpm dev
```

- [ ] **Step 2: Manual test checklist**

Open `http://localhost:3001` (or whatever port webapp uses) and verify:

1. Login works → Dashboard shows brandName in topbar
2. Dashboard stat cards show 0 (correct, no data yet) — no crashes
3. Navigate to Pengeluaran → click "Tambah Pengeluaran" → fill form → save → row appears in table
4. Edit the expense row → change amount → save → row updates
5. Delete the expense row → confirmation dialog → confirm → row disappears
6. Navigate to Penjualan → add a sale → verify total preview shows `qty × pricePerUnit`
7. If HPP entries exist, select a product + channel → verify `itemName` and `pricePerUnit` auto-fill
8. After adding transactions → navigate to Dashboard → stat cards show real numbers
9. Bar chart renders with colored bars
10. Navigate to Laporan → change date range → "Bulan Ini" shortcut resets filter
11. Combined table shows both sales (green) and expenses (red)

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: smoke test corrections"
```

---

## Self-Review: Spec Coverage

| Requirement (from CLAUDE.md.md) | Task | Status |
|---|---|---|
| useReports.ts | Task 2 | ✅ covered |
| GET /auth/profile backend | Task 3 | ✅ covered |
| /api/auth/me API route | Task 3 | ✅ covered |
| topbar user info | Task 4 | ✅ covered |
| pengeluaran-table CRUD | Task 5 | ✅ covered |
| pengeluaran date filter | Task 5 | ✅ covered |
| pengeluaran total display | Task 5 | ✅ covered |
| penjualan-table CRUD | Task 6 | ✅ covered |
| penjualan HPP dropdown | Task 6 | ✅ covered |
| penjualan total preview | Task 6 | ✅ covered |
| dashboard live data | Task 7 | ✅ covered |
| dashboard month picker | Task 7 | ✅ covered |
| dashboard bar chart | Task 7 | ✅ covered |
| laporan date range filter | Task 8 | ✅ covered |
| laporan shortcut buttons | Task 8 | ✅ covered |
| laporan summary cards | Task 8 | ✅ covered |
| laporan bar chart | Task 8 | ✅ covered |
| laporan combined table | Task 8 | ✅ covered |
| laporan export buttons (stub) | Task 8 | ✅ covered (TODO) |
