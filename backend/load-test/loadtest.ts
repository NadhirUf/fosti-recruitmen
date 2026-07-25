/**
 * Load test sederhana untuk endpoint POST /api/register.
 * Tidak pakai library eksternal (k6/autocannon dll) supaya bisa langsung
 * dijalankan dengan `npm run loadtest` tanpa install apa-apa lagi.
 *
 * Cara pakai:
 *   1. Jalankan backend: npm run dev
 *   2. Di terminal lain: npm run loadtest
 *
 * Bisa atur jumlah "peserta" & concurrency lewat env var:
 *   TOTAL=2000 CONCURRENCY=100 npm run loadtest
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4000";
const TOTAL = Number(process.env.TOTAL ?? 1000);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 50);

interface Result {
  ok: boolean;
  status: number;
  durationMs: number;
  reason: "success" | "duplicate" | "rate_limited" | "validation" | "error";
}

function randomNim(i: number): string {
  // 10 digit, dibuat unik per-request
  return String(2200000000 + i).padStart(10, "0");
}

function buildPayload(i: number) {
  return {
    namaLengkap: `Peserta Uji Coba ${i}`,
    nim: randomNim(i),
    email: `l${String(i).padStart(9, "0")}@student.ums.ac.id`,
    whatsapp: "0812" + String(10000000 + (i % 89999999)).padStart(8, "0"),
    programStudi: "Informatika",
    alamatDomisili: "Surakarta",
  };
}

function fakeIpFor(i: number): string {
  // Setiap "peserta" disimulasikan datang dari IP berbeda (device/wifi
  // masing-masing), supaya rate limiter per-IP tidak menganggap semua
  // peserta sebagai satu orang yang spam. Server membaca ini lewat
  // header X-Forwarded-For (umum dipakai di belakang reverse proxy).
  const n = i % 65000;
  return `10.${Math.floor(n / 65025) % 255}.${Math.floor(n / 255) % 255}.${n % 255}`;
}

async function sendOne(i: number): Promise<Result> {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": fakeIpFor(i),
      },
      body: JSON.stringify(buildPayload(i)),
    });
    const durationMs = performance.now() - start;

    let reason: Result["reason"] = "error";
    if (res.status === 201) reason = "success";
    else if (res.status === 409) reason = "duplicate";
    else if (res.status === 429) reason = "rate_limited";
    else if (res.status === 422) reason = "validation";

    return { ok: res.status === 201, status: res.status, durationMs, reason };
  } catch {
    return {
      ok: false,
      status: 0,
      durationMs: performance.now() - start,
      reason: "error",
    };
  }
}

// Jalankan request dalam batch-batch seukuran CONCURRENCY, meniru
// gelombang peserta yang submit form dalam waktu yang berdekatan
// (mis. beberapa menit setelah pengumuman recruitment dibuka).
async function runLoadTest() {
  console.log(
    `Menjalankan load test: ${TOTAL} pendaftar, concurrency ${CONCURRENCY}, target ${BASE_URL}`
  );

  const results: Result[] = [];
  const overallStart = performance.now();

  for (let batchStart = 0; batchStart < TOTAL; batchStart += CONCURRENCY) {
    const batchEnd = Math.min(batchStart + CONCURRENCY, TOTAL);
    const batch = [];
    for (let i = batchStart; i < batchEnd; i++) {
      batch.push(sendOne(i));
    }
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);

    process.stdout.write(
      `\r  progress: ${results.length}/${TOTAL}`
    );
  }

  const overallDurationMs = performance.now() - overallStart;
  console.log("\n\nSelesai. Hasil:\n");

  const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const p = (pct: number) =>
    durations[Math.min(durations.length - 1, Math.floor((pct / 100) * durations.length))];

  const byReason = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.reason] = (acc[r.reason] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`  Total request       : ${results.length}`);
  console.log(`  Durasi total         : ${(overallDurationMs / 1000).toFixed(2)} s`);
  console.log(`  Throughput           : ${(results.length / (overallDurationMs / 1000)).toFixed(1)} req/s`);
  console.log(`  Sukses (201)         : ${byReason.success ?? 0}`);
  console.log(`  Duplikat (409)       : ${byReason.duplicate ?? 0}`);
  console.log(`  Rate-limited (429)   : ${byReason.rate_limited ?? 0}`);
  console.log(`  Validasi gagal (422) : ${byReason.validation ?? 0}`);
  console.log(`  Error lain           : ${byReason.error ?? 0}`);
  console.log(`  Latency p50          : ${p(50).toFixed(1)} ms`);
  console.log(`  Latency p95          : ${p(95).toFixed(1)} ms`);
  console.log(`  Latency p99          : ${p(99).toFixed(1)} ms`);
  console.log(`  Latency max          : ${durations[durations.length - 1].toFixed(1)} ms`);
}

runLoadTest().catch((err) => {
  console.error("Load test gagal jalan:", err);
  process.exit(1);
});
