# Zach's Arcade: assets

Everything the games need that isn't code: what it is, where it came from, and how to make more.

## Where these came from, and your "everything is true" rule

Claude made the sounds and sprites for this project on 2026-11-13. The sounds are synthesized from square waves, triangle waves and noise by a script; the sprites are drawn pixel by pixel from text grids by another script. No recordings, samples or existing artwork were used. Both scripts are in the pack's `tools/` folder, so you can see exactly how each one was produced.

You're free to use, change or replace all of it. To stay inside your own honesty rule, don't describe them as hand-made by you. A line in the README such as "Sound effects and sprites generated with AI assistance" covers it. Anything you later draw or record yourself can replace these one file at a time.

The two fonts are different: they are other people's work under an open licence. Details below.

---

## Sounds

`public/sounds/`, 29 files, about 420 KB together. All are mono WAV, 16-bit, 22,050 Hz. WAV is larger than MP3 but starts instantly with no decoding gap, which matters for short effects, and each file is only a few kilobytes.

Only the files named in the `FILES` list in `src/engine/audio.ts` are ever downloaded by a visitor. To use another sound, add one line there.

**I have not heard these.** Every file loads and decodes in Chrome, and the lengths and levels are as designed, but no one has listened yet. The square-wave ones are loud by nature, which is why the master volume in `audio.ts` is 0.5. If one is unpleasant, turn it down, swap it for another from the list, or remake it.

### Cabinet and menus

| File | Length | Meant for |
| --- | --- | --- |
| `start.wav` | 0.41 s | Starting a game |
| `pause.wav` | 0.19 s | Pausing |
| `resume.wav` | 0.19 s | Un-pausing |
| `gameover.wav` | 0.98 s | Game over |
| `highscore.wav` | 0.90 s | A new best score |
| `coin.wav` | 0.34 s | "Insert coin" moments |
| `blip.wav` | 0.04 s | Moving a menu highlight |
| `confirm.wav` | 0.14 s | Choosing a menu item |
| `back.wav` | 0.14 s | Going back |
| `extralife.wav` | 0.57 s | Gaining a life |
| `tick.wav` | 0.015 s | Countdowns, typing initials |

### Data Wyrm

| File | Length | Meant for |
| --- | --- | --- |
| `eat.wav` | 0.08 s | Eating a pellet |
| `bonus.wav` | 0.23 s | A special pellet |
| `crash.wav` | 0.38 s | Hitting a wall or yourself |

### Brick Blitz

| File | Length | Meant for |
| --- | --- | --- |
| `bounce.wav` | 0.06 s | Ball on paddle |
| `wall.wav` | 0.04 s | Ball on wall |
| `brick.wav` | 0.07 s | Breaking a brick |
| `launch.wav` | 0.16 s | Launching the ball |
| `lose.wav` | 0.55 s | Losing a life |
| `powerup.wav` | 0.32 s | Catching a power-up |
| `clear.wav` | 0.94 s | Clearing a level |

### Later games

| File | Length | Meant for |
| --- | --- | --- |
| `shoot.wav` | 0.10 s | Firing |
| `explode.wav` | 0.45 s | Explosions |
| `hit.wav` | 0.08 s | A small impact |
| `thrust.wav` | 0.30 s | An engine burst |
| `jump.wav` | 0.13 s | Hopping or jumping |
| `drop.wav` | 0.11 s | A piece landing |
| `rotate.wav` | 0.035 s | Rotating a piece |
| `line.wav` | 0.25 s | Clearing a row |

### Making more sounds

**With no files at all (works offline).** The browser can generate a tone itself. This is the whole technique; it was run in Chrome to confirm it works:

```ts
function beep(ctx: AudioContext, frequency: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square'; // also 'triangle', 'sawtooth', 'sine'
    osc.frequency.value = frequency; // 440 is the note A; double it for an octave higher
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration); // fade out
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
}
```

To make a pitch slide, which is most of what retro effects are, ramp the frequency too: `osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + duration)`. Look up `OscillatorNode` and `AudioParam` in DevDocs.

**With the script (offline, needs Python and numpy).** `tools/make_sounds.py` holds a short recipe for every file. Change a number, then run `python make_sounds.py ../public/sounds`.

