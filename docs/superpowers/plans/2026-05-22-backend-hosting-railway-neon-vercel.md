# Backend Hosting (Railway + Neon + Vercel) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy backend Fastify ke Railway dan webapp Next.js ke Vercel, keduanya terhubung ke Neon PostgreSQL, dengan auto-deploy dari branch `main`.

**Architecture:** Railway menjalankan backend via pnpm workspace dari monorepo root menggunakan `tsx`. Neon menyediakan PostgreSQL dengan dua connection string (pooled untuk runtime, direct untuk migrations). Vercel menjalankan webapp dengan `NEXT_PUBLIC_API_URL` mengarah ke Railway.

**Tech Stack:** Railway (Nixpacks, Node.js), Neon (serverless PostgreSQL), Vercel (Next.js), Prisma, pnpm workspaces.

---

## Starting State

- Monorepo root: `D:\personal\BakersGo`
- Backend: `backend/` — Fastify + Prisma + PostgreSQL
- Webapp: `webapp/` — Next.js 16
- Shared types: `packages/types/` — `@bakersgo/types`
- Neon account: sudah ada, database sudah dibuat
- Railway account: sudah ada (atau buat baru di railway.app)
- Vercel account: sudah ada (atau buat baru di vercel.com)

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `backend/prisma/schema.prisma` | Tambah `directUrl` untuk Prisma migrations via Neon direct connection |
| Create | `nixpacks.toml` | Instruksikan Railway: install workspace, generate Prisma client, start backend |
| Create | `webapp/vercel.json` | Instruksikan Vercel: install dari monorepo root, build webapp |

---

## Task 1: Code Changes — schema.prisma, nixpacks.toml, vercel.json

**Files:**
- Modify: `backend/prisma/schema.prisma` (baris 6-8)
- Create: `nixpacks.toml` (root monorepo)
- Create: `webapp/vercel.json`

- [ ] **Step 1: Tambah `directUrl` ke schema.prisma**

Buka `backend/prisma/schema.prisma`, ganti blok `datasource db`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

`directUrl` dibutuhkan agar `prisma migrate deploy` bisa bypass connection pooler Neon (pooler tidak support semua Prisma migration commands).

- [ ] **Step 2: Buat `nixpacks.toml` di root monorepo**

Buat file baru `D:\personal\BakersGo\nixpacks.toml`:

```toml
[phases.install]
cmds = ["pnpm install"]

[phases.build]
cmds = ["pnpm --filter backend db:generate"]

[start]
cmd = "pnpm --filter backend start"
```

- `phases.install`: install semua workspace packages termasuk `@bakersgo/types`
- `phases.build`: generate Prisma client dari schema (wajib sebelum server start)
- `start`: jalankan `tsx src/index.ts` via pnpm filter

- [ ] **Step 3: Buat `webapp/vercel.json`**

Buat file baru `D:\personal\BakersGo\webapp\vercel.json`:

```json
{
  "installCommand": "cd .. && pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build",
  "framework": "nextjs"
}
```

- `installCommand`: `cd ..` dari `webapp/` ke monorepo root, lalu install semua workspace packages sehingga `@bakersgo/types` ter-resolve
- `buildCommand`: `pnpm build` dijalankan dari `webapp/` (Next.js build)

- [ ] **Step 4: Verify TypeScript backend tidak ada error baru**

```powershell
cd backend
pnpm tsc --noEmit
```

Expected: tidak ada error baru. Kalau ada error terkait `directUrl` — pastikan versi Prisma mendukung (sudah `^7.8.0`, aman).

- [ ] **Step 5: Commit dan push ke main**

```bash
git add backend/prisma/schema.prisma nixpacks.toml webapp/vercel.json
git commit -m "chore: add Railway nixpacks config, Vercel config, and Prisma directUrl for Neon"
git push origin main
```

Expected: push sukses, GitHub menerima commit.

---

## Task 2: Neon — Ambil Connection Strings

> **Manual step — lakukan di browser**

- [ ] **Step 1: Buka Neon dashboard**

