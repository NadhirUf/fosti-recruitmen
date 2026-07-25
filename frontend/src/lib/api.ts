import type {
  RegistrationFormData,
  ValidationError,
} from "../types/registration";

// Saat development, Vite proxy meneruskan /api ke backend (lihat vite.config.ts).
// Saat production, set VITE_API_URL ke domain backend yang sesungguhnya.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export type RegisterResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: ValidationError[] };

export async function submitRegistration(
  payload: RegistrationFormData
): Promise<RegisterResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.json();

    if (res.ok && body.success) {
      return { ok: true };
    }

    if (Array.isArray(body.errors)) {
      return {
        ok: false,
        message: "Periksa kembali data yang kamu isi.",
        fieldErrors: body.errors as ValidationError[],
      };
    }

    return {
      ok: false,
      message: body.errors ?? "Gagal mengirim pendaftaran. Coba lagi.",
    };
  } catch {
    return {
      ok: false,
      message:
        "Tidak bisa terhubung ke server. Periksa koneksi internet kamu dan coba lagi.",
    };
  }
}
