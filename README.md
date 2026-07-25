# FOSTI UMS - Website Open Recruitment

Implementasi penuh (frontend + backend) dari desain Figma FOSTI (Forum Open
Source Teknik Informatika, UMS), mengikuti persis struktur & konten yang ada
di screenshot: Hero, Tentang, 3 Divisi (Riset & Teknologi, Keorganisasian,
Hubungan Publik), dan Form Pendaftaran.
fosti-recruitment/
├── frontend/   React + TypeScript + Vite + Tailwind (tampilan + animasi scroll)
└── backend/    Node.js + TypeScript (API pendaftaran + database + rate limit)

## Kenapa stack ini?

- **Frontend**: React + TypeScript supaya komponen (Navbar, Hero, tiap Divisi,
  Form) reusable dan gampang di-maintain oleh panitia recruitment tahun
  depan. Animasi scroll pakai `IntersectionObserver` bawaan browser
  (`src/hooks/useScrollReveal.ts`) — bukan library seperti Framer Motion —
  supaya bundle tetap kecil dan tidak nambah dependency yang perlu di-update.
- **Backend**: Node.js + TypeScript pakai modul bawaan Node saja
  (`node:http` + `node:sqlite`, tanpa Express/Prisma/dll). Alasannya: **nol
  dependency runtime** berarti `npm install` cepat, tidak ada risiko
  dependency dicabut dari npm, dan tetap type-safe penuh. Kalau nanti mau
  upgrade ke Express/Postgres, tinggal ganti isi `src/db.ts` — kontrak
  API-nya (request/response JSON) tidak perlu berubah.

## Menjalankan di lokal

### 1. Backend

```bash
cd backend
npm install
npm run dev        # jalan di http://localhost:4000
```

