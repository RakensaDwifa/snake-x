# Design Context — Snake X

> Dokumen ini adalah **spesifikasi visual lengkap** dari game Snake X.
> Semua nilai warna, ukuran, dan layout di bawah ini **diambil langsung dari kode sumber** (bukan estimasi).
>
> **Tujuan dokumen ini:** menjadi acuan bagi AI image generator (Gemini) untuk membuat
> mockup UI yang **accurat** terhadap kondisi game yang ada sekarang, sekaligus menjadi
> bahan evaluatesi visual polish.

---

## 1. DESIGN TOKENS

### 1.1 Palet Warna

#### Warna Tema (Background & Surface)

| Token | Hex | Fengsi |
|---|---|---|
| `surface-950` | `#030712` | Background utama aplikasi (hampir hitam, nuansa biru) |
| `surface-900` | `#0b1220` | Isi card / panel / overlay |
| `surface-800` | `#111a2e` | Border card, garis pemisah |

#### Warna Aksen (Snake)

| Token | Hex | Fengsi |
|---|---|---|
| `snake-50` | `#ecfdf5` | Eyedrop putih mata ular |
| `snake-300` | `#6ee7b7` | Aksen terang, nilai skor di HUD |
| `snake-400` | `#34d399` | Aksen sedang, judul "X" |
| `snake-500` | `#10b981` | **Aksen utama** — tombol play, glow, grid |
| `snake-600` | `#059669` | Hover tombol |
| `snake-800` | `#065f46` | Warna ekor ular |

#### Warna Item Papan

| Item | Hex | Bentuk |
|---|---|---|
| Food biasa | `#f43f5e` | Kotak rounded + glow |
| Food emas (bonus) | `#fbbf24` | Bintang 5 sudut + halo |
| Power-up Slow | `#a78bfa` | Bintang + label "SLOW" |
| Power-up Double | `#e879f9` | Bintang + label "×2" |
| Power-up Shield | `#38bdf8` | Bintang + label "🛡️" |

#### Warna Partikel

| Konteks | Nilai |
|---|---|
| Makan food | `#34d399`, `#6ee7b7`, `#a7f3d0` |
| Mati | `#f43f5e`, `#fb7185`, `#fda4af` |
| Ambil power-up | `#a78bfa`, `#c084fc`, `#f0abfc` |
| Makan emas | `#fbbf24`, `#fde68a`, `#f59e0b` |
| Shield break | `#38bdf8`, `#7dd3fc`, `#bae6fd` |
| Confetti (menang) | `#34d399`, `#6ee7b7`, `#fbbf24`, `#fb7185`, `#a78bfa`, `#38bdf8` |

#### Warna Teks

| Token | Hex | Fengsi |
|---|---|---|
| `slate-200` | `#e5e7eb` | Teks utama |
| `slate-400` | `#94a3b8` | Teks sekunder / label |
| `slate-500` | `#64748b` | Label kecil, angka placeholder |
| `amber-300` | `#fcd34d` | Best score, badge rekor |
| `orange-300` | `#fdba74` | Chip kombo |
| `rose-400` | `#fb7185` | Judul Game Over |
| `sky-300` | `#7dd3fc` | Label tameng |

### 1.2 Tipografi

| Keluarga | Usage | Weight |
|---|---|---|
| **Inter** | Semua UI text (label, tombol, body) | 400, 500, 600, 700, 800 |
| **Sora** | Judul, angka besar (Skor, Panjang, Best, Level, Koin) | 600, 700, 800 |

**Aturan:**
- Label kecil: `text-[10px]` atau `text-xs`, `uppercase`, `tracking-wide` / `tracking-wider`
- Nilai angka besar: `text-lg` / `text-xl` / `text-2xl`, `font-display`, `font-bold`
- Judul halaman: `text-4xl` / `text-5xl`, `font-display`, `font-extrabold`, `tracking-tight`

### 1.3 Skala Spacing

Tailwind standar. Yang sering dipakai:

| Nilai | Pixel | Pemakaian |
|---|---|---|
| `px-3 py-2.5` | 12/10 | Baris toggle & card kecil |
| `px-4 py-3` | 16/12 | Tombol sekunder |
| `px-6 py-3` | 24/12 | Tombol utama di overlay |
| `px-6 py-4` | 24/16 | Tombol "Mulai Main" |
| `gap-2` | 8 | Antara elemen sebaris |
| `gap-3` | 12 | Antara stat card |
| `p-5` | 20 | Padding panel settings |
| `p-6` | 24 | Padding card overlay |
| `p-8` | 32 | Padding splash |

