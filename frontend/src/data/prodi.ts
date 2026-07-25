// Daftar Fakultas & Program Studi jenjang S1 - Universitas Muhammadiyah
// Surakarta (UMS). Sumber: data resmi ums.ac.id, per Juli 2026.
// Kalau ada perubahan nama/struktur prodi di kampus, cukup edit array ini.

export interface Faculty {
  name: string;
  prodi: string[];
}

export const FACULTIES: Faculty[] = [
  {
    name: "Fakultas Agama Islam",
    prodi: [
      "Hukum Ekonomi Syariah",
      "Ilmu Al-Quran dan Tafsir",
      "Pendidikan Agama Islam",
    ],
  },
  {
    name: "Fakultas Ekonomi dan Bisnis",
    prodi: ["Akuntansi", "Bisnis Digital", "Ekonomi Pembangunan", "Manajemen"],
  },
  {
    name: "Fakultas Farmasi",
    prodi: ["Farmasi"],
  },
  {
    name: "Fakultas Geografi",
    prodi: ["Geografi", "Sains Informasi Geografi"],
  },
  {
    name: "Fakultas Hukum dan Ilmu Politik",
    prodi: ["Administrasi Publik", "Hubungan Internasional", "Ilmu Hukum"],
  },
  {
    name: "Fakultas Ilmu Kesehatan",
    prodi: ["Ilmu Gizi", "Fisioterapi", "Keperawatan", "Kesehatan Masyarakat"],
  },
  {
    name: "Fakultas Kedokteran",
    prodi: ["Kedokteran"],
  },
  {
    name: "Fakultas Kedokteran Gigi",
    prodi: ["Pendidikan Dokter Gigi"],
  },
  {
    name: "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
    prodi: [
      "Pendidikan Akuntansi",
      "Pendidikan Bahasa Inggris",
      "Pendidikan Bahasa dan Sastra Indonesia",
      "Pendidikan Biologi",
      "Pendidikan Geografi",
      "Pendidikan Guru PAUD",
      "Pendidikan Guru Sekolah Dasar (PGSD)",
      "Pendidikan Jasmani (Olahraga)",
      "Pendidikan Matematika",
      "Pendidikan Pancasila dan Kewarganegaraan",
      "Pendidikan Teknik Informatika",
    ],
  },
  {
    name: "Fakultas Komunikasi dan Informatika (FKI)",
    prodi: [
      "Ilmu Komunikasi",
      "Kecerdasan Buatan",
      "Teknik Informatika",
      "Sistem Informasi",
    ],
  },
  {
    name: "Fakultas Psikologi",
    prodi: ["Psikologi"],
  },
  {
    name: "Fakultas Teknik",
    prodi: [
      "Arsitektur",
      "Teknik Elektro",
      "Teknik Industri",
      "Teknik Kimia",
      "Teknik Mesin",
      "Teknik Sipil",
    ],
  },
];
