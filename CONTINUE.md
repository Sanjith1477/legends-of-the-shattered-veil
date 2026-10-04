# Legends of the Shattered Veil — Project Handoff

Read this first, then read only the specific files you need to edit. Do not bulk-read the whole project.

## What this is
A browser action-RPG ("pocket MMORPG") built as a single-page game. Top-down canvas combat, endless waves, 8 playable legends, level-up power drafts, between-wave market, boss fights, local + cloud accounts, leaderboards.

## Stack & run
- Vite + React 19 + TypeScript + Tailwind CSS v4 (utility classes only, theme tokens in `src/index.css`).
- `npm install`, then `npm run dev` (dev) / `npm run build` (prod, single-file output).
- No backend required. Supabase is **optional**: works offline via localStorage; add `.env` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to enable cloud accounts/leaderboards.
- Icons are inline SVG (custom set, `ClassEmblem.tsx`, `PowerIcon.tsx`). Audio is fully procedural WebAudio (`audio.ts`, `music.ts`). No external assets.

## File map
- `src/game/engine.ts` (~3.7k lines) — the whole simulation: player, enemies, AI, bosses, waves, camera, rendering, particles, HUD data bus, rerolls, shop/levelup state machine. Edit with care.
- `src/game/data.ts` — classes, zones, enemy defs, wave composition, powers, shop items, rarity meta.
- `src/game/lore.ts` — per-legend sagas + legacy ability defs.
- `src/game/audio.ts` / `music.ts` — synthesized SFX + zone/boss music.
- `src/game/highscores.ts` — local profiles, SHA-256 password hashing, score ledger, dedupe-per-player logic.
- `src/game/collection.ts` — power/item discovery tracking.
- `src/game/patchnotes.ts` — bundled patch notes (version source of truth, currently 3.2.0).
- `src/lib/supabase.ts` / `api.ts` — cloud client + typed API wrappers.
- `supabase/migrations/0001–0005*.sql` — schema, RLS, boss/discovery/odds migrations. User must run these in the Supabase SQL Editor.
- `src/components/` — React overlays: StartScreen, HUD, TouchControls, LevelUpOverlay, ShopOverlay, LoreCodex ("Sagas"), ProgressionIndex, Leaderboard, HighScoreList, AccountPanel (login/signup), ProfilePanel, SettingsOverlay, PatchNotesOverlay, TutorialOverlay, VolumeControl, RarityOdds, PauseOverlay, GameOverScreen.

## Key systems & numbers
- 8 legends, unlock at waves: kensei 0, shieldthane 8, jaguar 15, sandseer 25, tidecaller 40, riftblade 60, stormwarden 80, drakewarden 100.
- Boss every 5th wave; boss variant + color + special attack per realm (5 realms).
- Power/shop rarities: common/rare/epic/legendary. Powers: legendary unlocks at Lv 5, odds rise per level. Shop: epic at wave 5, legendary at wave 10, odds rise per wave.
- 3 shared rerolls (level-up + market), restored on boss kill. Keys: 1/2/3 choose, R reroll.
- Leaderboard: deduped to best score per player (per hero in storage), ranked by score only.
- Abandoning a run (TITLE from pause or game-over) still banks progress exactly once (guarded by `inscribedKeyRef` in App.tsx).
- Difficulty scales with wave (hp/dmg/speed/elite/cap/spawnGap curves in `difficulty()`).

## Conventions
- Tailwind utility-first; shared UI atoms are CSS classes in `index.css` (`panel`, `panel-gold`, `btn-gold`, `btn-dark`, `clip-notch`, `kbd`, `bar-shell`).
- HUD updates are imperative via a `HudBus` pub/sub (refs + direct DOM writes) to avoid React re-renders during gameplay. Overlays are React.
- Engine exposes a small public API: `start`, `restart`, `setPaused`, `toMenu`, `getStats`, `choosePower`, `rerollPowers/Shop`, `buyShopItem`, `continueFromShop`, `pushWorldEvent`, `unlockAudio`, `setVolumes`.
- `App.tsx` owns React state, auth, saves, and wires engine callbacks to screens.

## If asked to continue
1. Read this file.
2. Read only the files relevant to the request.
3. Keep edits surgical; the engine file is large — prefer targeted edits over rewrites.
