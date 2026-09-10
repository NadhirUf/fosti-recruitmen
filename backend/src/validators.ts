import type { RegistrationInput, ValidationError } from "./types.js";
import { isFreeEmailAllowed } from "./db.js";

const NIM_REGEX = /^[A-Z0-9]{5,15}$/;
const EMAIL_REGEX_UMS = /^[a-zA-Z0-9._%+-]+@student\.ums\.ac\.id$/i;
const EMAIL_REGEX_UMUM = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const WHATSAPP_REGEX = /^08\d{8,12}$/;
const VALID_KATEGORI = new Set(["mahasiswa", "umum"]);

// Sinkron manual dengan frontend/src/data/prodi.ts (jenjang S1 saja).
const VALID_PRODI = new Set([
  "Hukum Ekonomi Syariah", "Ilmu Al-Quran dan Tafsir", "Pendidikan Agama Islam",
  "Akuntansi", "Bisnis Digital", "Ekonomi Pembangunan", "Manajemen",
  "Farmasi",
  "Geografi", "Sains Informasi Geografi",
  "Administrasi Publik", "Hubungan Internasional", "Ilmu Hukum",
  "Ilmu Gizi", "Fisioterapi", "Keperawatan", "Kesehatan Masyarakat",
  "Kedokteran",
  "Pendidikan Dokter Gigi",
  "Pendidikan Akuntansi", "Pendidikan Bahasa Inggris",
  "Pendidikan Bahasa dan Sastra Indonesia", "Pendidikan Biologi",
  "Pendidikan Geografi", "Pendidikan Guru PAUD",
  "Pendidikan Guru Sekolah Dasar (PGSD)", "Pendidikan Jasmani (Olahraga)",
  "Pendidikan Matematika", "Pendidikan Pancasila dan Kewarganegaraan",
  "Pendidikan Teknik Informatika",
  "Ilmu Komunikasi", "Kecerdasan Buatan", "Teknik Informatika", "Sistem Informasi",
  "Psikologi",
  "Arsitektur", "Teknik Elektro", "Teknik Industri", "Teknik Kimia",
  "Teknik Mesin", "Teknik Sipil",
]);

export function validateRegistration(body: unknown): {
  valid: boolean;
  errors: ValidationError[];
  data: RegistrationInput | null;
} {
  const errors: ValidationError[] = [];

  if (typeof body !== "object" || body === null) {
    return {
      valid: false,
      errors: [{ field: "namaLengkap", message: "Payload tidak valid" }],
      data: null,
    };
  }

  const b = body as Record<string, unknown>;

  const kategori = String(b.kategori ?? "").trim().toLowerCase();
  const namaLengkap = String(b.namaLengkap ?? "").trim();
  const nim = String(b.nim ?? "").trim().toUpperCase();
  const email = String(b.email ?? "").trim();
  const whatsapp = String(b.whatsapp ?? "").trim();
  const programStudi = String(b.programStudi ?? "").trim();
  const alamatDomisili = String(b.alamatDomisili ?? "").trim();

  if (!VALID_KATEGORI.has(kategori)) {
    errors.push({
      field: "kategori",
      message: "Pilih apakah email student UMS kamu sudah aktif atau belum",
    });
  }

  const isMahasiswa = kategori === "mahasiswa";

  // Kalau admin sudah menonaktifkan opsi "email bebas" (belum aktivasi),
  // request dengan kategori umum ditolak di sini -- pengecekan ini
  // dilakukan di server, jadi tidak bisa dilewati walau request dikirim
  // langsung tanpa lewat form (mis. lewat curl/Postman).
  if (!isMahasiswa && kategori === "umum" && !isFreeEmailAllowed()) {
    errors.push({
      field: "email",
      message:
        "Pendaftaran dengan email pribadi sedang tidak diizinkan. Gunakan email student UMS kamu.",
    });
  }

  if (namaLengkap.length < 3 || namaLengkap.length > 100) {
    errors.push({
      field: "namaLengkap",
      message: "Nama lengkap harus 3-100 karakter",
    });
  }

  if (isMahasiswa) {
    if (!NIM_REGEX.test(nim)) {
      errors.push({ field: "nim", message: "NIM harus 5-15 karakter, huruf/angka saja" });
    }
    if (!EMAIL_REGEX_UMS.test(email)) {
      errors.push({
        field: "email",
        message: "Email harus menggunakan domain @student.ums.ac.id",
      });
    }
  } else {
    if (!EMAIL_REGEX_UMUM.test(email)) {
      errors.push({
        field: "email",
        message: "Format email tidak valid",
      });
    }
  }

  if (!WHATSAPP_REGEX.test(whatsapp)) {
    errors.push({
      field: "whatsapp",
      message: "No. WhatsApp harus diawali 08 dan 10-14 digit",
    });
  }

  if (!VALID_PRODI.has(programStudi)) {
    errors.push({
      field: "programStudi",
      message: "Pilih program studi dari daftar yang tersedia",
    });
  }

  if (alamatDomisili.length < 2 || alamatDomisili.length > 200) {
    errors.push({
      field: "alamatDomisili",
      message: "Alamat domisili wajib diisi",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors, data: null };
  }

  return {
    valid: true,
    errors: [],
    data: {
      kategori: isMahasiswa ? "mahasiswa" : "umum",
      namaLengkap,
      nim: isMahasiswa ? nim : "",
      email,
      whatsapp,
      programStudi,
      alamatDomisili,
    },
  };
}
