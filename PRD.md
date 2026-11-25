# PRD — 2D-in-3D Animation Framework (Comic Shorts Engine)

Status: living document. Sumber kebenaran aturan visual & model ada di `GUIDELINES.md`.
Progres task ada di `MILESTONES.md`.

## 1. Tujuan

Framework otomasi untuk memproduksi **short vertikal 9:16 (1080x1920 @ 30 fps, ~55–70 s)**
bergaya *2D-in-3D Comic*: karakter 2D card billboard di dalam dunia 3D prosedural, dengan
ink outline, DoF, grade sinematik, SFX prosedural, dan subtitle kinetik.

Bukan tujuan: pipeline yang butuh aset FBX/Blender, atau model 3D eksternal berat.
Seluruh dunia, material, dan karakter digambar **prosedural lewat kode**.

## 2. Definisi Sukses (Definition of Done)

Sebuah video dianggap selesai hanya jika **semua** poin ini terpenuhi:

1. `npx tsc --noEmit` bersih (0 error) di seluruh `src/`.
2. Fase 1 (Hero Stills) dan Fase 2 (Beat Previews 1–3.5 s) sudah dirender dan **disetujui user**.
3. Video final MP4 1080x1920 H.264 ada di `out/<proyek>/`, bersuara (voice + SFX mix), durasi
   sama dengan durasi audio voiceover (±1 frame).
4. Audio master ter-normalisasi **-14.0 s/d -15.0 LUFS**, true peak di bawah **-1.5 dBTP**.
5. 4 Kaidah Emas lolos self-check di setiap shot: grounding fisik (tidak melayang, tidak
   clipping), motivated lighting, aksi karakter fisik nyata, kamera tidak statis.
6. Safe margin 9:16 dipatuhi: badge/teks 3D di `x` antara `-0.2`..`+0.25`, lebar papan ≤ `1.8 m`,
   tidak ada teks terpotong frame (pakai auto-fit `ctx.measureText()`).
7. Caption/overlay bebas dari kata yang tumpang tindih frame dan sinkron dengan `words.json`
   (toleransi ±2 frame).

## 3. Arsitektur

```
src/index.ts               registerRoot
src/Root.tsx               registrasi komposisi Remotion (1080x1920 @ 30 fps)
src/videos/<proyek>/       satu folder per video
  story.ts                 SHOTS, XFADE, FLASH_AT, CAMS, KICKS, dofAt, camAt, worldState
  world.ts                 sky shader, fog, light rig per shot, per-frame posing
  build.ts                 set 3D prosedural + tekstur (mergeGeometries, ctex/paint)
  paint.ts                 tekstur Canvas2D HD (marmer, kayu, grid neon, rumput, fasad)
  cast.ts                  karakter billboard, bayangan kontak, walk/hop/blink
  toon.ts                  Pen/Canvas2D drawing 2D (600x1000 design canvas, soles y=975)
  lights.ts / shade.ts     preset LIGHTS + LOOK, two-tone shading
  cardshade.ts             pencahayaan kartu karakter dari scene
  ink.ts                   InkPass (outline dunia), layer NOINK untuk kartu karakter
  lensblur.ts              LensBlur pre+main (DoF), GrainEffect (default OFF)
  grade.ts                 GradeEffect, GRADES, GRADE_STRENGTH
  Bridge.tsx               komposisi Remotion: composer ink→lens→bloom→tonemap→grade
  CaptionsOnly.tsx         overlay caption transparan
scripts/                   render-stills / render-previews / render-video / render-captions
                           gen-audio.py (DSP SFX + mix), gen-chunks.py (chunk caption 1–2 kata)
skill/                     SKILL.md + references (STYLE_BIBLE, reports, frames) + templates
public/                    aset audio yang dipakai `staticFile()`
voice/                     sumber voiceover: .mp3, .srt, .json (word timings)
```

Kontrak antar modul (jangan diubah tanpa meng-update semua pembaca):
`NOINK` (ink.ts), `dofAt`/`FOREGROUND` (story.ts), `LIGHTS`/`LOOK` (lights.ts),
`TOTAL`/`SHOTS`/`layersAt` (story.ts), `Kit` (build.ts), `WorldState` (story.ts).

## 4. Alur Produksi (3 Fase, wajib checkpoint)

| Fase | Isi | Model wajib |
| :-- | :-- | :-- |
| 0 | Persiapan: baca file, ekstrak SRT/JSON, cek durasi audio | Flash / apa pun |
| 1 | Look-dev Hero Stills (`build/world/cast/toon/lights` + 5 still) → **STOP, minta approval** | **ARGON** |
| 2 | Motion & Beat Previews 1–3.5 s (kamera, akting, kicks) → **STOP, minta approval** | **ARGON** |
| 3 | Full render + audio mix + mux caption | Flash (hemat) |

Aturan keras: bila sesi berjalan dengan model non-ARGON, agen **dilarang** menulis kode
visual 3D (`build.ts`, `world.ts`, `cast.ts`, `story.ts`, `toon.ts`) atau merender preview.
Agen wajib STOP dan meminta user ganti model.

## 5. Kontrak Tooling (lintas platform)

- Script render harus jalan di **Linux dan Windows**: tidak boleh ada path hardcode
  (`D:/remotion-tmp`, `C:/Program Files/Google/Chrome/...`).
- Browser resolusi urutan: `CHROME_PATH` env → deteksi sistem (`google-chrome`, `chromium`,
  `chromium-browser`) → fallback ke browser bawaan Remotion.
- Temp dir: `REMOTION_TMP` env (dibuat jika belum ada) → `os.tmpdir()/remotion-tmp`.
- `chromiumOptions.gl` hanya `"angle"` bila `REMOTION_GL=angle` diset (default: biarkan Remotion).
- Cache bundel Remotion menumpuk di temp dir; bersihkan manual saat disk sesak
  (jangan pernah menghapus saat render berjalan).

## 6. Kalibrasi Visual (dari `skill/references/`)

Angka acuan (bukan selera): ink dunia ~3 px @1080, warna `#0b0a0c`, karakter `NOINK`;
DoF aktif ~1/3 screen time dengan `cInf` 10–16 px @1080, fokus di mata; fog = warna horizon;
bloom hanya pada emissive HDR (threshold 1.0); ketinggian karakter ~3.5 head-heights;
kamera hold selalu push-in 0.15–0.35 %/frame (0.6 %/frame pada kata tekan); kick 7 frame
dengan flip tanda tiap frame; grain OFF (tidak ada di referensi, melipatgandakan ukuran file).

## 7. Risiko yang Diketahui

- Render 2K berjalan ~4 fps (≈10 menit untuk 67 s). Selalu set temp dir ke disk besar.
- Ink harus pass terpisah sebelum blur; bila digabung dalam satu pass, garis tertimpa DoF.
- Parameter post berukuran piksel harus diskalakan terhadap tinggi output (`/1920`).
- Remotion menulis audio track senyap: mux dengan `-map 0:v:0 -map 1:a:0`.
