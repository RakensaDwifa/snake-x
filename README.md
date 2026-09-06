# 🐍 Snake X

Permainan Ular (Snake) yang mulus dan serius — dibangun dengan React + Vite + TypeScript + Tailwind v4 + framer-motion, dirender dengan HTML5 Canvas (gerakan ter-interpolasi antartick).

## Fitur

- **Grid 25×25** dengan rendering mulus (lerp antartick, 60fps)
- **Kontrol adaptif**: desktop pakai keyboard (Panah / WASD, **Esc / Spasi / P** untuk jeda); mobile dapat swipe sentuh + D-pad di layar dan tombol jeda
- **3 level kecepatan**: Santai / Normal / Ngebut (kecepatan bertambah tiap makan, cap minimal)
- **Skor & panjang ular**; rekor tertinggi disimpan di `localStorage`
- **Antrian belokan** (maks 3 pending) — belokan 180° ditolak, dinding & tabrakan mematikan
- **3-2-1 GO! countdown** sebelum mulai dan setelah jeda (dibatalkan oleh pause)
- **Combo ×{n}**: makan beruntun dalam 4 detik menaikkan pengganda skor (maks ×5, titik ×1)
- **Makanan emas (+5)**: 15% peluang muncul, kedaluwarsa 4 detik
- **Power-up** (tiap 4 makanan, bertahan 15 tick): 🛡️ **tameng** menahan satu hantaman + freeze 3 detik, 🐢 **melambat** 1.5× selama 8 detik, ×2 **skor ganda** selama 8 detik
- **Mode tembus dinding (wrap)**: opsi untuk melompat ke sisi seberang alih-alih mati
- **Top 5 Skor Teratas** + tombol **bagikan** (`navigator.share`, fallback salin ke clipboard)
- **Musik latar** + **slider volume** (mengatur efek & musik; tersimpan di `localStorage`)
- **Efek suara Web Audio** (tanpa file eksternal) + mode senyap yang tersimpan; getar 12ms saat makan (mobile)
- **Juice**: glow & denyut pada makanan, partikel ledakan & teks apung, flash merah saat mati, gelombang getar (shake), transisi layar framer-motion
- Tema gelap premium, layar Splash → Menu → Main → Jeda → Game Over (berbahasa Indonesia)

## Menjalankan

```bash
pnpm install
pnpm dev        # dev server
pnpm test       # vitest (50 tes)
pnpm lint       # oxlint
pnpm build      # tsc -b && vite build
```

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript (strict, `erasableSyntaxOnly`)
- [Tailwind CSS](https://tailwindcss.com) v4
- [framer-motion](https://framer.com/motion)
- [Vitest](https://vitest.dev) untuk unit test logika permainan
