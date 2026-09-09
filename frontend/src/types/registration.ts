export type KategoriPendaftar = "mahasiswa" | "umum";

export interface RegistrationFormData {
  kategori: KategoriPendaftar;
  namaLengkap: string;
  nim: string;
  email: string;
  whatsapp: string;
  programStudi: string;
  alamatDomisili: string;
}

export interface ValidationError {
  field: keyof RegistrationFormData;
  message: string;
}

export type RegistrationFieldErrors = Partial<
  Record<keyof RegistrationFormData, string>
>;