Buka [console.neon.tech](https://console.neon.tech) → pilih project BakersGo → klik **Connection Details**.

- [ ] **Step 2: Copy DATABASE_URL (pooled)**

Di bagian **Connection string**, pastikan toggle **Pooled connection** aktif (ON). Copy string-nya, format:
```
postgresql://user:password@ep-xxx.sin1.neon.tech/neondb?sslmode=require
```
Simpan sebagai `DATABASE_URL`.

- [ ] **Step 3: Copy DIRECT_URL (direct)**

Toggle ke **Direct connection** (non-pooled). Copy string-nya, format:
```
postgresql://user:password@ep-xxx.sin1.neon.tech/neondb?sslmode=require
```
(URL hampir sama tapi endpoint berbeda — tidak ada `-pooler` di hostname). Simpan sebagai `DIRECT_URL`.

---

## Task 3: Railway — Setup Project dan Deploy Backend

> **Manual step — lakukan di browser**

- [ ] **Step 1: Buat Railway project**

Buka [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pilih repo `BakersGo` → klik **Deploy Now**.

Railway akan otomatis detect `nixpacks.toml` dan mulai build pertama.

- [ ] **Step 2: Isi environment variables di Railway**

Di Railway dashboard → project → service → tab **Variables** → **Raw Editor**, paste:

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET=ganti-ini-dengan-string-random-minimal-32-karakter-contoh-abc123xyz
NODE_ENV=production
PORT=3000
```

> `CORS_ORIGIN` **belum diisi** — akan diisi setelah Vercel URL diketahui (Task 5).

Klik **Update Variables** → Railway akan trigger redeploy.

- [ ] **Step 3: Tunggu deploy sukses dan verifikasi**

Di Railway → tab **Deployments** → tunggu status berubah menjadi **Active** (hijau).

Setelah aktif, buka tab **Settings** → **Networking** → klik **Generate Domain** jika belum ada. Copy Railway public URL, format:
```
https://bakersgo-production-xxxx.up.railway.app
```

Test health endpoint di browser atau terminal:
```powershell
curl https://bakersgo-production-xxxx.up.railway.app/health
```

Expected response:
```json
{"status":"ok","ts":1234567890}
```

Jika dapat response ini, backend Railway sudah berjalan. Simpan URL ini sebagai `RAILWAY_URL`.

---

## Task 4: Jalankan Prisma Migrations ke Neon

- [ ] **Step 1: Set environment variables di terminal local**

Buka PowerShell baru di `D:\personal\BakersGo\backend`:

```powershell
$env:DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
$env:DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

Gunakan **DIRECT_URL** (non-pooled) untuk kedua variabel — migrations butuh direct connection.

- [ ] **Step 2: Jalankan migrate deploy**

```powershell
npx prisma migrate deploy
```

Expected output:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb"

N migrations found in prisma/migrations
N migrations applied:
  - 20xxxxxx_init
  ...
All migrations have been applied.
```

- [ ] **Step 3: Verifikasi tabel sudah ada di Neon**

```powershell
npx prisma studio
```

Buka `http://localhost:5555` → pastikan tabel `User`, `Ingredient`, `Recipe`, `Expense`, `Sale`, `HppEntry` muncul. Tutup Prisma Studio setelah verifikasi.

---

## Task 5: Vercel — Setup Project dan Deploy Webapp

> **Manual step — lakukan di browser**

- [ ] **Step 1: Buat Vercel project**

Buka [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository** → pilih repo `BakersGo`.

- [ ] **Step 2: Konfigurasi project**

Di halaman konfigurasi:
- **Framework Preset**: Next.js (auto-detect)
- **Root Directory**: klik **Edit** → ketik `webapp` → klik **Continue**
- **Build and Output Settings**: biarkan default (vercel.json akan override otomatis)

- [ ] **Step 3: Tambah environment variable**

Di bagian **Environment Variables**:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://bakersgo-production-xxxx.up.railway.app` (Railway URL dari Task 3) |

- [ ] **Step 4: Deploy**

Klik **Deploy** → tunggu build selesai (biasanya 2-3 menit).

Setelah selesai, copy **Vercel URL**, format:
```
https://bakersgo-xxxx.vercel.app
```

- [ ] **Step 5: Smoke test webapp**

Buka Vercel URL di browser → pastikan halaman login muncul → coba login dengan akun yang sudah ada.

---

## Task 6: Wiring Final — CORS dan Verifikasi End-to-End

- [ ] **Step 1: Update CORS_ORIGIN di Railway**

Buka Railway dashboard → service → **Variables** → tambah variable baru:

```
CORS_ORIGIN=https://bakersgo-xxxx.vercel.app
```

Klik **Update Variables** → Railway auto-restart (sekitar 30 detik).

- [ ] **Step 2: Verifikasi CORS preflight berhasil**

Di PowerShell:

```powershell
curl -s -o $null -w "%{http_code}" -X OPTIONS "https://bakersgo-production-xxxx.up.railway.app/ingredients" -H "Origin: https://bakersgo-xxxx.vercel.app" -H "Access-Control-Request-Method: PUT" -H "Access-Control-Request-Headers: authorization,content-type"
```

Expected: `204` (preflight sukses).

- [ ] **Step 3: End-to-end smoke test**

Buka webapp Vercel → lakukan checklist berikut:

1. Login berhasil (tidak ada error network)
2. Halaman **Master Bahan** — data muncul, tambah bahan baru berhasil
3. Halaman **Master Resep** — data muncul, edit resep berhasil
4. Halaman **Pengeluaran** — tambah pengeluaran berhasil
5. Halaman **Penjualan** — tambah penjualan berhasil
6. **Dashboard** — angka summary muncul (tidak semua nol jika ada data)

Jika semua berjalan, deployment selesai.

- [ ] **Step 4: Verifikasi auto-deploy**

Buat perubahan kecil di repo (misalnya komentar di file apapun), commit dan push ke `main`:

```bash
git commit --allow-empty -m "test: verify auto-deploy Railway and Vercel"
git push origin main
```

Cek Railway → **Deployments** — deployment baru muncul otomatis.
Cek Vercel → **Deployments** — deployment baru muncul otomatis.

---

## Self-Review: Spec Coverage

| Requirement | Task | Status |
|-------------|------|--------|
| `directUrl` di schema.prisma | Task 1 | ✅ |
| `nixpacks.toml` untuk Railway | Task 1 | ✅ |
| `vercel.json` untuk Vercel monorepo | Task 1 | ✅ |
| Neon connection strings | Task 2 | ✅ |
| Railway project + env vars + deploy | Task 3 | ✅ |
| Prisma migrations ke Neon | Task 4 | ✅ |
| Vercel project + env vars + deploy | Task 5 | ✅ |
| CORS_ORIGIN diisi dengan Vercel URL | Task 6 | ✅ |
| Auto-deploy dari main verified | Task 6 | ✅ |
| Health endpoint test | Task 3 | ✅ |
| End-to-end CRUD test | Task 6 | ✅ |
