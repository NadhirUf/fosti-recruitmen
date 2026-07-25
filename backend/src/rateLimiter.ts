/**
 * Rate limiter in-memory berbasis sliding window per-IP.
 * Cukup untuk single-instance server. Kalau nanti di-scale jadi
 * multi-instance (load balancer + banyak pod), pindahkan state ini
 * ke Redis (INCR + EXPIRE) supaya limit-nya konsisten lintas instance.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 menit
const MAX_REQUESTS = 8; // maksimal 8 percobaan submit per menit per IP

export function isRateLimited(ip: string): {
  limited: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter(
    (t) => now - t < WINDOW_MS
  );

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    const oldest = bucket.timestamps[0];
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - oldest)) / 1000);
    buckets.set(ip, bucket);
    return { limited: true, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  buckets.set(ip, bucket);
  return { limited: false, retryAfterSeconds: 0 };
}

// Bersihkan bucket yang sudah lama tidak dipakai supaya Map tidak membengkak
// terus menerus saat server jalan lama (mencegah memory leak).
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of buckets.entries()) {
    bucket.timestamps = bucket.timestamps.filter(
      (t) => now - t < WINDOW_MS
    );
    if (bucket.timestamps.length === 0) buckets.delete(ip);
  }
}, WINDOW_MS).unref();
