# BakersGo — Claude Code Prompt
**Berdasarkan kondisi repo aktual. Paste file ini sebagai konteks di awal sesi Claude Code.**

---

## STATUS REPO SAAT INI

### ✅ Sudah selesai dan JANGAN diubah
| Bagian | Status |
|---|---|
| `packages/types/` | ✅ Lengkap — semua TypeScript interface sudah didefinisikan |
| `backend/prisma/schema.prisma` | ✅ Semua model sudah ada (User, Ingredient, Recipe, RecipeIngredient, Expense, Sale, HppEntry) |
| `backend/src/routes/auth.ts` | ✅ Register + Login |
| `backend/src/routes/ingredients.ts` | ✅ CRUD lengkap + auto-calc `pricePerUnit` |
| `backend/src/routes/recipes.ts` | ✅ CRUD + auto-calc `baseRecipeCost` |
| `backend/src/routes/hpp.ts` | ✅ GET, POST, DELETE |
| `backend/src/routes/expenses.ts` | ✅ CRUD lengkap |
| `backend/src/routes/sales.ts` | ✅ CRUD lengkap |
| `backend/src/routes/reports.ts` | ✅ `/reports/summary` dengan Saldo Aman formula |
| `webapp/src/lib/api.ts` | ✅ Fetch wrapper dengan ApiError |
| `webapp/src/lib/auth.ts` | ✅ Server-side cookie helpers (httpOnly) |
| `webapp/src/lib/utils.ts` | ✅ `formatCurrency`, `formatDate`, `cn` |
| `webapp/src/app/globals.css` | ✅ Design tokens lengkap sebagai CSS variables |
| `webapp/src/components/layout/sidebar.tsx` | ✅ Nav lengkap dengan active state |
| `webapp/src/components/auth/login-form.tsx` | ✅ Dengan validasi zod |
| `webapp/src/components/auth/register-form.tsx` | ✅ |
| `webapp/src/components/modules/master-bahan-table.tsx` | ✅ CRUD modal lengkap |
| `webapp/src/components/modules/master-resep-table.tsx` | ✅ CRUD dengan komposisi bahan |
| `webapp/src/components/modules/hpp-calculator.tsx` | ✅ Live kalkulasi + simpan + delete |
| `webapp/src/hooks/useIngredients.ts` | ✅ |
| `webapp/src/hooks/useRecipes.ts` | ✅ |
| `webapp/src/hooks/useHpp.ts` | ✅ |
| Auth API routes (`/api/auth/*`) | ✅ Login, register, logout, token |
| Middleware (`src/proxy.ts`) | ✅ Auth guard redirect |

### ❌ Belum diimplementasikan (ini yang harus dikerjakan)
| Bagian | Yang perlu dibuat |
|---|---|
| `dashboard-summary.tsx` | Masih hardcoded `value: 0`, belum connect ke `/reports/summary` |
| `pengeluaran-table.tsx` | Placeholder kosong — belum ada CRUD sama sekali |
| `penjualan-table.tsx` | Placeholder kosong — belum ada CRUD sama sekali |
| `laporan-view.tsx` | Placeholder kosong — belum ada chart atau data |
| `topbar.tsx` | Hanya judul + menu icon, belum ada user info |
| `src/hooks/` | Belum ada `useExpenses.ts`, `useSales.ts`, `useReports.ts` |
| Root `package.json` scripts | Belum ada `dev` script yang jalankan backend+webapp paralel |
| Staging / preview setup | Belum ada konfigurasi deployment preview |

---

## ARSITEKTUR PENTING — BACA SEBELUM MULAI

### Monorepo Structure
```
BakersGo/
├── packages/types/     ← @bakersgo/types — shared TS interfaces, dipakai backend + webapp
├── backend/            ← Fastify API (port 3000)
├── frontend/           ← Flutter mobile — JANGAN DISENTUH
└── webapp/             ← Next.js 16 web app — fokus kerjakan ini
```

### Design Tokens (sudah ada di globals.css, JANGAN ubah)
```css
--primary: #A0813A
--background: #F5F0E8
--card: #EDE8DF
--primary-dark: #7A5F28
--primary-light: #D4AA6F
```

### Auth Pattern yang Dipakai
- JWT disimpan di **httpOnly cookie** bernama `bakersgo_token`
- Client component tidak bisa baca cookie langsung → pakai `/api/auth/token` route
- Pattern di hooks: `const token = await fetch('/api/auth/token').then(r => r.json()).then(d => d.token)`
- Semua hook sudah mengikuti pattern ini — **ikuti pattern yang sama untuk hook baru**

### Shared Types — WAJIB dipakai
Selalu import types dari `@bakersgo/types`, jangan buat interface baru:
```typescript
import type { Expense, CreateExpenseDto, ExpenseListResponse } from '@bakersgo/types'
import type { Sale, CreateSaleDto, SaleListResponse } from '@bakersgo/types'
import type { ReportResponse, ReportSummary } from '@bakersgo/types'
```