---

## 2. CANVAS RENDERING SPEC

Board digambar dengan **Canvas 2D**, 25×25 grid, 60fps, dengan interpolasi linier antar sel.

### 2.1 Dasar

| Parameter | Nilai |
|---|---|
| Ukuran grid | **25 × 25** sel |
| Resolusi | `min(devicePixelRatio, 2)` |
| Jar antar sel (gap) | `max(0.5, cellSize × 0.06)` |
| Latar papan | `rgba(11, 18, 32, 0.85)` — solid |
| Garis grid | `rgba(148, 163, 184, 0.06)`, `lineWidth 1` |

### 2.2 Ular (Snake)

Setiap segmen digambar sebagai **rounded rect** dengan gradient linear dari kepala ke ekor.

| Parameter | Nilai |
|---|---|
| Bentuk | Rounded rect, radius = `size × 0.32` |
| Warna kepala | `rgb(34, 197, 94)` = `#22c55e` |
| Warna ekor | `rgb(6, 94, 52)` = `#065e34` |
| Interpolasi warna | Linear berdasarkan `index / (length - 1)` |
| Glow kepala | `shadowColor rgba(52, 211, 153, 0.9)`, `shadowBlur 14` |
| Flash kepala (mati) | `rgba(244, 63, 94, 0.9)` — lasting 300ms |
| Mata | 2 titik bulat, warna `rgba(236, 253, 245, 0.9)` |
| Ukuran mata | `size × 0.16` |
| Posisi mata | `x + size×0.34` dan `x + size×0.68`, `y + size×0.24` |

### 2.3 Food (Makanan Biasa)

| Parameter | Nilai |
|---|---|
| Bentuk | Rounded rect, radius = `size × 0.3` |
| Warna | `#f43f5e` |
| Ukuran | `cellSize × 0.62 × pulse` |
| Animasi pulse | `1 + sin(now / 300) × 0.08` → denyut ±8% tiap ~300ms |
| Glow | `shadowColor rgba(244, 63, 94, 0.9)`, `shadowBlur 16` |
| Highlight | Titik putih `rgba(255,255,255,0.35)`, radius `size×0.12`, di `(x+size×0.3, y+size×0.3)` |

### 2.4 Food Emas (Bonus)

| Parameter | Nilai |
|---|---|
| Bentuk | Bintang 5 sudut, warna `#fbbf24` |
| Ukuran | `cellSize × 0.5 × pulse` |
| Pulse | `1 + sin(now / 180) × 0.15` → denyut ±15% |
| Halo | Radial gradient, radius `cellSize × (0.5 + 0.3 × sisaWaktu)` |
| Gradient | `rgba(251, 191, 36, 0.5 × sisaWaktu)` → transparan |
| Alpha | `0.3 + 0.7 × sisaWaktu` — **fade out** mendekati habis |
| Glow | `shadowBlur 16` |
| Masa hidup | 4000ms |

### 2.5 Power-up

| Parameter | Nilai |
|---|---|
| Bentuk | **Bintang 10 sudut** (5 point star), radius dalam = 45% luar |
| Ukuran | `cellSize × 0.5` |
| Pulse | `1 + sin(now / 220) × 0.12` |
| Halo | Radial gradient, radius `cellSize × 0.85 × pulse` |
| Glow | `shadowBlur 14` |
| Label | `font bold cellSize×0.28px`, warna `rgba(250,245,255,0.95)`, posisi `cy + size×1.45` |
| Masa hidup | **15 tick** (~2-3 detik) |

| Kind | Warna | Label |
|---|---|---|
| `slow` | `#a78bfa` (ungu) | `SLOW` |
| `double` | `#e879f9` (magenta) | `×2` |
| `shield` | `#38bdf8` (cyan) | `🛡️` |

**Aturan spawn:**
- Muncul setiap **4 makanan** dimakan
- Maksimal **1** di papan
- Tidak muncul di atas sel ular atau makanan biasa

### 2.6 Shield Ring

Muncul di sekitar kepala ular selama 3000ms setelah tameng_AVOIDED.

