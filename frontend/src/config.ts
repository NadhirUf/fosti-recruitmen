/**
 * Saklar utama status pendaftaran.
 *
 * true  -> pendaftaran DITUTUP. Website menampilkan layar penutup
 *          (foto angkatan + "Thank you for joining with us") dan tidak ada
 *          satupun elemen yang bisa diklik / diisi / dikirim.
 * false -> website kembali normal seperti semula (hero, divisi, form, dst).
 */
export const RECRUITMENT_CLOSED: boolean = true;

/**
 * Cara menampilkan layar penutup.
 *
 * "replace" -> website lama tidak dirender sama sekali, hanya layar penutup.
 *              Paling ringan & paling aman (form benar-benar tidak ada).
 * "overlay" -> website lama tetap dirender di belakang tapi diblur, dikunci
 *              scroll-nya, dan dibuat `inert` sehingga tidak bisa diklik,
 *              di-tab, maupun di-submit.
 */
export const CLOSED_MODE: "replace" | "overlay" = "replace";