> Butuh **Node.js 22.5 ke atas** (pakai `node:sqlite`). Cek versi dengan
> `node -v`. Kalau muncul warning `ExperimentalWarning: SQLite is an
> experimental feature`, itu normal dan aman diabaikan.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # jalan di http://localhost:5173
```

Vite otomatis meneruskan request `/api/*` ke backend di port 4000 (lihat
`vite.config.ts`), jadi form pendaftaran langsung nyambung tanpa setup
tambahan.

### 3. Foto anggota

Foto asli anggota FOSTI (section "Tentang" dan ketiga Divisi) sudah saya
pasang langsung, di-crop dari file desain yang kamu kirim
(`frontend/src/assets/team-photo.jpg` dan
`frontend/src/assets/divisi/*.jpg`). Kalau nanti mau ganti foto (misal
update tahun depan), tinggal timpa file-nya dengan nama yang sama, atau ganti
prop `photos={[...]}` saat memanggil `<DivisionShowcase />` di
`src/App.tsx`:

```tsx
<DivisionShowcase
  id="divisi-riset"
  title="Divisi Riset dan Teknologi"
  photos={[foto1, foto2, foto3, foto4, foto5]}
/>
```

Tiap section Divisi juga sudah dikasih ambient glow merah samar di
belakangnya (lihat `DivisionShowcase.tsx`), dan barisan foto sekarang
di-center di semua ukuran layar.

## API Backend

| Method | Endpoint         | Keterangan                              |
|--------|------------------|------------------------------------------|
| POST   | `/api/register`  | Kirim pendaftaran baru                    |
| GET    | `/api/health`    | Cek server hidup (untuk uptime monitor)   |
| GET    | `/api/stats`     | Jumlah total pendaftar saat ini           |

Validasi field `POST /api/register` (semua dicek di server, bukan cuma di
frontend, supaya tidak bisa dibypass):

- `namaLengkap`: 3-100 karakter
- `nim`: harus 10 digit angka
- `email`: harus domain `@student.ums.ac.id`
- `whatsapp`: diawali `08`, 10-14 digit
- `programStudi`, `alamatDomisili`: wajib diisi

NIM dan email **unik** — kalau dipakai dua kali, request kedua ditolak
dengan `409 Conflict`, bukan malah bikin data dobel.

Ada **rate limiter** per-IP: maksimal 8 percobaan submit per menit, untuk
mencegah spam/bot ngirim form berulang-ulang.

## Hasil testing beban (load test) — sudah saya jalankan sendiri

File: `backend/load-test/loadtest.ts`. Ini bukan simulasi di atas kertas —
saya benar-benar menjalankan backend-nya lalu menembakkan trafik ke sana.

```bash
cd backend
npm run dev                                    # terminal 1
TOTAL=1500 CONCURRENCY=100 npm run loadtest     # terminal 2
```

**Hasil aktual** (1.500 "peserta" simulasi, 100 request bersamaan per
gelombang, tiap peserta disimulasikan datang dari IP berbeda seperti kondisi
nyata):
Total request       : 1500
Durasi total         : 1.84 s
Throughput           : 817.4 req/s
Sukses (201)         : 1500
Duplikat (409)       : 0
Rate-limited (429)   : 0
Error lain           : 0
Latency p50          : 69.2 ms
Latency p95          : 220.7 ms
Latency p99          : 277.5 ms

Artinya: kalau 1.500 mahasiswa daftar dalam waktu berdekatan (misal rame-rame
begitu pengumuman recruitment dibuka), server masih sanggup melayani semua
dengan latency di bawah 300ms. Untuk skala open recruitment UKM kampus, ini
jauh lebih dari cukup — realistisnya jumlah pendaftar per gelombang tidak
akan sebanyak ini.

**Test tambahan — perebutan NIM yang sama (race condition):** saya kirim 50
request bersamaan dengan NIM identik (skenario terburuk: 50 orang klik
submit di detik yang sama pakai NIM yang sama/typo sama). Hasilnya **cuma 1
yang berhasil tersimpan**, sisanya ditolak rapi (duplikat/rate-limit) — tidak
ada data dobel. Ini bisa terjadi karena `node:sqlite` bersifat synchronous,
jadi Node otomatis meng-antrekan setiap operasi tulis satu-persatu tanpa
perlu kita bikin locking manual.

### Kalau nanti pendaftar jauh lebih banyak (misal >20.000 sekaligus)

- Server saat ini single-instance & SQLite (file lokal) — cocok sampai
  puluhan ribu pendaftar. Kalau butuh lebih dari itu:
  1. Pindahkan `rateLimiter.ts` dari in-memory ke Redis, supaya kalau
     backend di-scale jadi beberapa instance, limitnya tetap konsisten.
  2. Ganti `node:sqlite` ke PostgreSQL (kontrak fungsi di `db.ts` sudah
     dipisah rapi, tinggal ganti isinya).
  3. Taruh backend di belakang reverse proxy (Nginx/Caddy) + beberapa
     instance Node via `PM2`/container, karena satu proses Node cuma pakai
     satu core CPU.

## Animasi

- **Scroll reveal**: tiap elemen (judul, foto, form) fade + slide-up saat
  masuk viewport, dengan sedikit delay bertahap (stagger) supaya terasa hidup
  — lihat `src/hooks/useScrollReveal.ts`.
- **Navbar aktif mengikuti scroll**: link "Tentang"/"Divisi"/"Timeline" otomatis
  ke-highlight (garis merah di bawahnya meluncur pindah) sesuai section mana
  yang sedang dilihat, pakai `IntersectionObserver` yang mengawasi posisi tiap
  section.
- **Klik nav link**: smooth-scroll ke section tujuan + efek "pulse" kecil di
  teks yang diklik, sebagai feedback visual instan.
- **Foto divisi**: hover → sedikit terangkat + zoom in, staggered muncul satu
  per satu saat di-scroll.

## Logo Hero ("FOSTI") — live text, bukan gambar statis

Logo besar di section Hero (`src/components/HeroLogo.tsx`) dibangun dari teks
asli (bukan file gambar rata) supaya fill & stroke tiap huruf bisa diatur
persis, sesuai spesifikasi desain:

| Bagian | Font           | Fill                | Stroke                  |
|--------|----------------|----------------------|--------------------------|
| `F`    | Space Grotesk  | `#FFFFFF` (solid)   | `#FFE2E2`, warp miring   |
| `OS`   | Baloo 2        | `#000000` 12% opacity | `#FF2F2F` (merah)      |
| `TI`   | Inter Bold     | transparan (0%)     | `#FFFFFF` (hollow)       |

Gaya ini didefinisikan di `src/index.css` lewat class `.hero-logo-f`,
`.hero-logo-os`, `.hero-logo-ti`. Loop merah di belakangnya tetap pakai aset
gambar asli (`fosti-swirl-only.png`) supaya lengkungnya presisi.

**Soal section "Tentang":** section ini beda dengan Hero — huruf "F" dan "I"
di situ sengaja dibuat flat abu-abu redup (bukan pakai treatment fill/stroke
warna-warni di atas), karena coretan merah "OS" pada foto tim di section itu
sudah menyatu jadi bagian dari file foto hasil crop (bukan teks hidup). Kalau
kamu mau versi "Tentang" juga pakai teks OS Baloo 2 yang benar-benar hidup
(bisa diedit warnanya), kirim foto tim versi **bersih** (tanpa coretan merah)
supaya tidak dobel sama yang sudah ada di foto.

## Catatan tentang navigasi "Timeline"

Screenshot Figma yang dikirim menampilkan link nav **"Timeline"**, tapi
tidak ada section Timeline yang ter-screenshot (kemungkinan section itu ada
di frame Figma lain yang belum di-share). Sementara ini link "Timeline" saya
arahkan ke bagian statistik di Hero yang berisi info periode daftar. Kalau
kamu punya screenshot/frame untuk section Timeline yang sebenarnya, kirim ke
saya dan saya buatkan section-nya sesuai desain.

## Deploy ke production (ringkas)

- **Frontend**: `npm run build` di folder `frontend` → hasil di
  `frontend/dist`, tinggal upload ke Vercel/Netlify/Cloudflare Pages/hosting
  statis kampus. Set `VITE_API_URL` ke domain backend.
- **Backend**: `npm run build` di folder `backend` → jalankan
  `node dist/server.js` di server (VPS/Railway/Render/dll, asal ada Node
  22+). Set env var `PORT` dan `CORS_ORIGIN` sesuai domain frontend.