### Backend Endpoints yang Tersedia
```
POST   /auth/register
POST   /auth/login

GET    /ingredients
POST   /ingredients          ← auto-calc pricePerUnit server-side
PUT    /ingredients/:id
DELETE /ingredients/:id

GET    /recipes
POST   /recipes              ← auto-calc baseRecipeCost server-side
PUT    /recipes/:id
DELETE /recipes/:id

GET    /hpp
POST   /hpp
DELETE /hpp/:id

GET    /expenses?from=&to=
POST   /expenses
PUT    /expenses/:id
DELETE /expenses/:id

GET    /sales?from=&to=
POST   /sales                ← totalRevenue = qty × pricePerUnit (server-side)
PUT    /sales/:id
DELETE /sales/:id

GET    /reports/summary?from=&to=   ← returns ReportResponse dengan safeBalance
```

---

## TASK 1 — Root Dev Script

**File:** `package.json` (root monorepo)

Tambahkan scripts untuk menjalankan backend + webapp secara paralel:

```json
{
  "name": "bakersgo",
  "private": true,
  "version": "0.0.1",
  "packageManager": "pnpm@10.33.2",
  "scripts": {
    "dev": "pnpm --filter backend dev & pnpm --filter webapp dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev:webapp": "pnpm --filter webapp dev",
    "build:webapp": "pnpm --filter webapp build",
    "db:migrate": "pnpm --filter backend db:migrate",
    "db:generate": "pnpm --filter backend db:generate",
    "db:studio": "pnpm --filter backend db:studio"
  }
}
```

Catatan: Gunakan `&` (bukan `concurrently`) agar tidak perlu install dependency tambahan di root.
Jika ingin output lebih rapi, boleh install `concurrently` sebagai devDependency root.

---

## TASK 2 — Hook: `useExpenses.ts`

**File:** `webapp/src/hooks/useExpenses.ts`

