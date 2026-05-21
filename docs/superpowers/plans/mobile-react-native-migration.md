# Plan: Migrasi Flutter → React Native (Expo) — BakersGo Mobile

## Context

BakersGo memiliki dua client: webapp (Next.js) dan mobile app (Flutter). Developer lebih familiar dengan React/TypeScript daripada Dart, sehingga memelihara dua bahasa menjadi beban. Flutter app masih sangat awal (hanya auth + onboarding + profile), sehingga ini waktu terbaik untuk pivot ke React Native sebelum Flutter berkembang lebih jauh.

**Tujuan:**
- Satu bahasa (TypeScript) di seluruh stack: backend → types → webapp → mobile
- Share `@bakersgo/types` antara webapp dan mobile
- Android-first MVP, iOS menyusul tanpa restructuring
- Development paralel: webapp di `main`, mobile di branch `feat/mobile-react-native`

**Keputusan arsitektur:**
- React Native + Expo SDK 52 + Expo Router 4 (routing mirip Next.js App Router)
- JWT disimpan via `expo-secure-store` (bukan cookies/localStorage)
- API client mirip pola webapp (`lib/api.ts`)
- Branch terpisah agar webapp development di `main` tidak terganggu

---

## Struktur Monorepo

```
BakersGo/
├── packages/types/        ← @bakersgo/types (tidak berubah)
├── backend/               ← Fastify API port 3000 (tidak berubah)
├── webapp/                ← Next.js webapp (tidak berubah)
├── frontend/              ← Flutter app (diabaikan, akan dihapus nanti)
└── mobile/                ← BARU: React Native Expo app
```

---

## Progress

### ✅ Fase 1: Setup Monorepo & Expo App
**Commit:** `0255569`

- `pnpm-workspace.yaml` ditambah entry `"mobile"`
- `mobile/package.json` dengan `@bakersgo/mobile`, Expo SDK 52, Expo Router 4, React Query v5, react-hook-form, zod, expo-secure-store
- `mobile/app.json` — scheme `bakersgo`, Android package `com.bakersgo.app`
- `mobile/tsconfig.json` — strict, path alias `@/*`
- `mobile/lib/api.ts` — API client identik pola webapp, env `EXPO_PUBLIC_API_URL`, default `http://10.0.2.2:3000`
- `mobile/lib/auth.ts` — JWT via expo-secure-store (`getToken`, `setToken`, `clearToken`)
- `mobile/lib/query-client.ts` — React Query QueryClient, staleTime 5 menit

---

### ✅ Fase 2: Auth Screens (Login + Register)
**Commit:** `4e31c75`, `2f53131`

- `mobile/app/_layout.tsx` — Root layout, auth gate (cek token saat mount, redirect ke login atau app)
- `mobile/app/(auth)/_layout.tsx` — Stack navigator, no header
- `mobile/app/(auth)/login.tsx` — Form email+password, validasi zod, POST `/auth/login`, simpan JWT, navigasi ke `/(app)`
- `mobile/app/(auth)/register.tsx` — Form email/userId/brandName/password/confirmPassword, validasi zod, POST `/auth/register`
- `mobile/components/ui/Input.tsx` — TextInput reusable, label, error state
- `mobile/components/ui/Button.tsx` — TouchableOpacity, variant primary/secondary, loading state
- Fix: mounted ref guard untuk mencegah state update setelah unmount

---

### ✅ Fase 3: Dashboard + Bottom Tab Navigation
**Commit:** `2d972a3`, `0fde629`

- `mobile/app/(app)/_layout.tsx` — Bottom tab navigation 6 tabs: Beranda, Bahan, Resep, HPP, Transaksi, Laporan. Logout button di header Beranda (clear token + clear query cache + navigate ke login)
- `mobile/app/(app)/index.tsx` — Dashboard: greeting "{brandName}", bulan berjalan, 4 summary cards (totalRevenue, totalExpenses, netProfit, safeBalance) dari `GET /reports/summary`, loading + error state
- `mobile/components/SummaryCard.tsx` — Card dengan title, value, color (default/green/red)
- `mobile/lib/format.ts` — `formatRupiah()` dengan dukungan nilai negatif; `formatDate()`; `getTodayString()`; `getMonthStart()`

---

### ✅ Fase 4: Master Bahan
**Commit:** `12da9b4`, `5362b2d`

- `mobile/hooks/useIngredients.ts` — `useIngredients()`, `useCreateIngredient()`, `useUpdateIngredient()`, `useDeleteIngredient()`
- `mobile/app/(app)/bahan/index.tsx` — FlatList ingredients: name, unit+volume, packagePrice, pricePerUnit, stock. FAB, pull-to-refresh, delete via Alert, loading/error/empty states
- `mobile/components/IngredientModal.tsx` — Bottom-sheet modal. Chip picker unit (gram/kg/ml/liter/pcs/butir/pack). Live preview harga per satuan = packagePrice/packageVolume. Zod validation. submitError state. Edit + Create mode

---

### ✅ Fase 5: Master Resep
**Commit:** `c952650`

