# Backend Hosting Design — BakersGo

**Date:** 2026-05-22
**Scope:** Deploy backend Fastify ke Railway + PostgreSQL di Neon + webapp ke Vercel

---

## Goal

Membuat backend BakersGo bisa diakses secara publik dari webapp yang di-deploy di Vercel, dengan auto-deploy dari branch `main` di GitHub.

---

## Architecture

```
GitHub (main branch)
    │
    ├──▶ Railway (auto-deploy)
    │        └── Fastify backend (tsx, Node.js)
    │                └──▶ Neon PostgreSQL
    │
    └──▶ Vercel (auto-deploy)
             └── Next.js webapp
                     └──▶ Railway backend URL (NEXT_PUBLIC_API_URL)
```

- **Railway** — Node.js host untuk Fastify backend, auto-deploy dari `main`, monorepo root sebagai build context
- **Neon** — Serverless PostgreSQL, sudah dimiliki user, diakses via pooled + direct connection strings
- **Vercel** — Host Next.js webapp, auto-deploy dari `main`, root directory `webapp/`

---

## Code Changes

### 1. `backend/prisma/schema.prisma`

Tambah `directUrl` agar Prisma migrations bisa bypass Neon connection pooler:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 2. `nixpacks.toml` (root monorepo)

Railway menggunakan Nixpacks untuk build. File ini menginstruksikan Railway untuk install semua workspace packages dan start backend:

```toml
[phases.install]
cmds = ["pnpm install"]

[start]
cmd = "pnpm --filter backend start"
```

Backend start command (`pnpm --filter backend start`) menjalankan `tsx src/index.ts` — TypeScript di-transpile on-the-fly saat startup. Runtime performance identik dengan compiled JS.

### 3. `webapp/vercel.json`

Konfigurasi Vercel untuk monorepo — install dari root agar `@bakersgo/types` ter-resolve:

```json
{
  "buildCommand": "cd ../.. && pnpm --filter webapp build",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs"
}
```

---

## Environment Variables

### Railway (backend)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | Neon direct connection string |
| `JWT_SECRET` | Random string min 32 karakter |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `CORS_ORIGIN` | Vercel URL (diisi setelah Vercel deploy) |

### Vercel (webapp)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Railway public URL |

---

## Migration Strategy

Prisma migrations dijalankan **sekali dari local** setelah Railway dan Neon siap, menggunakan direct connection string dari Neon:

```powershell
cd backend
$env:DATABASE_URL="<neon-direct-url>"
$env:DIRECT_URL="<neon-direct-url>"
npx prisma migrate deploy
```

`prisma migrate deploy` (bukan `dev`) — hanya menerapkan migrations yang sudah ada, tidak membuat migration baru.

---

## Setup Order

Urutan ini penting — setiap step bergantung pada output step sebelumnya:

1. **Code changes** — tambah `directUrl` di schema, `nixpacks.toml`, `vercel.json` → commit & push ke `main`
2. **Neon** — copy pooled + direct connection strings dari dashboard
3. **Railway** — buat project, sambungkan GitHub, isi env vars, tunggu deploy sukses, copy Railway URL
4. **Migrations** — jalankan `prisma migrate deploy` dari local dengan Neon direct URL
5. **Vercel** — buat project, set root directory `webapp/`, isi `NEXT_PUBLIC_API_URL` = Railway URL, deploy, copy Vercel URL
6. **CORS** — isi `CORS_ORIGIN` di Railway dengan Vercel URL → Railway auto-restart

---

## Success Criteria

- `GET https://<railway-url>/health` mengembalikan `{ status: "ok" }`
- Login dari webapp Vercel berhasil (token diterima dari backend Railway)
- Semua CRUD (bahan, resep, HPP, pengeluaran, penjualan) berfungsi dari webapp Vercel
- Auto-deploy Railway terpicu setiap push ke `main`
- Auto-deploy Vercel terpicu setiap push ke `main`
