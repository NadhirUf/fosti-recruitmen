/**
 * Kirim notifikasi konfirmasi pendaftaran lewat Email & WhatsApp.
 *
 * - Email  : Gmail SMTP (pakai akun fostiums.oprec@gmail.com) — atau Resend
 *            kalau GMAIL_* tidak di-set. Emailnya berisi tombol "klik buat
 *            konfirmasi ke CP lewat WhatsApp" (link wa.me dengan pesan yang
 *            sudah terisi otomatis), persis seperti email oprec sebelumnya.
 * - WhatsApp: Fonnte (https://fonnte.com) — opsional, buat kirim notifikasi
 *             WA otomatis DARI sistem (bukan tombol di email).
 *
 * Semuanya OPSIONAL: kalau kredensial belum di-set di .env, fungsi ini cuma
 * nge-log peringatan dan tidak melakukan apa-apa (tidak bikin error, tidak
 * menggagalkan proses pendaftaran).
 */

import nodemailer from "nodemailer";
import type { RegistrationRecord } from "./types.js";

const GMAIL_USER = process.env.GMAIL_USER ?? "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? "";
const GMAIL_SENDER_NAME = process.env.GMAIL_SENDER_NAME ?? "OprecFosti";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM = process.env.RESEND_FROM ?? "FOSTI UMS <onboarding@resend.dev>";

const FONNTE_TOKEN = process.env.FONNTE_TOKEN ?? "";

// Contact Person buat tombol konfirmasi WA di email. Nomor pakai format
// internasional TANPA "+" atau "0" di depan (contoh: 08586920xxxx -> 62858692xxxx).
const CP1_NAME = process.env.CP1_NAME ?? "";
const CP1_WHATSAPP = process.env.CP1_WHATSAPP ?? "";
const CP2_NAME = process.env.CP2_NAME ?? "";
const CP2_WHATSAPP = process.env.CP2_WHATSAPP ?? "";

/** Bikin link "click-to-chat" WhatsApp (wa.me) dengan pesan yang udah
    keisi otomatis, dipersonalisasi per pendaftar. */
function buildWaLink(cpName: string, cpNumber: string, record: RegistrationRecord): string {
  const message =
    `Assalamualaikum kak ${cpName}, Perkenalkan saya ${record.namaLengkap} ` +
    `dengan NIM ${record.nim} ingin konfirmasi bahwa saya telah melakukan ` +
    `registrasi Oprec FOSTI.\n\n` +
    `Berikut link kelengkapan berkas:\n` +
    `1. Foto KTM: *sertakan file berupa foto ktm kamu.`;
  return `https://wa.me/${cpNumber}?text=${encodeURIComponent(message)}`;
}

function waButton(label: string, href: string, color: string): string {
  return `
    <a href="${href}" target="_blank"
       style="display:block;background:${color};color:#ffffff;text-decoration:none;
              font-weight:bold;text-align:center;padding:14px 20px;border-radius:8px;
              margin-top:12px;font-family:sans-serif;">
      ${label}
    </a>`;
}

const gmailTransporter = GMAIL_USER && GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    })
  : null;

function emailHtml(record: RegistrationRecord): string {
  const cpButtons = [
    CP1_NAME && CP1_WHATSAPP
      ? waButton(`Konfirmasi ke Contact Person 1 (${CP1_NAME})`, buildWaLink(CP1_NAME, CP1_WHATSAPP, record), "#14b8a6")
      : "",
    CP2_NAME && CP2_WHATSAPP
      ? waButton(`Konfirmasi ke Contact Person 2 (${CP2_NAME})`, buildWaLink(CP2_NAME, CP2_WHATSAPP, record), "#e10664")
      : "",
  ].join("\n");

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <p>Halo ${record.namaLengkap},</p>
      <p>Selamat!!! kamu udah berhasil daftar di <strong>FOSTI</strong> dengan email
        ${record.email}! Selanjutnya kamu bisa join ke grup WA kita dengan cara
        konfirmasi ke CP yang tertera dan jangan lupa untuk follow sosmed kita
        biar ga ketinggalan update yaa!</p>

      ${cpButtons}

      <p style="margin-top:20px;">XOXO,<br/>Tim FOSTI</p>
    </div>
  `;
}

async function sendEmail(record: RegistrationRecord): Promise<void> {
  // Prioritas 1: Gmail (akun fostiums@gmail.com yang sudah ada)
  if (gmailTransporter) {
    await gmailTransporter.sendMail({
      from: `"${GMAIL_SENDER_NAME}" <${GMAIL_USER}>`,
      to: record.email,
      subject: "Selamat!!! kamu udah berhasil daftar di Fosti",
      html: emailHtml(record),
    });
    return;
  }

  // Prioritas 2 (fallback): Resend, kalau Gmail belum di-set
  if (!RESEND_API_KEY) {
    console.warn("[notify] GMAIL_* atau RESEND_API_KEY belum di-set, lewati kirim email");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: record.email,
      subject: "Selamat!!! kamu udah berhasil daftar di Fosti",
      html: emailHtml(record),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend gagal (${res.status}): ${body}`);
  }
}

async function sendWhatsApp(record: RegistrationRecord): Promise<void> {
  if (!FONNTE_TOKEN) {
    console.warn("[notify] FONNTE_TOKEN belum di-set, lewati kirim WhatsApp");
    return;
  }

  const message =
    `Halo ${record.namaLengkap}! 👋\n\n` +
    `Pendaftaran kamu ke *FOSTI UMS* sudah berhasil kami terima.\n` +
    `NIM: ${record.nim}\nProdi: ${record.programStudi}\n\n` +
    `Kami akan hubungi kamu lagi untuk info selanjutnya. Terima kasih!`;

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: FONNTE_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: record.whatsapp,
      message,
      countryCode: "62",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fonnte gagal (${res.status}): ${body}`);
  }
}

/** Dipanggil setelah data pendaftar berhasil disimpan ke DB. Fire-and-forget
    dari sisi caller — kegagalan di sini tidak boleh menggagalkan pendaftaran. */
export async function notifyNewRegistration(record: RegistrationRecord): Promise<void> {
  const results = await Promise.allSettled([sendEmail(record), sendWhatsApp(record)]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[notify] channel #${i} gagal:`, r.reason);
    }
  });
}
