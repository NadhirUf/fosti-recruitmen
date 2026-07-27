import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RegistrationInput, RegistrationRecord } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, "..", "data");
const DB_PATH = join(DB_DIR, "fosti.db");

mkdirSync(DB_DIR, { recursive: true });

// node:sqlite bersifat SYNCHRONOUS. Ini justru menguntungkan untuk kasus
// pendaftaran: setiap write otomatis ter-serialize satu-persatu oleh Node
// event loop, jadi kita TIDAK PERLU mutex/lock manual untuk mencegah race
// condition saat banyak peserta submit form bersamaan (lihat load-test/).
export const db = new DatabaseSync(DB_PATH);

// journal_mode WAL supaya banyak pembacaan (GET /api/stats) tidak
// memblokir proses tulis (POST /api/register), dan sebaliknya.
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA synchronous = NORMAL;");
db.exec("PRAGMA busy_timeout = 5000;");

db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_lengkap    TEXT NOT NULL,
    nim             TEXT NOT NULL UNIQUE,
    email           TEXT NOT NULL UNIQUE,
    whatsapp        TEXT NOT NULL,
    program_studi   TEXT NOT NULL,
    alamat_domisili TEXT NOT NULL,
    ip_address      TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_registrations_created_at
  ON registrations (created_at);
`);

const insertStmt = db.prepare(`
  INSERT INTO registrations
    (nama_lengkap, nim, email, whatsapp, program_studi, alamat_domisili, ip_address)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const countStmt = db.prepare(`SELECT COUNT(*) AS total FROM registrations`);

const statsByProdiStmt = db.prepare(`
  SELECT program_studi AS programStudi, COUNT(*) AS total
  FROM registrations
  GROUP BY program_studi
  ORDER BY total DESC
`);

const allRegistrationsStmt = db.prepare(`
  SELECT id, nama_lengkap AS namaLengkap, nim, email, whatsapp,
         program_studi AS programStudi, alamat_domisili AS alamatDomisili,
         created_at AS createdAt
  FROM registrations
  ORDER BY created_at ASC
`);

const findByNimStmt = db.prepare(`SELECT id FROM registrations WHERE nim = ?`);
const findByEmailStmt = db.prepare(
  `SELECT id FROM registrations WHERE email = ?`,
);
const deleteByIdStmt = db.prepare(`DELETE FROM registrations WHERE id = ?`);

export class DuplicateError extends Error {
  constructor(public field: "nim" | "email") {
    super(`${field} sudah terdaftar`);
  }
}

export function insertRegistration(
  input: RegistrationInput,
  ipAddress: string,
): RegistrationRecord {
  // Cek duplikat lebih dulu supaya pesan error jelas field mana yang bentrok
  // (UNIQUE constraint di DB tetap jadi pengaman terakhir kalau ada race).
  if (findByNimStmt.get(input.nim)) throw new DuplicateError("nim");
  if (findByEmailStmt.get(input.email)) throw new DuplicateError("email");

  try {
    const info = insertStmt.run(
      input.namaLengkap,
      input.nim,
      input.email,
      input.whatsapp,
      input.programStudi,
      input.alamatDomisili,
      ipAddress,
    );

    return {
      id: Number(info.lastInsertRowid),
      ...input,
      ipAddress,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("registrations.nim")) throw new DuplicateError("nim");
    if (message.includes("registrations.email"))
      throw new DuplicateError("email");
    throw err;
  }
}

export function countRegistrations(): number {
  const row = countStmt.get() as { total: number };
  return row.total;
}

/** Rekap jumlah pendaftar per program studi, terurut dari yang terbanyak. */
export function getStatsByProdi(): { programStudi: string; total: number }[] {
  return statsByProdiStmt.all() as { programStudi: string; total: number }[];
}

/** Seluruh data pendaftar (dipakai untuk halaman admin & export CSV). */
export function getAllRegistrations(): RegistrationRecord[] {
  return allRegistrationsStmt.all() as unknown as RegistrationRecord[];
}
/** Hapus satu pendaftar berdasarkan id. Return true kalau ada baris yang kehapus. */
export function deleteRegistrationById(id: number): boolean {
  const info = deleteByIdStmt.run(id);
  return info.changes > 0;
}
