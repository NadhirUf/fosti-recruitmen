import { useState, type FormEvent } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { submitRegistration } from "../lib/api";
import { FACULTIES } from "../data/prodi";
import type {
  RegistrationFieldErrors,
  RegistrationFormData,
} from "../types/registration";

const EMPTY_FORM: RegistrationFormData = {
  namaLengkap: "",
  nim: "",
  email: "",
  whatsapp: "",
  programStudi: "",
  alamatDomisili: "",
};

type Status = "idle" | "submitting" | "success" | "error";

export default function RegistrationForm() {
  const formRef = useScrollReveal<HTMLDivElement>();
  const [form, setForm] = useState<RegistrationFormData>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<RegistrationFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  // Fakultas cuma dipakai buat MENYARING pilihan prodi di dropdown kedua,
  // nilai yang dikirim ke server tetap cuma nama prodi (form.programStudi)
  // -> struktur data & backend gak perlu berubah.
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const prodiOptions =
    FACULTIES.find((f) => f.name === selectedFaculty)?.prodi ?? [];

  function update<K extends keyof RegistrationFormData>(
    key: K,
    value: RegistrationFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setFieldErrors({});
    setMessage("");

    const result = await submitRegistration(form);

    if (result.ok) {
      setStatus("success");
      setMessage("Pendaftaran berhasil dikirim. Sampai jumpa di FOSTI! 🎉");
      setForm(EMPTY_FORM);
      setSelectedFaculty("");
      return;
    }

    setStatus("error");
    setMessage(result.message);
    if (result.fieldErrors) {
      const mapped: RegistrationFieldErrors = {};
      for (const err of result.fieldErrors) {
        mapped[err.field] = err.message;
      }
      setFieldErrors(mapped);
    }
  }

  return (
    <section id="pendaftaran" className="px-6 py-24">
      <div
        ref={formRef}
        className="reveal mx-auto max-w-2xl rounded-3xl border border-base-border bg-base-panel/60 p-8 sm:p-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-red">
          Pendaftaran
        </p>
        <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
          Isi formulir pendaftaran
        </h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Nama Lengkap"
              placeholder="Charles Leclerc"
              value={form.namaLengkap}
              onChange={(v) => update("namaLengkap", v)}
              error={fieldErrors.namaLengkap}
              autoComplete="name"
            />
            <Field
              label="NIM"
              placeholder="Contoh: A2000222"
              value={form.nim}
              onChange={(v) =>
                update(
                  "nim",
                  v
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 15),
                )
              }
              error={fieldErrors.nim}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Email Aktif"
              placeholder="L2xxxxxxxx@student.ums.ac.id"
              value={form.email}
              onChange={(v) => update("email", v)}
              error={fieldErrors.email}
              type="email"
              autoComplete="email"
            />
            <Field
              label="No. WhatsApp"
              placeholder="08xxxxxxxxxx"
              value={form.whatsapp}
              onChange={(v) =>
                update("whatsapp", v.replace(/\D/g, "").slice(0, 14))
              }
              error={fieldErrors.whatsapp}
              inputMode="tel"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Fakultas"
              placeholder="Pilih fakultas kamu"
              value={selectedFaculty}
              onChange={(v) => {
                setSelectedFaculty(v);
                update("programStudi", ""); // reset prodi tiap ganti fakultas
              }}
              options={FACULTIES.map((f) => f.name)}
            />
            <Select
              label="Program Studi"
              placeholder={
                selectedFaculty ? "Pilih program studi" : "Pilih fakultas dulu"
              }
              value={form.programStudi}
              onChange={(v) => update("programStudi", v)}
              options={prodiOptions}
              disabled={!selectedFaculty}
              error={fieldErrors.programStudi}
            />
          </div>

          <Field
            label="Alamat Domisili"
            placeholder="Kota kamu"
            value={form.alamatDomisili}
            onChange={(v) => update("alamatDomisili", v)}
            error={fieldErrors.alamatDomisili}
          />

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-xl bg-brand-red py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Mengirim..." : "Kirim Pendaftaran"}
          </button>

          {message && (
            <p
              role="status"
              className={`text-center text-sm ${
                status === "success" ? "text-green-400" : "text-brand-red"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  inputMode?:
    | "text"
    | "numeric"
    | "tel"
    | "email"
    | "search"
    | "none"
    | "decimal"
    | "url";
  autoComplete?: string;
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  autoComplete,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
        {label}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-brand-red ${
          error ? "border-brand-red" : "border-white/10"
        }`}
      />
      {error && (
        <span className="mt-1 block text-xs text-brand-red">{error}</span>
      )}
    </label>
  );
}

interface SelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
  disabled?: boolean;
}

function Select({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
  disabled,
}: SelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/50">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-brand-red disabled:cursor-not-allowed disabled:opacity-40 ${
          error ? "border-brand-red" : "border-white/10"
        } ${value ? "text-white" : "text-white/30"}`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-base-panel text-white">
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <span className="mt-1 block text-xs text-brand-red">{error}</span>
      )}
    </label>
  );
}
