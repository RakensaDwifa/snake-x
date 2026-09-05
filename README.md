# 🐍 Snake X

Permainan Ular (Snake) yang mulus dan serius — dibangun dengan React + Vite + TypeScript + Tailwind v4 + framer-motion, dirender dengan HTML5 Canvas (gerakan ter-interpolasi antartick).

## Fitur

- **Grid 25×25** dengan rendering mulus (lerp antartick, 60fps)
- **Kontrol ganda**: keyboard (Panah / WASD + Spasi/P jeda), swipe sentuh, dan D-pad di layar
- **3 level kecepatan**: Santai / Normal / Ngebut (kecepatan bertambah tiap makan, cap minimal)
- **Skor & panjang ular**; rekor tertinggi disimpan di `localStorage`
- **Antrian belokan** (maks 3 pending) — belokan 180° ditolak, dinding & tabrakan mematikan
- **Efek suara Web Audio** (tanpa file eksternal) + mode senyap yang tersimpan; getar 12ms saat makan (mobile)
- **Juice**: glow & denyut pada makanan, flash merah saat mati, transisi layar framer-motion
- Tema gelap premium, layar Splash → Menu → Main → Jeda → Game Over (berbahasa Indonesia)

## Menjalankan

```bash
pnpm install
pnpm dev        # dev server
pnpm test       # vitest (16 tes)
pnpm lint       # oxlint
pnpm build      # tsc -b && vite build
```

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript (strict, `erasableSyntaxOnly`)
- [Tailwind CSS](https://tailwindcss.com) v4
- [framer-motion](https://framer.com/motion)
- [Vitest](https://vitest.dev) untuk unit test logika permainan