| Parameter | Nilai |
|---|---|
| Ring luar | Radius `cellSize × 0.7 × pulse`, stroke `rgba(56,189,248,0.85)`, `lineWidth max(2, cellSize×0.09)` |
| Ring dalam | Radius `cellSize × 0.92 × pulse`, stroke `rgba(56,189,248,0.25)`, `lineWidth max(1, cellSize×0.04)` |
| Pulse | `1 + sin(now / 260) × 0.08` |

### 2.7 Partikel & Float Text

**Partikel (burst):**

| Parameter | Nilai |
|---|---|
| Jumlah per burst | 14 |
| Duration | 450ms × `(0.6 + random×0.4)` |
| Gravity | 6 (cell/detik²) |
| Speed | 5 cell/detik × `(0.35 + random×0.75)` |
| Ukuran | 0.3 cell × `(0.7 + random×0.6)` |
| Rendering | Circle, alpha = `1 - age/duration` |

**Float text (angka meloncat):**

| Parameter | Nilai |
|---|---|
| Font | `bold cellSize×0.9px Inter` |
| Naik | `y - ratio × cellSize × 1.2` |
| Alpha | `1 - ratio` |
| Contoh | `+1`, `+3 🔥`, `+5 ✨`, `+2 🐢`, `💥 Tameng!` |

### 2.8 Konstanta Gameplay (untuk konteks timing)

| Konstanta | Nilai | Arti |
|---|---|---|
| `GRID_SIZE` | 25 | Ukuran grid |
| `BASE_TICK_MS` | 150 | Tick dasar (150ms per sel) |
| `SPEED_INCREMENT_MS` | 5 | Tick lebih cepat per poin |
| `MIN_TICK_MS` | 60 | Tick tercepat |
| `POWERUP_EVERY_FOOD` | 4 | Spawn power-up setiap 4 food |
| `POWERUP_LIFETIME_TICKS` | 15 | Lama power-up di papan |
| `POWERUP_SLOW_FACTOR` | 1.5 | Faktor perlambatan |
| `POWERUP_SLOW_DURATION_MS` | 8000 | Durasi efek slow |
| `POWERUP_DOUBLE_DURATION_MS` | 8000 | Durasi efek double |
| `SHIELD_FREEZE_MS` | 3000 | Durasi freeze setelah tameng |
| `POWERUP_SCORE_BONUS` | 2 | Poin bonus ambil power-up |

---

## 3. ASCII WIREFRAME

### 3.1 HUD (Saat Bermain)

```
┌────────────────────────────────────────────────────────┐
│ ┌─────────┐  ┌─────────┐  ┌─────────┐        ┌──┐ ┌──┐ │
│ │  SKOR   │  │ PANJANG │  │   BEST  │        │🔊│ │⏸ │ │
│ │   42    │  │   10    │  │   99    │        └──┘ └──┘ │
│ └─────────┘  └─────────┘  └─────────┘                   │
│                                                        │
│ ┌────────┐  ┌────┐  ┌──────┐  ┌──────┐                 │
│ │🔥 × 3  │  │🛡️ │  │🐢▬▬▬▬│  │×2▬▬▬▬│                │
│ │ COMBO  │  │    │  │ SLOW │  │ ×2   │                 │
│ └────────┘  └────┘  └──────┘  └──────┘                 │
└────────────────────────────────────────────────────────┘
```

**Keterangan:**
- 3 stat card rata kiri, tombol kanan rata kanan
- Baris kedua: chip kombo (hanya muncul saat kombo ≥ 2) + 3 effect chip
- Effect chip: menampilkan ikon + **progress bar horizontal** yang menyusut
- Bar_cntuk: `h-1` (4px), panjang `w-9` (36px), rounded full, warna sesuai efek
- Shield chip **tidak** punya bar (aktif sampai terkena)

### 3.2 Board + Efek

```
       ┌───────────────────────────────────────┐
       │  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │  ← grid halus
       │  ·  ·  🟩🟩  ·  ·  ·  ·  🔴  ·  ·  · │  ← ular hijau + food merah
       │  ·  🟩🟩🟩  ·  ·  ⭐  ·  ·  ·  ·  · │  ← power-up (bintang+label)
       │  ·  🟩🟩🟩🟩 ·  ·  ·  ·  ✨  ·  ·  · │  ← food emas (bintang kuning)
       │  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │
       │  ·  ·  ·  ·  ·  🟩  ·  ·  ·  ·  ·  · │  ← kepala ular (glow hijau)
       └───────────────────────────────────────┘
              ↑ rounded-2xl, border tipis, glow hijau lembut

   Saat power-up aktif:
   · Slow   → kepala lebih lambat + chip 🐢 dengan bar
   · Double → chip ×2 dengan bar
   · Shield → lingkaran cyan diaround kepala + ring berdenyut
```