**With a sound-effect generator (when you're online).** Search for "jsfxr". It's a free browser tool that makes retro effects from sliders and exports WAV files. Sounds you generate with it are yours to use.

---

## Sprites

`public/sprites/sheet.png` is a single 128×48 image holding 22 pictures, each in a 16×16 cell. `public/sprites/sheet.json` gives each one's position. Open `docs/offline/sprites-preview.png` to see them enlarged with their names.

| Names | For |
| --- | --- |
| `wyrm_head_right`, `wyrm_head_down`, `wyrm_head_left`, `wyrm_head_up` | The wyrm's head, one per direction |
| `wyrm_body` | A body segment |
| `pellet`, `star` | Food and a bonus item |
| `skull` | The head after a crash |
| `heart`, `coin` | Lives and pickups |
| `ball` | Brick Blitz ball (the drawn ball is 10 pixels wide, centred in its cell) |
| `paddle_left`, `paddle_mid`, `paddle_right` | A paddle in three pieces: draw left, repeat mid, draw right, for any width |
| `brick_pink`, `brick_cyan`, `brick_yellow`, `brick_orange` | Bricks. These are 16×8, the top half of their cell |
| `capsule` | A falling power-up |
| `spark_1`, `spark_2`, `spark_3` | Three frames of a small burst; show each for about 0.06 s |

They are simple, and they are optional. The game looks right without them, and drawing shapes in code is the easier route for a neon style. Stage 11 in the roadmap shows how to use them and when it's worth it.

**Scale pixel art by whole numbers only** (16 → 16, 32, 48). Anything in between stretches some pixels and not others.

### Making more sprites

**As text, in your code (works offline, no tools).** `spriteFromRows` in `SOLUTIONS.md` section J turns an array of strings into a picture: one character per pixel, with a small palette saying which character is which colour. This is how every sprite in the sheet was designed. Sketch on squared paper first if it helps.

**With the script (needs Python, numpy and Pillow).** `tools/make_sprites.py` contains the text grid for every sprite. Edit a grid, or add one, then run `python make_sprites.py ../public/sprites`. It rebuilds the sheet, the JSON and a preview.

**With a pixel editor (when you're online).** Piskel is free and runs in the browser. LibreSprite is free and installs on Windows. Aseprite is the paid standard. Export a PNG with a transparent background.

**With free art packs (when you're online).** Sites such as Kenney and OpenGameArt offer art you can use without paying. Two cautions. Read the licence on each pack: "CC0" asks for nothing, "CC-BY" requires a visible credit. And since your site says the games are original works, credit any art you didn't make, even where the licence doesn't require it.

**Never use sprites ripped from real games,** even "just as placeholders". That's the one thing your legal rule exists to prevent.

---

## Fonts

`public/fonts/`

| File | Font | Used for |
| --- | --- | --- |
| `press-start-2p.woff2` | Press Start 2P | Headings, menus, canvas text |
| `vt323.woff2` | VT323 | Body text |
| `press-start-2p-LICENSE.txt`, `vt323-LICENSE.txt` | | The licences |

These are the same two fonts your site already loads from Google, taken from the open-source Fontsource packages on npm. Both are under the SIL Open Font License 1.1, which allows you to use and host them, including on a commercial site, as long as the licence text travels with the font files. That's why the two `.txt` files sit beside them. Leave them there.

Each file holds the Latin character set: English letters, digits, punctuation and accented letters such as the é in Résumé. A character it doesn't contain, such as the ► on your menu, falls back to a system font, which is what already happens today.

Task 0.6 in the roadmap switches the site over to these files.

**The same thing through npm (when you're online).** `npm install @fontsource/press-start-2p @fontsource/vt323`, then `import '@fontsource/press-start-2p';` in `main.tsx`. It does the same job and updates with `npm update`. Hand-placed files are simpler to understand; the package is less to maintain. Either is fine.

---

## Things you don't need files for

- **The carpet, cabinet, joystick and buttons** are CSS and one SVG you already have.
- **Glow** is `ctx.shadowBlur` and `ctx.shadowColor` (roadmap task 10.2).
- **Colours** come from the variables on `:root` in `index.css` (task 10.1).
- **Asteroid-style rocks and ships** are better drawn as outlines with `ctx.beginPath`, `moveTo`, `lineTo` and `stroke` than as sprites, because they need to rotate smoothly.
