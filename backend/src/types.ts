/**
 * Tipe data untuk domain pendaftaran FOSTI.
 */

export interface RegistrationInput {
  namaLengkap: string;
  nim: string;
  email: string;
  whatsapp: string;
  programStudi: string;
  alamatDomisili: string;
}

export interface RegistrationRecord extends RegistrationInput {
  id: number;
  createdAt: string;
  ipAddress: string;
}

export interface ValidationError {
  field: keyof RegistrationInput;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  errors: ValidationError[] | string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
