# 🎨 Proyek Poles Tampilan — Checklist

**Project:** Snake X
**Target:** Analisis + referensi gambar dari Gemini, lalu implementasi polish visual

---

## Fase 0 — Setup ✅

- [x] Cek prasyarat (Node v22.17.1 ✅)
- [x] Install `@google/gemini-cli` v0.63.0
- [x] Verifikasi command `gemini` tersedia
- [x] Siapkan folder `assets/refs/` dan `assets/prompts/`
- [x] Buat `assets/prompts/design-context.md` (spesifikasi visual lengkap)
- [x] Buat `assets/prompts/1-analisis-visual.txt` (prompt analisis kode)
- [x] Buat `assets/prompts/2-generate-gambar.txt` (prompt gambar)
- [x] Buat `assets/refs/PANDUAN-GEMINI.md` (panduan upload cepat)

---

## Fase 1 — Referensi Gambar (⏳ Manual)

> Panduan lengkap: `assets/refs/PANDUAN-GEMINI.md`

**Screenshot game sekarang:**
- [ ] `sekarang-menu.png`
- [ ] `sekarang-main.png`

**Referensi dari Pinterest/Dribbble (opsional):**
- [ ] `ewa-1.png`
- [ ] `ewa-2.png`
- [ ] `ewa-3.png`

**Upload ke Gemini + generate mockup:**
- [ ] Upload `design-context.md` + screenshot + referensi
- [ ] Paste prompt (pilih salah satu dari 4 varian)
- [ ] Simpan hasilnya ke `assets/refs/`

---

## Fase 1b — Analisis Kode Gemini CLI (⏳ Manual, opsional)

> Prompt ada di `assets/prompts/1-analisis-visual.txt`

- [ ] Login Gemini CLI (pilih "Login with Google")
- [ ] Paste 15 file visual slice
- [ ] Paste prompt analisis
- [ ] Simpan jawaban → `assets/refs/analisis-gemini.md`

---

## Fase 3 — Review & Approval (🟢 Saya)

- [ ] Baca gambar referensi
- [ ] Bandingkan dengan kode sekarang
- [ ] Susun daftar perubahan konkret
- [ ] Presentasikan ke kamu untuk approval

---

## Fase 4 — Implementasi (🟢 Saya)

- [ ] Batch 1 — HUD & effect chips
- [ ] Batch 2 — Canvas rendering (ular, makanan, power-up)
- [ ] Batch 3 — Screens (Splash, Menu, Pause, GameOver)
- [ ] Batch 4 — Theme & animasi global

**Verifikasi tiap batch:** `pnpm build` + `pnpm lint` + preview

---

## Fase 5 — Deploy

- [ ] Commit & push
- [ ] `vercel --prod`
- [ ] Cek `https://snake-x-nine.vercel.app`

---

## 📌 Catatan

**Warna skin yang sudah ada** (untuk konten visual):
| Skin | Warna |
|---|---|
| Classic Green | `#10b981` head, `#34d399` body, `#6ee7b7` tail |
| Neon Glow | `#00ff88` head, `#00cc6a` body |
| Retro Pixel | `#00aa00` head, `#00cc00` body |
| Golden Legend | `#fbbf24` head, `#fcd34d` body |
| Cyberpunk | `#ec4899` head, `#06b6d4` body |
| Void Walker | `#7c3aed` head, `#5b21b6` body |
| Inferno | `#ef4444` head, `#f97316` body |
| Frostbite | `#06b6d4` head, `#0ea5e9` body |

**Warna power-up:**
| Item | Warna |
|---|---|
| Slow | `#a78bfa` ungu |
| Double | `#e879f9` magenta |
| Shield | `#38bdf8` cyan |
| Food | `#f43f5e` merah |
| Gold food | `#fbbf24` amber |

**Palet tema:**
```
surface-950  #030712  ← background utama
surface-900  #0b1220  ← card / panel
surface-800  #111a2e  ← border
snake-500    #10b981  ← aksen utama
snake-300    #6ee7b7  ← aksen terang
```