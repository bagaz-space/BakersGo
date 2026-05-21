# Panduan Test BakersGo Mobile di HP Android

## Prasyarat

- HP Android dengan **Expo Go** terinstall ([download di Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Laptop dan HP terhubung ke **WiFi yang sama**
- Node.js dan pnpm sudah terinstall di laptop

---

## Langkah 1: Cari IP Laptop

Buka PowerShell dan jalankan:

```powershell
ipconfig
```

Cari bagian adapter WiFi, catat **IPv4 Address** — contoh: `192.168.1.10`

---

## Langkah 2: Jalankan Backend

Buka terminal pertama:

```bash
cd backend
pnpm dev
```

Pastikan muncul output seperti:
```
Server listening at http://0.0.0.0:3000
```

> Backend harus binding ke `0.0.0.0` (bukan `127.0.0.1`) agar bisa diakses dari HP.
> Cek `backend/src/index.ts` — pastikan `host: '0.0.0.0'` di config server.

---

## Langkah 3: Jalankan Expo

Buka terminal kedua (ganti IP sesuai hasil `ipconfig`):

```powershell
cd mobile
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:3000"
npx expo start
```

Akan muncul QR code di terminal.

---

## Langkah 4: Buka di HP

1. Buka app **Expo Go** di HP Android
2. Tap **"Scan QR Code"**
3. Scan QR code yang muncul di terminal
4. App BakersGo akan ter-load di HP

---

## Jika Koneksi Gagal

### Cek firewall Windows (jalankan PowerShell sebagai Administrator):

```powershell
netsh advfirewall firewall add rule name="BakersGo Backend 3000" dir=in action=allow protocol=TCP localport=3000
```

### Cek apakah backend bisa diakses dari HP:

Buka browser di HP, akses: `http://192.168.1.10:3000/health`

Jika muncul response JSON, backend sudah bisa diakses. Jika tidak, cek firewall di atas.

### Gunakan mode Tunnel (jika tetap gagal):

```powershell
cd mobile
$env:EXPO_PUBLIC_API_URL="http://192.168.1.10:3000"
npx expo start --tunnel
```

Mode tunnel menggunakan ngrok untuk membuat URL publik sementara — HP tidak perlu satu WiFi dengan laptop, tapi backend tetap harus bisa diakses dari HP.

---

## Catatan Penting

| Situasi | Yang Perlu Diubah |
|---|---|
| Ganti jaringan WiFi | Update `EXPO_PUBLIC_API_URL` dengan IP baru |
| Gunakan hotspot HP | IP laptop di jaringan hotspot biasanya `192.168.43.x` |
| Pakai device fisik + emulator bersamaan | Emulator pakai `10.0.2.2:3000`, device fisik pakai IP lokal |

---

## Alur Test Manual

Setelah app terbuka di HP, test fitur berikut secara berurutan:

1. **Register** — buat akun baru dengan email, userId, brandName, password
2. **Login** — masuk dengan akun yang baru dibuat
3. **Dashboard** — pastikan summary cards tampil (mungkin semua 0 untuk akun baru)
4. **Master Bahan** — tambah bahan, edit, hapus
5. **Master Resep** — tambah resep dengan minimal 1 bahan, edit, hapus
6. **HPP Calculator** — pilih resep, isi biaya, save, edit
7. **Transaksi Penjualan** — input penjualan (coba autofill dari HPP)
8. **Transaksi Pengeluaran** — input pengeluaran harian
9. **Laporan** — pastikan data transaksi muncul di chart dan tabel
10. **Dashboard** — kembali ke beranda, pastikan angka summary sudah terupdate
11. **Logout** — pastikan kembali ke halaman login

---

## Hot Reload

Setelah app berjalan di HP, perubahan kode di laptop akan otomatis ter-reload di HP tanpa perlu scan QR ulang. Cukup save file di editor.

Untuk force reload manual: **shake HP** → tap "Reload"
