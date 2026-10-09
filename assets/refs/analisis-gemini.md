# Proposal Visual Polish — Snake X

Berdasarkan analisis menyeluruh terhadap seluruh kode sumber visual game (`BoardRenderer.tsx`, `particles.ts`, `HUD.tsx`, `Controls.tsx`, `CountdownOverlay.tsx`, `SplashScreen.tsx`, `MenuScreen.tsx`, `PauseScreen.tsx`, `GameOverScreen.tsx`, `OnboardingOverlay.tsx`, `skins.ts`, `constants.ts`, `index.css`, `index.html`), berikut adalah temuan arsitektur visual dan 10 proposal improvement konkret.

---

## 1. Visual Hierarchy
- **Elemen Paling Menarik Mata:** Saat ini canvas ular dan makanan merah mendominasi, tetapi papan permainan terasa "flat" karena background grid monokrom dan tidak ada kedalaman pencahayaan (lighting/vignette).
- **Elemen Kurang Menonjol:** 
  1. *Skin Ular*: Sistem 10 skin di `skins.ts` sama sekali tidak dirender ke canvas (warna ular di-hardcode ke palet hijau standar di `drawSegment`).
  2. *Power-up*: Semua power-up digambar sebagai bintang yang identik, hanya berbeda warna dan teks emoji kecil di bawahnya.
  3. *Tombol Mulai Main*: Pada layar menu, tombol utama berdesakan di baris yang sama dengan tombol Shop dan Skin (`Shop | Skin | Mulai Main`), mengurangi dominasi tombol aksi utama (CTA).
- **Kondisi HUD:** Cukup informatif, tetapi card stat masih berupa kotak flat biasa. Warna chip efek Slow menggunakan warna sky-blue yang tabrakan dengan Shield.

---

## 2. Color & Contrast
- **Palet Utama:** `snake-500` (`#10b981`) di atas `surface-950` (`#030712`) memiliki kontras baik, namun kurang memiliki lapisan kedalaman (*depth layering*) dan glow ambient.
- **Inkonsistensi Warna:**
  - Efek **Slow**: Di `HUD.tsx` menggunakan `bg-sky-400` (sama persis dengan Shield), padahal di `CHECKLIST.md` dan `BoardRenderer.tsx` bertema ungu/violet (`#a78bfa`).
  - Warna Snake: Di-hardcode di `BoardRenderer.tsx` pada baris 186-188, mengabaikan konfigurasi `SKINS`.

---

## 3. Animation & Feedback
- **Feedback Visual Aksi:**
  - Partikel makan (+burst) dan screen shake saat tabrakan sudah ada.
  - Namun, arah mata ular tidak dinamis mengikuti pergerakan (selalu menghadap arah statis).
  - Floating text skor di canvas tidak memiliki text-outline/shadow, sehingga sulit dibaca ketika bertumpukan dengan badan ular atau partikel.

---

## 4. Canvas Rendering
- **drawSegment:** Saat ini berupa rounded rectangle terpisah dengan interpolasi warna linier standar. Belum memiliki kesan organik ular (konektor segmen / mata dinamis / highlight glow pada kepala).
- **Food & Power-up:** Makanan hanya berupa rounded rectangle merah dengan titik putih kecil. Power-up berbentuk bintang seragam. Perlu bentuk geometris khusus yang berbeda untuk Shield, Slow, dan Double.

---

## 10 Rencana Improvement Spesifik

### 1. Integrasi Sistem Skin ke Canvas Rendering
- **File & Baris:** `src/render/BoardRenderer.tsx:183-197` & `src/App.tsx:132-149`
- **Masalah:** Warna segmen ular di-hardcode (`lerp(34, 6, ratio)`), sehingga pemilihan skin di `SkinSelector` tidak berdampak pada game visual.
- **Perubahan:** Teruskan data skin aktif (headColor, bodyColor, tailColor, foodColor) dari `inventory.equippedSkin` ke `BoardRenderer`, dan hitung interpolasi warna segmen secara dinamis berbasis hex-to-rgb.
- **Impact:** Tinggi
- **Estimasi Effort:** 30m

### 2. Arah Mata Ular Dinamis Berdasarkan Vektor Pergerakan
- **File & Baris:** `src/render/BoardRenderer.tsx:199-207`
- **Masalah:** Mata ular digambar dengan posisi x/y statis di bagian atas kepala, tampak aneh ketika ular bergerak ke bawah, kiri, atau kanan.
- **Perubahan:** Hitung orientasi kepala berdasarkan selisih posisi `cur[0]` dan `cur[1]` (atau `directionRef`), lalu posisikan pupil & mata menghadap ke arah laju ular.
- **Impact:** Tinggi
- **Estimasi Effort:** 30m