### 3.3 Menu Utama

```
┌───────────────────────────────────────┐
│                                       │
│           S N A K E  X               │  ← judul besar, "X" hijau
│          🏆 Best: 99                  │  ← hanya jika ada skor
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ KECEPATAN                       │  │  ← label uppercase kecil
│  │ [Santai] [Normal] [Ngebut]      │  │  ← 3 tombol, aktif = hijau
│  ├─────────────────────────────────┤  │
│  │ Grid 25×25      🔊 suara nyala  │  │
│  ├─────────────────────────────────┤  │
│  │ 🎵 Musik latar          ( ●── ) │  │  ← toggle switch
│  ├─────────────────────────────────┤  │
│  │ 🔊 Volume         60%           │  │  ← slider (muncul jika musik on)
│  │ [────────●─────────]            │  │
│  ├─────────────────────────────────┤  │
│  │ 🔄 Mode tembus dinding  ( ●── ) │  │
│  ├─────────────────────────────────┤  │
│  │ 🌐 Bahasa     [🇮🇩 Indonesia ▾]  │  │  ← dropdown
│  └─────────────────────────────────┘  │
│                                       │
│  [📊 Statistik] [🏆 Pencapaian] [⭐ Progres] │  ← baris 1
│  [🛒 Shop] [🎨 Skin] [▶ Mulai Main]           │  ← baris 2
│                                       │
│  Panah / WASD / geser untuk bergerak   │  ← hint kecil
│  ⭐ melambat · ×2 skor ganda · 🛡️ tameng │  ← legenda
└───────────────────────────────────────┘
```

### 3.4 Game Over

```
┌───────────────────────────────────────┐
│           ( overlay gelap blur )      │
│         ┌─────────────────────┐       │
│         │   💀 Game Over      │       │  ← judul merah
│         │  🎉 REKOR BARU!     │       │  ← badge emas (opsional)
│         ├─────────────────────┤       │
│         │ [SKOR][PJG][BEST]   │       │  ← 3 kolom
│         │ [ 50 ][ 15][ 99 ]   │       │
│         ├─────────────────────┤       │
│         │ 🏅 SKOR TERATAS     │       │
│         │ 1  60        18 seg │       │
│         │ 2  50        15 seg │       │  ← top 5, baris terbaru hijau
│         │ 3  32        11 seg │       │
│         ├─────────────────────┤       │
│         │ Isi papan penuh...  │       │  ← tips
│         │ Game ke-7 · Menang… │       │  ← statistik
│         ├─────────────────────┤       │
│         │ [📤 Bagikan Skor]   │       │  ← biru
│         │ [↻ Main Lagi]       │       │  ← hijau solid (primary)
│         │ [Menu]               │       │  ←Abu-abu (secondary)
│         └─────────────────────┘       │
└───────────────────────────────────────┘
```

### 3.5 Pause

```
┌───────────────────────────────────────┐
│       ┌─────────────────────┐         │
│         │       J E D A       │         │
│         │ [▶ Lanjut]          │         │  ← hijau solid
│         │ [↻ Mulai Ulang]     │         │  ← outline terang
│         │ [Menu]               │         │  ← outline redup
│         └─────────────────────┘         │
└───────────────────────────────────────┘
```

### 3.6 Splash

```
┌───────────────────────────────────────┐
│                                       │
│              ( ͡ logo ular )          │  ← SVG 80x80, glow hijau
│                                       │
│           S N A K E  X               │  ← judul 5xl
│      Panah / WASD / geser…            │
│                                       │
│      [ Ketuk untuk mulai ]            │  ← tombol glow pulsing
│                                       │
└───────────────────────────────────────┘
```

---

## 4. UKURAN KOMPONEN

### 4.1 Layout Root

