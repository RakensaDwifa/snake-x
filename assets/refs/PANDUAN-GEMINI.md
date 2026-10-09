# 🚀 Panduan Cepat: Generate Referensi Visual dengan Gemini

---

## Yang perlu kamu upload (2 file wajib)

| # | File | Status |
|---|---|---|
| 1 | `assets/prompts/design-context.md` | ✅ sudah ada |
| 2 | `assets/refs/sekarang-game.png` | ⬜ kamu screenshot |
| 3 | `assets/refs/ewa-*.png` (opsional) | ⬜ Pinterest/Behance |

---

## Step 1 — Screenshot game sekarang

```
Buka    : https://snake-x-nine.vercel.app
Ambil   : 2 screenshot
          ① Menu utama
          ② Sedang bermain (HUD + power-up)
Simpan ke: D:\web\projects\Game\snake-x\assets\refs\
Namanya  : sekarang-menu.png
           sekarang-main.png
```

> Di Windows: **Win + Shift + S** → pilih area → simpan

---

## Step 2 — Cari referensi dari Pinterest / Dribbble

Keyword yang bagus:

```
mobile game HUD design dark
snake game UI
glassmorphism game UI
neon gaming interface
dark game UI kit
```

**Simpan 3-5 gambar** ke `assets/refs/`:

```
ewa-1.png
ewa-2.png
ewa-3.png
```

> **Penting:** Yang diambil dari referensi ini adalah **gaya/layout**,
> **bukan warna**. Warna tetap pakai palet game kamu.

---

## Step 3 — Upload ke Gemini

```
1. Buka  → https://gemini.google.com
2. Klik  → "New chat"
3. Klik  → ikon 📎 atau ➕ di kanan kotak pesan
4. Pilih file:
      📄 design-context.md
      🖼️  sekarang-menu.png
      🖼️  sekarang-main.png
      🖼️  ewa-1.png  (kalau ada)
5. File akan muncul sebagai chip kecil di atas kotak pesan
```

---

## Step 4 — Paste prompt

**Pilih salah satu** (semua ada di bagian 6 file design-context.md):

### Opsi A — Pisah per layar (paling detail)
```
Based on design-context.md section 3 (wireframe) and section 4 (component sizes),
create a mockup for the HUD screen.

MUST KEEP: 3 stat cards, 3 effect chips with progress bars, colors from design context
CAN IMPROVE: card styling, typography, spacing, glassmorphism, visual clarity

Format: PNG mockup, dark theme #030712, high fidelity.
```

### Opsi B — Sekali jadi (HUD + Menu)
```
I'm attaching design-context.md with complete visual specification.

Create 2 mockups matching the exact colors, sizes, and layout:
  (a) HUD — 3 stat cards + effect chips row
  (b) Main Menu — title + settings panel + action buttons

Colors MUST be exact from design context.
No long text labels, short labels only.
Format: PNG, dark theme, high fidelity, modern gaming UI.
```

### Opsi C — Poles dari kondisi sekarang (rekomendasi)
```
First image = my current game.
Second image = design context specification.

Create a more polished version of the current design.

MUST KEEP (identity):
- All colors from design context
- Element positions and counts
- 25x25 board layout

CAN IMPROVE:
- Visual depth (shadow, border, radius)
- Typography and information hierarchy
- Spacing and visual rhythm
- Overall modernity

Explain briefly what changed and why it's better.
```

---

## Step 5 — Simpan hasilnya

Download gambar dari Gemini, lalu simpan ke `assets/refs/`:

```
mockup-hud.png
mockup-menu.png
mockup-powerup.png
mockup-gameover.png
```

---

## Step 6 — Bilang ke saya

```
"sudah, gambarnya ada di assets/refs"
```

Lalu saya akan:
1. Baca gambar referensinya
2. Bandingkan dengan kode sekarang
3. Susun daftar perubahan konkret
4. Presentasikan untuk approval
5. Implementasi

---

## 🎯 Tips

- Gemini sering **tidak akurat render teks panjang** di gambar → **itu normal**
- Yang penting: **layout, warna, proporsi, bentuk**
- Kalau mockup jelek, regenerate dengan prompt: *"more polished, more modern, cleaner"*
- Kalau terlalu ramai: *"simpler, more minimal, less elements"*
- Kalau warna meleset: *"use EXACTLY the hex colors from design context"*

---

## 🔄 Alternatif: Pakai Gemini CLI

Kalau mau tanpa upload manual:

```bash
cd D:\web\projects\Game\snake-x
gemini
```

Lalu:
```
@assets/prompts/design-context.md

Buat mockup HUD untuk game snake ini berdasarkan design context.
Format PNG, dark theme #030712, high fidelity.
```