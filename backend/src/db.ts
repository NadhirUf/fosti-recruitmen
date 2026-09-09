import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RegistrationInput, RegistrationRecord } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, "..", "data");
const DB_PATH = join(DB_DIR, "fosti.db");

mkdirSync(DB_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);

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

// --- Migrasi: tambah kolom pelacak status email kalau belum ada ---
// Aman dijalankan tiap start server (dicek dulu pakai PRAGMA table_info
// supaya tidak error kalau kolomnya sudah pernah ditambahkan sebelumnya).
const existingColumns = (
  db.prepare("PRAGMA table_info(registrations)").all() as { name: string }[]
).map((c) => c.name);

if (!existingColumns.includes("email_status")) {
  // Default 'sent' untuk baris LAMA yang sudah ada (asumsi sudah pernah
  // dikirim/di-resend manual). Baris BARU akan eksplisit di-set 'pending'
  // oleh insertRegistration di bawah.
  db.exec(
    `ALTER TABLE registrations ADD COLUMN email_status TEXT NOT NULL DEFAULT 'sent'`,
  );
}
if (!existingColumns.includes("email_error")) {
  db.exec(`ALTER TABLE registrations ADD COLUMN email_error TEXT`);
}
if (!existingColumns.includes("email_sent_at")) {
  db.exec(`ALTER TABLE registrations ADD COLUMN email_sent_at TEXT`);
}

const insertStmt = db.prepare(`
  INSERT INTO registrations
    (nama_lengkap, nim, email, whatsapp, program_studi, alamat_domisili, ip_address, email_status)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
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
         created_at AS createdAt, email_status AS emailStatus,
         email_error AS emailError, email_sent_at AS emailSentAt
  FROM registrations
  ORDER BY created_at ASC
`);

const failedEmailsStmt = db.prepare(`
  SELECT id, nama_lengkap AS namaLengkap, nim, email, whatsapp,
         program_studi AS programStudi, alamat_domisili AS alamatDomisili,
         created_at AS createdAt, email_status AS emailStatus,
         email_error AS emailError, email_sent_at AS emailSentAt
  FROM registrations
  WHERE email_status != 'sent'
  ORDER BY created_at ASC
`);

const getByIdStmt = db.prepare(`
  SELECT id, nama_lengkap AS namaLengkap, nim, email, whatsapp,
         program_studi AS programStudi, alamat_domisili AS alamatDomisili,
         created_at AS createdAt, email_status AS emailStatus,
         email_error AS emailError, email_sent_at AS emailSentAt
  FROM registrations
  WHERE id = ?
`);

const updateEmailStatusStmt = db.prepare(`
  UPDATE registrations
  SET email_status = ?, email_error = ?, email_sent_at = ?
  WHERE id = ?
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

export function getStatsByProdi(): { programStudi: string; total: number }[] {
  return statsByProdiStmt.all() as { programStudi: string; total: number }[];
}

export function getAllRegistrations(): RegistrationRecord[] {
  return allRegistrationsStmt.all() as unknown as RegistrationRecord[];
}

export function getFailedEmailRegistrations(): RegistrationRecord[] {
  return failedEmailsStmt.all() as unknown as RegistrationRecord[];
}

export function getRegistrationById(
  id: number,
): RegistrationRecord | undefined {
  return getByIdStmt.get(id) as unknown as RegistrationRecord | undefined;
}

export function updateEmailStatus(
  id: number,
  status: "sent" | "failed",
  error: string | null,
): void {
  updateEmailStatusStmt.run(status, error, new Date().toISOString(), id);
}

export function deleteRegistrationById(id: number): boolean {
  const info = deleteByIdStmt.run(id);
  return info.changes > 0;
}