| Elemen | Class |
|---|---|
| Root app | `flex min-h-full flex-col items-center justify-center bg-surface-950 px-4 py-6` |
| Wrapper board | `flex w-full max-w-md flex-col items-center` |
| Container board | `relative aspect-square rounded-2xl border border-surface-800 shadow-[0_0_40px_rgba(16,185,129,0.15)]` |
| **Lebar board** | `min(100%, 28rem, calc(100dvh - 14rem))` — menyesuaikan tinggi viewport |

### 4.2 HUD

| Elemen | Class |
|---|---|
| Container HUD | `mb-3 flex w-full max-w-md flex-col gap-2` |
| Baris atas | `flex w-full items-center justify-between text-sm` |
| Grup stat card | `flex items-center gap-3` |
| Stat card | `rounded-xl border border-surface-800 bg-surface-900/60 px-3 py-1.5` |
| Label stat | `text-[10px] uppercase tracking-wide text-slate-500` |
| Nilai stat | `font-display text-lg font-bold` |
| Tombol ikon | `h-9 w-9 rounded-lg border border-surface-800 bg-surface-900/60` |
| Baris chip | `flex flex-wrap items-center gap-1.5` |
| Chip kombo | `rounded-lg border-orange-800 bg-orange-500/15 px-2 py-1 text-sm font-bold text-orange-300` |
| Effect chip | `flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm` |
| Chip aktif | `border-slate-700 bg-surface-800/80` |
| Chip nonaktif | `border-surface-800 bg-surface-950/40 opacity-40` |
| Bar container | `h-1 w-9 overflow-hidden rounded-full bg-surface-950` |
| Pulse dot | `h-1.5 w-1.5 rounded-full` + animasi pulse |

### 4.3 Kontrol Mobile

| Elemen | Class |
|---|---|
| Container | `mt-4 flex items-end justify-between gap-4` |
| Tombol D-pad | `h-14 w-14 rounded-2xl border-snake-500/30 bg-surface-900 text-2xl text-snake-300` |
| Tombol aksi | `h-12 flex-1 rounded-2xl border-snake-500/40 bg-snake-500/10 font-semibold text-snake-300` |
| Label bawah | `w-24 text-center text-[11px] leading-tight text-slate-500` |

### 4.4 Menu

| Elemen | Class |
|---|---|
| Container | `flex min-h-full w-full max-w-sm flex-1 flex-col items-center justify-center gap-8 p-6` |
| Judul | `font-display text-4xl font-extrabold` (SNAKE putih + X hijau) |
| Best score | `mt-2 text-sm font-semibold text-amber-300` |
| Panel settings | `w-full space-y-4 rounded-2xl border border-surface-800 bg-surface-900/70 p-5` |
| Label seksi | `mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500` |
| Grid kecepatan | `grid grid-cols-3 gap-2` |
| Tombol kecepatan | `rounded-xl border px-3 py-2 text-sm font-semibold` |
| Tombol aktif | `border-snake-400 bg-snake-500/20 text-snake-300` |
| Tombol nonaktif | `border-surface-800 bg-surface-950/50 text-slate-400` |
| Baris toggle | `flex cursor-pointer items-center justify-between rounded-xl border border-surface-800 bg-surface-950/50 px-3 py-2.5 text-xs text-slate-400` |
| Toggle switch | `relative h-6 w-11 rounded-full` (hijau `#10b981` / abu `surface-800`) |
| Knob toggle | `absolute top-0.5 h-5 w-5 rounded-full bg-white`, `left-[22px]` / `left-0.5` |
| Tombol utama | `w-full rounded-2xl bg-snake-500 px-6 py-4 text-lg font-bold text-surface-950 shadow-[0_0_30px_rgba(16,185,129,0.5)]` |
| Tombol panel | `flex-1 rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 font-semibold text-slate-200` |

### 4.5 Overlay (Pause / GameOver)

| Elemen | Class |
|---|---|
| Backdrop | `absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm` |
| Card | `mx-4 w-full max-w-xs rounded-2xl border border-surface-800 bg-surface-900/95 p-6 text-center` |
| Judul | `font-display text-2xl font-bold` |
| Badge rekor | `inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300` |
| Grid stat | `mt-4 grid grid-cols-3 gap-2 text-sm` |
| Sel stat | `rounded-xl border border-surface-800 bg-surface-950/50 px-2 py-2` |
| Tombol primary | `rounded-xl bg-snake-500 px-6 py-3 font-bold text-surface-950` |
| Tombol secondary | `rounded-xl border border-surface-800 bg-surface-950/40 px-6 py-3 font-semibold text-slate-400` |