Ikuti pattern yang persis sama dengan `useIngredients.ts`:

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseListResponse,
} from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useExpenses(from?: string, to?: string) {
  return useQuery({
    queryKey: ['expenses', from, to],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return api.get<ExpenseListResponse>(`/expenses${qs ? `?${qs}` : ''}`, token);
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateExpenseDto) => {
      const token = await getToken();
      return api.post<Expense>('/expenses', dto, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateExpenseDto }) => {
      const token = await getToken();
      return api.put<Expense>(`/expenses/${id}`, dto, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.delete(`/expenses/${id}`, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
```

---

## TASK 3 — Hook: `useSales.ts`

**File:** `webapp/src/hooks/useSales.ts`

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Sale,
  CreateSaleDto,
  UpdateSaleDto,
  SaleListResponse,
} from '@bakersgo/types';

async function getToken(): Promise<string | undefined> {
  const res = await fetch('/api/auth/token');
  if (!res.ok) return undefined;
  const data = await res.json();
  return data.token as string | undefined;
}

export function useSales(from?: string, to?: string) {
  return useQuery({
    queryKey: ['sales', from, to],
    queryFn: async () => {
      const token = await getToken();
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const qs = params.toString();
      return api.get<SaleListResponse>(`/sales${qs ? `?${qs}` : ''}`, token);
    },
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateSaleDto) => {
      const token = await getToken();
      return api.post<Sale>('/sales', dto, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateSaleDto }) => {
      const token = await getToken();
      return api.put<Sale>(`/sales/${id}`, dto, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return api.delete(`/sales/${id}`, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
```

---

## TASK 4 — Hook: `useReports.ts`

**File:** `webapp/src/hooks/useReports.ts`

```typescript
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

---

## TASK 5 — Komponen: `pengeluaran-table.tsx` (Implementasi Penuh)

**File:** `webapp/src/components/modules/pengeluaran-table.tsx`

Ganti placeholder kosong dengan implementasi lengkap. Ikuti PERSIS pola yang sama dengan `master-bahan-table.tsx` (modal, delete confirm, tabel). Gunakan:
- `useExpenses`, `useCreateExpense`, `useUpdateExpense`, `useDeleteExpense` dari Task 2
- Types dari `@bakersgo/types`: `Expense`, `CreateExpenseDto`, `ExpenseCategory`
- `formatCurrency`, `formatDate` dari `@/lib/utils`

**Kategori yang tersedia (dari `@bakersgo/types`):**
```typescript
type ExpenseCategory = 'BAHAN_BAKU' | 'OPERASIONAL' | 'LISTRIK' | 'GAJI' | 'LAINNYA'
```

**Label tampilan untuk kategori:**
```typescript
const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  BAHAN_BAKU: 'Bahan Baku',
  OPERASIONAL: 'Operasional',
  LISTRIK: 'Listrik',
  GAJI: 'Gaji',
  LAINNYA: 'Lainnya',
};
```

**Form fields:** Tanggal (date input), Kategori (select dropdown), Keterangan (text), Jumlah (number, format Rp)

**Kolom tabel:** Tanggal | Kategori | Keterangan | Jumlah | Actions (edit, delete)

**Filter:** Date range picker (from/to) di atas tabel. Default: awal bulan ini s/d hari ini.

**Tampilkan total pengeluaran** di bawah tabel menggunakan `data.totalAmount`.

---

## TASK 6 — Komponen: `penjualan-table.tsx` (Implementasi Penuh)

**File:** `webapp/src/components/modules/penjualan-table.tsx`

Implementasi lengkap. Gunakan:
- `useSales`, `useCreateSale`, `useUpdateSale`, `useDeleteSale` dari Task 3
- `useHppEntries` dari hook yang sudah ada (untuk dropdown pilih produk dari HPP)
- Types dari `@bakersgo/types`: `Sale`, `CreateSaleDto`

**Form fields:**
- Tanggal (date input, default hari ini)
- Pilih Produk: dropdown dari HPP entries (`hppEntries.data`). Tampilkan `recipeName`
- Channel: dropdown — "Reseller" atau "End User"
  - Reseller → auto-fill `pricePerUnit` dari `entry.hargaReseller`
  - End User → auto-fill `pricePerUnit` dari `entry.hargaEndUser`
  - Boleh juga input manual harga jika tidak pilih produk dari HPP
- Field `itemName`: auto-fill dari `entry.recipeName` atau input manual
- Qty (number)
- Harga/pcs (auto-fill dari channel, bisa diedit manual)
- Total otomatis: `qty × pricePerUnit` (tampilkan preview, tidak perlu input)

**Kolom tabel:** Tanggal | Produk | Qty | Harga/pcs | Total | Actions

**Filter:** Date range (from/to), default bulan ini.

**Tampilkan total revenue** di bawah tabel menggunakan `data.totalRevenue`.

---

## TASK 7 — Komponen: `dashboard-summary.tsx` (Connect ke API)

**File:** `webapp/src/components/modules/dashboard-summary.tsx`

Ganti hardcoded `value: 0` dengan data real dari `/reports/summary`.

**Logika:**
1. Default period: awal bulan ini s/d hari ini
2. Tambahkan **month picker** — dropdown bulan (atau prev/next arrow) di header
3. Panggil `useReportSummary(from, to)` dari Task 4
4. Map ke 4 cards:
   - **Total Penjualan** → `summary.totalRevenue`
   - **Total Pengeluaran** → `summary.totalExpenses`
   - **Laba Bersih** → `summary.netProfit`
   - **Saldo Aman** → `summary.safeBalance`
5. Tambahkan **loading skeleton** saat data sedang dimuat
6. Tampilkan grafik bar sederhana menggunakan `dailyBreakdown` dari response (Recharts sudah ada di dependencies)

**Chart yang perlu dibuat (gunakan Recharts `BarChart`):**
- X axis: tanggal dari `dailyBreakdown`
- 2 bar: `revenue` (warna `#A0813A`) dan `expenses` (warna `#DC2626`)

---

## TASK 8 — Komponen: `laporan-view.tsx` (Implementasi Penuh)

**File:** `webapp/src/components/modules/laporan-view.tsx`

Ganti placeholder dengan implementasi lengkap:

1. **Filter bar** di atas: date range picker (from/to), tombol shortcut: Bulan Ini, 3 Bulan, Tahun Ini

2. **Summary cards** (sama dengan dashboard): Penjualan, Pengeluaran, Laba, Saldo Aman

3. **BarChart** Income vs Expenses (per hari) menggunakan Recharts — sama dengan dashboard

4. **Tabel transaksi gabungan**: tampilkan sales dan expenses dalam satu tabel, diurutkan by date desc
   - Fetch kedua endpoint: `useSales(from, to)` dan `useExpenses(from, to)`
   - Gabungkan dan sort by date

5. **Tombol export**: saat ini cukup tampilkan tombol dengan `onClick` yang belum diimplementasikan (tulis TODO comment). Export PDF/CSV bisa dikerjakan di step berikutnya.

---

## TASK 9 — Topbar: Tampilkan User Info

**File:** `webapp/src/components/layout/topbar.tsx`

Tambahkan user info dari profile. Tambahkan server action atau API route baru:

**Buat `webapp/src/app/api/auth/me/route.ts`:**
```typescript
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

**Catatan:** Backend belum punya `GET /auth/profile`. Tambahkan endpoint ini ke `backend/src/routes/auth.ts`:
```typescript
app.get('/auth/profile', { preHandler: requireAuth }, async (request, reply) => {
  const userId = getUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return reply.status(404).send({ message: 'User tidak ditemukan' });
  return reply.send(toUserProfile(user));
});
```

**Update `topbar.tsx`:** Tambahkan hook `useUser` yang fetch `/api/auth/me`, tampilkan `user.brandName` dan `user.userId` di topbar.

---

## TASK 10 — Staging Preview Setup

**Tujuan:** Bisa preview webapp di URL publik tanpa deploy ke production.

### Opsi A — Vercel Preview (Recommended)

Tambahkan `vercel.json` di `webapp/`:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url"
  }
}
```

Untuk deploy preview dari local:
```bash
cd webapp
vercel                    # deploy preview (bukan production)
vercel --prod             # deploy ke production
```

Setiap PR/branch di GitHub otomatis dapat preview URL jika repo terhubung ke Vercel.

### Opsi B — Cloudflare Tunnel (sudah ada `cloudflared.exe` di repo!)

Repo sudah memiliki `cloudflared.exe` — ini bisa dipakai untuk expose local server ke internet:

```bash
# Terminal 1 — jalankan backend
cd backend && pnpm dev

# Terminal 2 — jalankan webapp
cd webapp && pnpm dev

# Terminal 3 — expose webapp ke internet via tunnel
./cloudflared.exe tunnel --url http://localhost:3001
# Akan mendapat URL seperti: https://random-name.trycloudflare.com
```

**Masalah:** Backend di port 3000 tidak akan bisa diakses dari webapp yang di-tunnel.
**Solusi:** Tunnel backend juga, lalu update `NEXT_PUBLIC_API_URL` ke URL tunnel backend:

```bash
# Terminal 4 — expose backend
./cloudflared.exe tunnel --url http://localhost:3000
# Copy URL backend tunnel → set sebagai NEXT_PUBLIC_API_URL di webapp/.env.local
```

Tambahkan script di root `package.json`:
```json
"tunnel:webapp": "cloudflared tunnel --url http://localhost:3001",
"tunnel:backend": "cloudflared tunnel --url http://localhost:3000"
```

### Setup `.env.local` untuk Webapp

Buat `webapp/.env.local` jika belum ada:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Untuk staging dengan tunnel backend:
```env
NEXT_PUBLIC_API_URL=https://[backend-tunnel-url].trycloudflare.com
```

---

## ATURAN SINKRONISASI DENGAN FLUTTER (Penting!)

### Yang sudah sinkron — JANGAN ubah kontrak ini
- **`packages/types/`** — sumber kebenaran tunggal untuk semua API interface. Backend dan webapp sudah pakai ini. Flutter menggunakan model serupa (tapi dalam Dart) — jangan ubah field names di types karena akan berdampak ke backend yang juga dipakai Flutter.
- **Backend endpoints** — response shape yang sudah ada jangan diubah. Flutter akan konsumsi endpoint yang sama.
- **Database schema** — tambahan field boleh (additive), tapi jangan rename atau hapus field yang ada.

### Checklist sebelum push ke repo
- [ ] Tidak ada perubahan breaking di `packages/types/`
- [ ] Tidak ada rename/delete field di `backend/prisma/schema.prisma`
- [ ] Tidak ada perubahan response shape di endpoint yang sudah ada
- [ ] `frontend/` tidak tersentuh sama sekali

---

## URUTAN PENGERJAAN YANG DISARANKAN

```
Task 1  → Root dev script          (5 menit)
Task 2  → useExpenses hook         (10 menit)
Task 3  → useSales hook            (10 menit)
Task 4  → useReports hook          (5 menit)
Task 9  → GET /auth/profile + topbar user info   (15 menit)
Task 5  → pengeluaran-table        (30 menit) ← test dengan data real
Task 6  → penjualan-table          (30 menit) ← test dengan data real
Task 7  → dashboard-summary live   (20 menit) ← pastikan angka muncul
Task 8  → laporan-view             (30 menit)
Task 10 → Staging setup            (15 menit)
```

Total estimasi: ~3 jam pengerjaan bersih.

---

## STYLE GUIDE — Konsistensi dengan Kode yang Ada

Semua kode baru HARUS mengikuti pattern ini (copy dari file yang sudah ada):

**Input/field styling:**
```typescript
const fieldCls = 'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0813A] focus:border-[#A0813A] transition-colors';
```

**Tombol primary:**
```typescript
className="rounded-xl bg-[#A0813A] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-colors"
```

**Tombol outline:**
```typescript
className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
```

**Card/panel:**
```typescript
className="rounded-2xl border border-border bg-card p-5"
```

**Format currency:** Selalu gunakan `formatCurrency(value)` dari `@/lib/utils`

**Format date:** Selalu gunakan `formatDate(dateString)` dari `@/lib/utils`
