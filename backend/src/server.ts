// HARUS baris pertama: baca file .env dan isi ke process.env sebelum modul
// lain (db.ts, notify.ts, dst) sempat membaca process.env.X miliknya.
import "dotenv/config";

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRegistration } from "./validators.js";
import {
  insertRegistration,
  countRegistrations,
  getStatsByProdi,
  getAllRegistrations,
  DuplicateError,
} from "./db.js";
import { isRateLimited } from "./rateLimiter.js";
import { notifyNewRegistration } from "./notify.js";
import type { ApiResponse, RegistrationRecord } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 4000);
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? "*";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";
const MAX_BODY_BYTES = 10_000; // batas ukuran body -> cegah payload raksasa/DoS sederhana

function setCors(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson<T>(res: ServerResponse, status: number, body: ApiResponse<T>) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(payload);
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });

    req.on("error", reject);
  });
}

async function handleRegister(req: IncomingMessage, res: ServerResponse) {
  const ip = getClientIp(req);

  const { limited, retryAfterSeconds } = isRateLimited(ip);
  if (limited) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return sendJson(res, 429, {
      success: false,
      errors: `Terlalu banyak percobaan. Coba lagi dalam ${retryAfterSeconds} detik.`,
    });
  }

  let body: unknown;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "PAYLOAD_TOO_LARGE") {
      return sendJson(res, 413, { success: false, errors: "Payload terlalu besar" });
    }
    return sendJson(res, 400, { success: false, errors: "JSON tidak valid" });
  }

  const result = validateRegistration(body);
  if (!result.valid || !result.data) {
    return sendJson(res, 422, { success: false, errors: result.errors });
  }

  try {
    const record: RegistrationRecord = insertRegistration(result.data, ip);
    // Fire-and-forget: gagal kirim notifikasi TIDAK boleh menggagalkan
    // pendaftaran itu sendiri (data sudah aman tersimpan di DB).
    notifyNewRegistration(record).catch((err) =>
      console.error("[notify] gagal kirim notifikasi:", err)
    );
    return sendJson(res, 201, { success: true, data: record });
  } catch (err) {
    if (err instanceof DuplicateError) {
      return sendJson(res, 409, {
        success: false,
        errors:
          err.field === "nim"
            ? "NIM ini sudah pernah mendaftar."
            : "Email ini sudah pernah mendaftar.",
      });
    }
    console.error("[register] gagal menyimpan pendaftaran:", err);
    return sendJson(res, 500, {
      success: false,
      errors: "Terjadi kesalahan di server. Coba lagi beberapa saat lagi.",
    });
  }
}

function handleHealth(_req: IncomingMessage, res: ServerResponse) {
  sendJson(res, 200, { success: true, data: { status: "ok", uptime: process.uptime() } });
}

function handleStats(_req: IncomingMessage, res: ServerResponse) {
  sendJson(res, 200, { success: true, data: { totalPendaftar: countRegistrations() } });
}

/** Cek header `Authorization: Bearer <ADMIN_TOKEN>`. Kalau ADMIN_TOKEN belum
    di-set di .env, admin endpoint otomatis TERKUNCI (fail-safe, bukan fail-open). */
function isAdminAuthorized(req: IncomingMessage): boolean {
  if (!ADMIN_TOKEN) return false;
  const header = req.headers["authorization"];
  return header === `Bearer ${ADMIN_TOKEN}`;
}

function handleAdminStats(req: IncomingMessage, res: ServerResponse) {
  if (!isAdminAuthorized(req)) {
    return sendJson(res, 401, { success: false, errors: "Unauthorized" });
  }
  const byProdi = getStatsByProdi();
  const total = countRegistrations();
  return sendJson(res, 200, { success: true, data: { total, byProdi } });
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function handleAdminExport(req: IncomingMessage, res: ServerResponse) {
  if (!isAdminAuthorized(req)) {
    return sendJson(res, 401, { success: false, errors: "Unauthorized" });
  }
  const rows = getAllRegistrations();
  const header = [
    "id", "namaLengkap", "nim", "email", "whatsapp",
    "programStudi", "alamatDomisili", "createdAt",
  ];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      header.map((key) => csvEscape(String((r as any)[key] ?? ""))).join(",")
    ),
  ];
  const csv = lines.join("\n");
  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="pendaftar-fosti-${new Date().toISOString().slice(0, 10)}.csv"`,
  });
  res.end(csv);
}

const server = createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  try {
    if (req.method === "POST" && url.pathname === "/api/register") {
      return await handleRegister(req, res);
    }
    if (req.method === "GET" && url.pathname === "/api/health") {
      return handleHealth(req, res);
    }
    if (req.method === "GET" && url.pathname === "/admin") {
      const html = readFileSync(join(__dirname, "..", "admin.html"), "utf-8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    }
    if (req.method === "GET" && url.pathname === "/api/stats") {
      return handleStats(req, res);
    }
    if (req.method === "GET" && url.pathname === "/api/admin/stats") {
      return handleAdminStats(req, res);
    }
    if (req.method === "GET" && url.pathname === "/api/admin/export") {
      return handleAdminExport(req, res);
    }
    return sendJson(res, 404, { success: false, errors: "Endpoint tidak ditemukan" });
  } catch (err) {
    console.error("[server] unhandled error:", err);
    return sendJson(res, 500, { success: false, errors: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`FOSTI backend jalan di http://localhost:${PORT}`);
  console.log(`  POST /api/register`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/stats`);
  console.log(`  GET  /api/admin/stats   (butuh header Authorization: Bearer <ADMIN_TOKEN>)`);
  console.log(`  GET  /api/admin/export  (butuh header Authorization: Bearer <ADMIN_TOKEN>)`);
});

// Graceful shutdown supaya request yang sedang berjalan tidak terputus
// paksa saat deploy ulang / container di-restart.
process.on("SIGTERM", () => {
  console.log("SIGTERM diterima, menutup server...");
  server.close(() => process.exit(0));
});