---

## 5. INVENTARIS ANIMASI

### 5.1 CSS Keyframes

| Nama | Durasi | Isi |
|---|---|---|
| `glow-pulse` | 1.8s infinite | `box-shadow` 8px → 24px → 8px (rgba(16,185,129, .35 ↔ .7)) |
| `effect-drain` | dinamis (`animationDuration`) | `transform: scaleX(1) → scaleX(0)`, linear, forwards |
| `pulse-dot` | 1s infinite | `opacity: 1 → 0.3 → 1` |
| `countdown-pop` | 0.85s ease-out both | `scale 0.4/opacity 0 → scale 1.15 @25% → scale 1 @70%` |

### 5.2 Transisi Framer Motion

| Layar | Awal | Durasi |
|---|---|---|
| Splash | `opacity 0, scale 0.9` | 0.6s |
| Splash logo | `scale 0.6, opacity 0` (spring 260/18) | — |
| Menu | `opacity 0, y 24` → exit `y -24` | 0.35s |
| Board | `opacity 0, scale 0.96` | 0.3s |
| Pause overlay | `opacity 0, scale 0.92` | 0.25s |
| Game Over overlay | `opacity 0, scale 0.9` | 0.3s |
| Panel/modal | `opacity 0, scale 0.92` | 0.3s |

### 5.3 Screen Shake

| Parameter | Nilai |
|---|---|
| Amplitude | 4px |
| Duration | 130ms |
| Dekay | Linear (`1 - elapsed/duration`) |
| Random | Offset independent untuk X dan Y |

### 5.4 Timing Konstanta

| Event | Durasi |
|---|---|
| Countdown per angka | 850ms |
| Food denyut | ~300ms per siklus |
| Food emas denyut | ~180ms per siklus |
| Shield denyut | ~260ms per siklus |
| Flash kematian | 300ms |
| Confetti (menang) | 1.6-3.0s per piece, delay 0-0.9s |

---

## 6. TEMPLATE PROMPT UNTUK GEMINI

> **Cara pakai:** Upload dokumen ini (dan gambar referensi bila ada) ke Gemini,
> lalu paste salah satu prompt di bawah.

---

### V1 — Sekali Jadi (HUD + Menu)

```
Saya attach design-context.md yang berisi spesifikasi visual lengkap game saya.

Buat mockup UI yang PERSIS mengikuti nilai warna, ukuran, dan layout di dalam
design context tersebut.

Yang perlu digambar (2 tampilan dalam 1 gambar):
  (a) HUD saat bermain — 3 stat card (Skor/Panjang/Best) + baris chip efek
  (b) Menu utama — judul + panel settings + tombol aksi

ATURAN WAJIB:
- Warna PERSIS seperti di design context (#030712 background, #10b981 aksen, dll)
- Ukuran & proporsi PERSIS mengikuti section 4
- Jangan tulis teks panjang/paragraph di dalam gambar
- Label pendek saja (SKOR, PANJANG, BEST, Mulai Main, dll)
- Gaya: modern gaming UI, flat, clean, high fidelity
- Tambahkan sedikit depth: soft shadow, subtle border, glow

Format: PNG mockup, dark theme.
```

---

### V2 — Pisah per Layar

```
[Untuk setiap prompt, GANTI nama layar]

Saya attach design-context.md. Referensi section 3 (wireframe) dan section 4
(ukuran komponen).

Buat mockup untuk layar: HUD
┌────────────────────────────────────────────────────────┐
│ [SKOR][PANJANG][BEST]                    🔊  ⏸  │
│ [🔥×3] [🛡️] [🐢 ▬▬▬] [×2 ▬▬▬] │
└────────────────────────────────────────────────────────┘

Yang WAJIB dipertahankan:
- 3 stat card, posisi kiri atas
- 3 effect chip dengan progress bar
- Warna & ukuran dari design context

Yang BOLEH diperbaiki agar lebih modern:
- Style card (border, radius, shadow)
- Tipografi
- Spacing antar elemen
- Glassmorphism / frosted effect
- Indikator visual yang lebih jelas
```

