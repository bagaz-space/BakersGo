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
**Branch:** `feat/mobile-react-native`  
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

- `mobile/app/(app)/_layout.tsx` — Bottom tab navigation: Beranda, Bahan, Resep, Transaksi, Laporan. Logout button di header Beranda (clear token + clear query cache + navigate ke login)
- `mobile/app/(app)/index.tsx` — Dashboard: greeting "{brandName}", bulan berjalan, 4 summary cards (Total Penjualan, Total Pengeluaran, Laba Bersih, Saldo Aman) dari `GET /reports/summary`, loading + error state
- `mobile/app/(app)/bahan/index.tsx` — Placeholder "Master Bahan / Segera hadir"
- `mobile/app/(app)/resep/index.tsx` — Placeholder "Master Resep / Segera hadir"
- `mobile/app/(app)/transaksi/index.tsx` — Placeholder "Transaksi / Segera hadir"
- `mobile/app/(app)/laporan/index.tsx` — Placeholder "Laporan / Segera hadir"
- `mobile/components/SummaryCard.tsx` — Card dengan title, value, color (default/green/red)
- `mobile/lib/format.ts` — `formatRupiah()` dengan dukungan nilai negatif ("-Rp 100.000")

---

## Belum Dikerjakan (Menunggu Instruksi)

| Fitur | File target | Catatan |
|---|---|---|
| Master Bahan | `app/(app)/bahan/` | CRUD ingredients |
| Master Resep | `app/(app)/resep/` | CRUD recipes |
| HPP Calculator | `app/(app)/hpp/` | Kalkulasi harga jual |
| Transaksi | `app/(app)/transaksi/` | Input penjualan & pengeluaran |
| Laporan | `app/(app)/laporan/` | View laporan bulanan + chart |
| Offline support | `lib/query-client.ts` | AsyncStorage persistence |
| Push notifications | — | expo-notifications |
| Android build | — | `eas build --platform android` |

---

## Cara Test Sekarang

```bash
# Terminal 1: jalankan backend
cd backend && pnpm dev

# Terminal 2: jalankan Expo
cd mobile && npx expo start
```

Scan QR di Expo Go (Android). Pastikan device/emulator bisa reach `10.0.2.2:3000` (Android emulator) atau IP lokal untuk device fisik.

Untuk device fisik, set env:
```bash
EXPO_PUBLIC_API_URL=http://<IP-lokal>:3000 npx expo start
```

---

## Cara Build Android APK

```bash
cd mobile
npx eas build --platform android --profile preview
# Menghasilkan .apk yang bisa diinstall langsung
```

---

## Referensi

- Backend API: `backend/src/routes/`
- Shared types: `packages/types/src/`
- Pola API client webapp: `webapp/src/lib/api.ts`
- Pola hooks webapp: `webapp/src/hooks/`