- `mobile/hooks/useRecipes.ts` — `useRecipes()`, `useCreateRecipe()`, `useUpdateRecipe()`, `useDeleteRecipe()`
- `mobile/app/(app)/resep/index.tsx` — FlatList recipes: name, description, batchSize+batchUnit, baseRecipeCost, ingredient count. FAB, states, delete via Alert
- `mobile/components/RecipeModal.tsx` — `useFieldArray` untuk dynamic ingredient rows. Chip picker batchUnit (pcs/loyang/porsi/lusin/buah). Live total cost preview. Edit mode pre-fills semua nilai termasuk ingredients
- `mobile/components/IngredientPickerModal.tsx` — Full-screen search modal untuk memilih ingredient per row. Filter by name. Highlight selected

---

### ✅ Fase 6: HPP Calculator
**Commit:** `517e34e`, `e258c47`

- `mobile/hooks/useHpp.ts` — `useHppEntries()`, `useSaveHpp()`, `useUpdateHpp()`, `useDeleteHpp()`
- `mobile/app/(app)/hpp/index.tsx` — ScrollView calculator: Pilih Resep, Zona Dapur (listrik/gas/tenagaKerja/overhead), Zona Final (kotak/stiker/kemasanLain), Zona Penjualan (marginReseller/marginEndUser). `useMemo` hasil (hppTotal, hppPerUnit, hargaReseller, hargaEndUser). Save/Update + try/catch. Edit mode banner. HPP entries list dengan edit/delete
- `mobile/components/RecipePickerModal.tsx` — Search modal untuk memilih resep, tampilkan batchSize + baseRecipeCost

---

### ✅ Fase 7: Transaksi (Penjualan + Pengeluaran)
**Commit:** `e915708`, `066d8cb`

- `mobile/hooks/useSales.ts` — `useSales(from?, to?)`, mutations invalidate `['sales']` + `['reports']`
- `mobile/hooks/useExpenses.ts` — `useExpenses(from?, to?)`, mutations invalidate `['expenses']` + `['reports']`
- `mobile/app/(app)/transaksi/index.tsx` — Tab switcher pill Penjualan/Pengeluaran. Date range filter (default bulan ini). FlatList per tab. FAB buka modal sesuai tab. Summary footer. Pull-to-refresh. Delete via Alert
- `mobile/components/SaleModal.tsx` — HPP autofill (add mode): HppPickerModal + chip channel RESELLER/END_USER. Auto-fill itemName + pricePerUnit saat HPP dipilih. Live total preview
- `mobile/components/ExpenseModal.tsx` — Chip picker category (BAHAN_BAKU/OPERASIONAL/LISTRIK/GAJI/LAINNYA). Default OPERASIONAL
- `mobile/components/HppPickerModal.tsx` — Search by recipeName, tampilkan harga Reseller + End User
- Fix: HPP autofill `useEffect` — `channel` tidak di deps array agar toggle channel tidak overwrite harga yang sudah diisi

---

### ✅ Fase 8: Laporan
**Commit:** `2485390`

- `mobile/hooks/useReports.ts` — `useReportSummary(from, to)`, queryKey `['reports', from, to]`
- `mobile/app/(app)/laporan/index.tsx` — `FlatList` dengan `ListHeaderComponent` (hindari nested ScrollView). Date filter + preset chips (Bulan Ini, 3 Bulan, Tahun Ini). 2×2 SummaryCard grid. View-based bar chart (tanpa library eksternal): 14 hari terakhir, bar width = (value/maxValue)*100%, revenue #A0813A, expenses #DC2626. Combined transaction list (sales + expenses, sort by date desc). Type badges green/red

---

## Status MVP: ✅ SELESAI

| Fitur | Status | Commit |
|---|---|---|
| Setup Expo + monorepo | ✅ Done | `0255569` |
| Auth (Login + Register) | ✅ Done | `4e31c75`, `2f53131` |
| Dashboard + Navigation | ✅ Done | `2d972a3`, `0fde629` |
| Master Bahan | ✅ Done | `12da9b4`, `5362b2d` |
| Master Resep | ✅ Done | `c952650` |
| HPP Calculator | ✅ Done | `517e34e`, `e258c47` |
| Transaksi | ✅ Done | `e915708`, `066d8cb` |
| Laporan | ✅ Done | `2485390` |

---

## Fitur Opsional (Iterasi Berikutnya)

| Fitur | Catatan |
|---|---|
| Offline support | `@tanstack/react-query-persist-client` + AsyncStorage |
| Push notifications | `expo-notifications`, local reminder stok |
| Android APK build | `npx eas build --platform android --profile preview` |
| Date picker | Ganti TextInput YYYY-MM-DD dengan `@react-native-community/datetimepicker` |
| iOS support | Android-first sudah selesai, iOS tinggal test + minor adjustments |

---

## Cara Test

```bash
# Terminal 1: jalankan backend
cd backend && pnpm dev

# Terminal 2: jalankan Expo
cd mobile && npx expo start
```

Scan QR di Expo Go (Android). Untuk Android emulator gunakan `10.0.2.2:3000`. Untuk device fisik:

```bash
EXPO_PUBLIC_API_URL=http://<IP-lokal>:3000 npx expo start
```

---

## Cara Build Android APK

```bash
cd mobile
npx eas build --platform android --profile preview
```

---

## Referensi

- Backend API: `backend/src/routes/`
- Shared types: `packages/types/src/`
- Pola API client webapp: `webapp/src/lib/api.ts`
- Pola hooks webapp: `webapp/src/hooks/`