### 3. Diferensiasi Geometris & Visual Icon Power-up
- **File & Baris:** `src/render/BoardRenderer.tsx:281-320`
- **Masalah:** Semua power-up memakai bentuk bintang generik (`drawStar`).
- **Perubahan:** 
  - Shield: Crest/Hexagon perisai dengan lapisan cincin energi.
  - Slow: Simbol hourglass / orb kristal dengan pulsasi gelombang waktu.
  - Double: Emblem lencana "2X" neon dengan dual outer rings.
- **Impact:** Tinggi
- **Estimasi Effort:** 45m

### 4. Peningkatan Visual Makanan (Juicy Food & Golden Orb)
- **File & Baris:** `src/render/BoardRenderer.tsx:210-258`
- **Masalah:** Makanan merah hanya rounded box flat. Makanan emas kurang berkilau.
- **Perubahan:** Berikan gradien radial glossy, specular highlight melengkung, serta ring aura bernapas (*breathing glow*). Pada bonus food, tambahkan kilauan bintang rotasi.
- **Impact:** Sedang
- **Estimasi Effort:** 30m

### 5. Floating Text dengan Text Shadow & Outline di Canvas
- **File & Baris:** `src/render/BoardRenderer.tsx:356-371`
- **Masalah:** Floating text skor (+1, +5, COMBO) tidak memiliki border/stroke, sering tenggelam di atas partikel atau grid.
- **Perubahan:** Berikan `ctx.strokeStyle = '#000000'`, `ctx.lineWidth = 3`, dan panggil `ctx.strokeText` sebelum `ctx.fillText`, serta penyesuaian font Sora/Inter bold.
- **Impact:** Sedang
- **Estimasi Effort:** 20m

### 6. Modern Glassmorphism & Indikator Efek pada HUD
- **File & Baris:** `src/components/HUD.tsx:22-120`
- **Masalah:** Stat card berbentuk box gelap biasa. Efek chip lambat salah warna (`bg-sky-400`).
- **Perubahan:** 
  - Ubah stat card menjadi frosted glass (`backdrop-blur-md bg-surface-900/80 border-surface-700/60 shadow-lg`).
  - Perbaiki palet Slow chip ke ungu (`bg-purple-500` / `#a78bfa`).
  - Berikan gradien warna pada drain bar effect chips dan highlight angka skor.
- **Impact:** Tinggi
- **Estimasi Effort:** 30m

### 7. Perapihan Tata Letak MenuScreen & Tombol CTA Utama
- **File & Baris:** `src/components/screens/MenuScreen.tsx:230-277`
- **Masalah:** Tombol "Mulai Main" berebut tempat di satu baris dengan Shop dan Skin (`flex gap-2`).
- **Perubahan:** Pisahkan tombol navigasi sub-fitur menjadi satu grid ikon 5 tombol yang rapi (Statistik, Pencapaian, Progres, Shop, Skin), dan tempatkan tombol **"▶ MULAI MAIN"** di baris tersendiri dengan ukuran besar, gradien emerald, dan pulsating glow shadow.
- **Impact:** Tinggi
- **Estimasi Effort:** 30m

### 8. Desain Ulang Visual SplashScreen & Logo Emblem
- **File & Baris:** `src/components/screens/SplashScreen.tsx:18-38`
- **Masalah:** Logo SVG di splash screen berupa garis lengkung kaku dan 4 balok hijau terpisah.
- **Perubahan:** Buat logo modern monogram "SNAKE X" bergaya neon cyber-organic dengan gradient head, mata bercahaya, dan efek ambient radial glow di latar belakang.
- **Impact:** Sedang
- **Estimasi Effort:** 30m

### 9. Estetika Grid Board & Ambient Border Glow
- **File & Baris:** `src/render/BoardRenderer.tsx:155-172` & `src/App.tsx:127-131`
- **Masalah:** Papan permainan terpotong flat tanpa efek atmosfer di tepian dinding.
- **Perubahan:** Tambahkan radial vignette lembut di kanvas (tepi sedikit lebih gelap, tengah ada pendar hijau halus), serta indikator visual pada border saat mode wrap aktif vs mode tembok mati.
- **Impact:** Sedang
- **Estimasi Effort:** 30m

### 10. Penyempurnaan Dialog Overlay (GameOver & Pause Screen)
- **File & Baris:** `src/components/screens/GameOverScreen.tsx` & `PauseScreen.tsx`
- **Masalah:** Modal berbentuk kartu flat standar, tombol aksi kurang hierarki visual.
- **Perubahan:** Tambahkan backdrop glassmorphism berkabut, badge rekor baru berkilau, ranking list skor dengan highlight strip, dan tombol restart beraksen glow.
- **Impact:** Sedang
- **Estimasi Effort:** 30m