```
[Untuk setiap prompt, GANTI nama layar]

Buat mockup untuk layar: MENU UTAMA
┌───────────────────────────────────────┐
│            S N A K E  X              │
│           🏆 Best: 99                │
│  ┌─────────────────────────────────┐  │
│  │ KECEPATAN [Santai][Normal][Ngebut]│  │
│  │ 🎵 Musik latar        ( ●── )   │  │
│  │ 🔄 Mode tembus        ( ●── )   │  │
│  │ 🌐 Bahasa  [🇮🇩 Indonesia ▾]      │  │
│  └─────────────────────────────────┘  │
│  [Statistik][Pencapaian][Progres]     │
│  [Shop][Skin]        [▶ Mulai Main]  │
└───────────────────────────────────────┘

Yang WAJIB: warna, posisi, jumlah elemen
Yang BOLEH: card styling, tipografi, spacing, glow, ilustrasi tambahan
```

```
[Untuk setiap prompt, GANTI nama layar]

Buat mockup untuk layar: GAME OVER
┌───────────────────────────────────────┐
│         ┌─────────────────────┐       │
│         │   💀 Game Over      │       │
│         │  [SKOR][PJG][BEST]  │       │
│         │  🏅 SKOR TERATAS    │       │
│         │  1  60      18 seg  │       │
│         │  2  50      15 seg  │       │
│         │  [📤 Bagikan]       │       │
│         │  [↻ Main Lagi]      │       │
│         │  [Menu]             │       │
│         └─────────────────────┘       │
└───────────────────────────────────────┘

Fokus: card yang lebih premium, top-5 list yang lebih rapi, tombol yang hierarkis jelas
```

```
[Untuk setiap prompt, GANTI nama layar]

Buat mockup untuk efek POWER-UP AKTIF — 3 variasi berdampingan di atas game board:
  (1) SLOW: overlay biru transparan + chip 🐢
  (2) DOUBLE: overlay magenta transparan + chip ×2
  (3) SHIELD: kepala ular dikelilingi 2 ring cyan bercahaya

Board: 25×25 grid, ular hijau #10b981 → #065e34, latar #030712.
Gaya: glow lembut, additive blend, pulse.
```

---

### V3 — Variasi dari Screenshot Game Sekarang

```
[Upload: design-context.md + sekarang-game.png]

Gambar pertama = kondisi game saya SEKARANG (sebelum di-poles).
Gambar kedua = design context spesifikasi visual.

Buat versi yang lebih polished dari kondisi sekarang.

YANG WAJIB dipertahankan (identitas game):
- Semua warna dari design context
- Posisi dan jumlah elemen
- Layout board 25×25

YANG BOLEH diperbaiki (tujuan poles):
- Ketalaman visual (shadow, border, radius)
- Tipografi dan hierarki informasi
- Spacing dan ritme visual
- Hint gerakan/mFeedback
- Modernitas keseluruhan

Jelaskan singkat apa yang berubah dan mengapa lebih baik.
```

---

### V4 — Variasi dari Referensi Pinterest/Behance

```
[Upload: design-context.md + insisted-1.png + inspired-2.png + ...]

Gambar-gambar tersebut adalah referensi desain dari Pinterest/Behance.

Ambil dari referensi:
- GAYA visual, tingkat modernitas, pola layout
- Perlakuan terhadap card, border, shadow
- Tipografi dan ritme

JANGAN ambil dari referensi:
- Warna (warna tetap dari design context saya)
- Jumlah/posisi elemen

Lalu buat mockup untuk HUD + Menu game snake saya yang mengikuti
gaya referensi tersebut, tapi memakai warna dan layout saya.
```

---

## 7. RINGKASAN CEPAT

```
BACKGROUND    #030712 (hampir hitam, nuansa biru)
SURFACE      #0b1220 (card) · #111a2e (border)
AKSEN        #10b981 (hijau) · #6ee7b7 (terang) · #34d399 (sedang)
FONT         Inter (UI) · Sora (judul & angka)
GRID         25 × 25 sel
ULAR         #22c55e (kepala) → #065e34 (ekor), rounded rect + glow
FOOD         #f43f5e kotak denyut · #fbbf24 bintang denyut
POWER-UP     🐢 #a78bfa · ×2 #e879f9 · 🛡️ #38bdf8
PARTIKEL     14 per burst, gravity 6, 450ms
GELOMBUNG    ripple subtle, radius besar
OVERLAY      bg-black/60 + backdrop-blur-sm
```

---

*Dokumen ini dibuat dari kode sumber Snake X pada commit `8a059bf`.*