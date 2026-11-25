# MILESTONES — 2D-in-3D Animation Framework

Checklist di-update setiap kali sebuah task selesai diverifikasi. Acuan mutu: `PRD.md`
(Definition of Done) dan `GUIDELINES.md` (4 Kaidah Emas + aturan model).
Model aktif saat pekerjaan visual 3D: wajib **ARGON**.

## M0 — Fondasi Repo (selesai)

- [x] Scaffold Remotion 4 + three r187 + @react-three/fiber + postprocessing
- [x] `src/index.ts` + `src/Root.tsx` registrasi komposisi Demo (5 komposisi)
- [x] Dokumentasi `README.md` + `GUIDELINES.md`
- [x] `skill/` gaya referensi (STYLE_BIBLE, 13 report, 58 frame) + template audio DSP
- [x] `npx tsc --noEmit` bersih untuk seluruh `src/`

## M1 — Dunia & Karakter Prosedural "Saham vs Kripto" (selesai)

- [x] `story.ts`: `TOTAL=2121`, 16 `SHOTS`, `XFADE`, `FLASH_AT=97`, `CAMS`, `KICKS`, `dofAt`
- [x] `build.ts`: 5 set prosedural (`split`, `bursa`, `crypto`, `ara`, `volatile`) + tekstur HD
- [x] `world.ts` + `lights.ts` + `shade.ts`: 4 preset light (`golden`, `day`, `night`, `space`)
- [x] `toon.ts` (Pen/Canvas2D) + `cast.ts` (billboard, blob shadow, walk/hop/blink)
- [x] Post chain: `ink.ts` → `lensblur.ts` → bloom → NEUTRAL tonemap → `grade.ts` (grain OFF)
- [x] `template/` blueprint lengkap (salinan demo, siap di-rename per proyek baru)

## M2 — Caption & Komposisi Overlay (selesai)

- [x] `DemoCaptionOverlay.tsx`: Poppins 900 putih `#ffffff`, stroke 7px `#000000`, micro-pop 1.12x
- [x] `caption_chunks.json` chunk 1–2 kata sinkron SRT (30 fps)
- [x] Komposisi `DemoCaptionOverlay`, `DemoCaptionGreenScreen` (`#00FF00`), `DemoCaptions`
- [x] Fix import rusak `src/videos/template/Bridge.tsx:24` + `CaptionsOnly.tsx:3`
      (`git mv TemplateCaptionOverlay.tsx → SahamCaptionOverlay.tsx`)

## M3 — Tooling Lintas Platform (selesai)

- [x] Hapus path hardcode Windows (`D:/remotion-tmp`, `C:/Program Files/Google/Chrome/...`)
      dari `scripts/render-{stills,previews,video,captions}.mjs`
- [x] Helper `scripts/lib/render-env.mjs`: resolusi temp dir + browser + `gl` opsional
- [x] `scripts/gen-chunks.py` baca `voice/Saham & crypto.json`, tulis `src/videos/demo/caption_chunks.json`
- [x] `PRD.md` + `MILESTONES.md` dibuat dari README/GUIDELINES

## M4 — Audio Prosedural (selesai)

- [x] Dependensi Python audio terpasang di venv terisolasi (`.venv`, Python 3.13.15):
      `uv venv --python 3.13 .venv && uv pip install --python .venv/bin/python numpy scipy`
      → `numpy==2.5.5`, `scipy==1.18.1` (venv sudah masuk `.gitignore`)
- [x] `python scripts/gen-audio.py` → `public/saham_mix.wav`
- [x] Verifikasi independen `ffmpeg -af ebur128=peak=true`:
      **I = -15.0 LUFS**, LRA = 2.2 LU, **True peak = -1.6 dBFS**, durasi 70.700 s (= 2121/30)
- [x] Fix bug `scripts/gen-audio.py`: `dsp.true_peak()` sudah mengembalikan dBTP, tapi di-log
      sebagai rasio linear (`20*log10(tp)`) sehingga tercetak `-180.00 dBTP` dan cabang limiter
      tidak pernah jalan

  Catatan: `src/videos/demo/Bridge.tsx:155` memakai `staticFile("saham_mix.wav")`; file ini
  kini ada di `public/` tapi di-ignore git (`public/*_mix.wav`) — hasilkan ulang per mesin.

## M5 — Fase 1: Look-dev Hero Stills (belum) — **WAJIB ARGON**

- [ ] `npm run render:stills` → `out/demo/stills/hero_f{35,355,1050,1250,1630}_*.jpg`
- [ ] Self-check tiap still: tanpa clipping, tanpa karakter terpotong frame, 9:16 safe margin
- [ ] Tampilkan ke user → **STOP, minta approval**

## M6 — Fase 2: Motion & Beat Previews (belum) — **WAJIB ARGON**

- [ ] `npm run render:previews` → 5 klip 1–3.5 s (`preview_1_hook` … `preview_5_volatilitas`)
- [ ] Review gerakan kamera, kick, timing kata, akting
- [ ] **STOP, minta approval**

## M7 — Fase 3: Final Render & Mux (belum) — boleh Flash (hemat)

- [ ] Beri tahu user untuk pindah ke model Flash sebelum render penuh
- [ ] `npm run render:video` → `out/demo/Demo_Video_Final.mp4`
- [ ] `npm run render:captions` → WebM transparan + Green Screen MP4 + `_With_Captions.mp4`
- [ ] QA: durasi = audio, audio tidak senyap, tidak ada frame hitam/putih/frozen ≥12 frame

## M8 — Housekeeping (belum)

- [ ] Commit `package-lock.json` (saat ini untracked)
- [ ] `.gitignore` memastikan `out/`, `public/*_mix.wav`, temp render tidak ikut ter-commit
- [ ] Bersihkan folder `remotion-webpack-bundle-*` di temp dir bila disk sesak
