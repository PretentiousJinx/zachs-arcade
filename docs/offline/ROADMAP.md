# Zach's Arcade: offline roadmap

Written 2026-11-13 against your `dev` branch at commit `e0780ad`.

This takes Data Wyrm from "a snake that eats" to a finished cabinet with a working joystick, buttons, Start and Select, sound, high scores and tests. Then it starts Brick Blitz.

Three documents work together:

| File | What it is | When to open it |
| --- | --- | --- |
| `ROADMAP.md` (this file) | The ordered tasks, what "done" means, and where to look things up | Always |
| `SOLUTIONS.md` | Complete, tested code for the hard stages | After you've tried and used the hints |
| `ASSETS.md` | What every sound, sprite and font is, and how to make more | When a stage uses an asset |

**How much of this was tested:** I built every stage on a copy of your branch before writing it down. The finished version builds, passes lint, passes 21 unit tests, and I drove it in Chrome with the keyboard, the mouse and touch at five screen sizes. The one thing I could not do is listen: the sound files load and decode correctly, but nobody has heard them yet. You'll be the first.

---

## How to use this guide

Every task follows the same loop. It's the loop professional developers use.

1. Read the **Goal** and the **Done when** list. That list is your test plan.
2. Try it. Use the **Look up** pointers before the hints.
3. Stuck for about 20 minutes? Open **Hint 1**. Still stuck? The next hint.
4. Only then open `SOLUTIONS.md`. When you do, type the code out instead of pasting it, and stop at every line you can't explain.
5. Check every item in **Done when**.
6. Run the three checks: `npm run build`, `npm run lint`, and `npm test` once tests exist.
7. Commit. One task, one commit. The suggested messages are only suggestions.

Hints are folded shut so you don't read them by accident. In VS Code, open this file and press **Ctrl+Shift+V** to see the preview, where they click open.

**You can commit with no internet.** Commits are saved on your laptop. `git push` is the only step that needs a connection, and it can wait until you're back.

**If a stage won't budge,** don't lose the day to it. Stages 0 to 6 build on each other, but these need nothing else and can be done any time:

- Appendix A (chores): small, separate fixes.
- Stage 8 (high scores): `scores.ts` and its tests stand alone.
- Stage 13's physics helpers: plain maths with tests.

**Last resort:** the pack's `reference/` folder holds the complete finished project. To compare one of your files against it in VS Code, right-click the reference file in the Explorer and choose **Select for Compare**, then right-click your file and choose **Compare with Selected**. The differences are highlighted side by side.

**A realistic pace:** Stages 0 to 6 are a solid two days. Everything after that is there so you never run out, not because you're expected to finish it.

---

## Working with no internet

You can't search the web, so here is what replaces it.

| You need | Use this |
| --- | --- |
| What a browser feature does (canvas, audio, pointer events, storage) | **DevDocs**, which you installed. Search the exact names in each stage's **Look up** line. Most are under "Web APIs". |
| The exact parameters of a function | **Hover** over it in VS Code. For more, put the cursor on it and press **F12** (Go to Definition). For browser features this opens `lib.dom.d.ts`, a file already on your disk that describes every browser API with a short comment. |
| "What methods does this thing have?" | Type the name and a dot (`ctx.`) and read the autocomplete list. |
| "What does this expression give me?" | The browser **Console** (F12 in Chrome). Type `Math.floor(Math.random() * 20)` and press Enter. It's a scratchpad for any JavaScript. |
| "What is the code doing right now?" | `console.log(...)`, or write `debugger;` on its own line. With DevTools open, the page freezes there and you can hover over variables and step line by line. |
| "It worked ten minutes ago" | `git diff` shows everything changed since your last commit. `git restore src/games/snake.ts` throws away changes to one file. `git stash` sets all changes aside; `git stash pop` brings them back. |
| How a tool works | `npx vitest --help`, `npx prettier --help`, `npm run` (lists your scripts). |
| How one of your own features works | Your own code. `Menu.tsx` already solves "tilt the joystick while a key is held". |

**Reading errors:** always fix the *first* error, not the last; later ones are often echoes of it. An error names a file and a line (`src/games/snake.ts:46:13` is line 46, column 13). Read the message out loud before changing anything.

**What will not work offline:** `vercel dev`, the contact form, the captcha, and `git push`. Use `npm run dev` and open the address it prints. Until you finish task 0.6, the pixel fonts may also fall back to plain ones, because they currently come from Google.

---

## The map

| # | Stage | Main ideas | Difficulty | Full solution? |
| --- | --- | --- | --- | --- |
| 0 | Setup and safety net | Prettier, lint, self-hosted fonts | Easy | Hints only |
| 1 | Snake cleanup | Small refactors, edge cases | Easy | Hints only |
| 2 | Actions, not keys | Union types, lookup tables, a tiny store | Medium | A |
| 3 | Start, pause, game over, restart | State machines, canvas text | Hard | B |
| 4 | Build the cabinet (looks only) | Composition, layout budgets | Medium | C |
| 5 | Make the controls work | Lifting state up, pointer events | Hard | D |
| 6 | Escape and tab switching | Cooperating event handlers | Medium | E |
| 7 | Sound | Web Audio, dependency injection | Hard | F |
| 8 | High scores | localStorage, never trusting stored data | Medium | G |
| 9 | Tests | Vitest, controlling randomness | Medium | H |
| 10 | Polish and your twist | Theme colours, glow, game design | Easy to medium | I |
| 11 | Sprites (optional) | Sprite sheets, pixel-perfect scaling | Medium | J |
| 12 | Ship Data Wyrm | Release checklist | Easy | Checklist |
| 13 | Brick Blitz kickoff | Collision, velocity, levels as data | Hard | K (physics only) |

---

## Stage 0. Setup and safety net

### 0.1 Unpack

Copy everything **inside** the pack's `copy-into-project` folder into your project root, so the `docs`, `public` and config files merge with yours. Keep the pack's `reference`, `specs` and `tools` folders somewhere **outside** the project, such as your Desktop. If they sit inside the project, your tools will try to lint and test them.

**Done when** `git status` lists new files under `docs/offline/`, `public/fonts/`, `public/sounds/` and `public/sprites/`, plus `.prettierrc.json` and `.prettierignore`.

### 0.2 Confirm your tools

Run `npx vitest --version` and `npx prettier --version`. Each should print a version number.

If one is missing and you're already offline, carry on. Without Prettier, skip 0.4. Without Vitest, skip the "copy the spec file" steps and Stage 9, and rely on the **Done when** lists.

### 0.3 Add scripts

In `package.json`, add three entries to `"scripts"`: `test` runs `vitest run`, `test:watch` runs `vitest`, and `format` runs `prettier --write .`

**Done when** `npm run` lists all three. Commit: `Add test and format scripts`.

### 0.4 Format everything, once

Brackets have caused most of your bugs. A formatter makes the *shape* of the code visible: when a brace is missing, the indentation jumps and you see it at once.

The `.prettierrc.json` I supplied matches how you already write: 4 spaces in code, 2 in CSS, single quotes.

1. Commit any work in progress first.
2. Run `npm run format`, then `npm run build`.
3. Commit this alone as `Format code with Prettier`. Keeping it separate means later `git diff`s show only real changes.
4. In VS Code settings (Ctrl+,), turn on **Format On Save** and set **Default Formatter** to Prettier.

**Done when** saving a messy file tidies it, and a file with a missing brace refuses to format.

### 0.5 Make lint pass

`npm run lint` currently reports three errors in `snake.ts`. Read them and fix them. Then work out why the rule exists.

<details><summary>Hint</summary>

All three are `prefer-const`. `const` promises a variable is never *reassigned*. You can still `push` to a `const` array, because that changes the array's contents, not which array the name points to. The promise helps a reader: anything declared with `let` is a signal that it changes later.

</details>

**Done when** `npm run lint` prints nothing. Commit: `Fix lint errors in snake`.

### 0.6 Serve the fonts yourself

Your fonts load from Google, so they need a connection, and every visitor's browser contacts a third party. The files are now in `public/fonts/`. Make the site use them.

**Look up:** DevDocs → CSS → `@font-face`, `font-display`.

<details><summary>Hint 1</summary>

Two changes. In `index.html`, remove the three `<link>` lines that mention `fonts.googleapis.com` or `fonts.gstatic.com`. At the top of `index.css`, add one `@font-face` block per font.

</details>

<details><summary>Hint 2</summary>

```css
@font-face {
  font-family: 'Press Start 2P';
  src: url('/fonts/press-start-2p.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

Write the second one for `VT323` and `/fonts/vt323.woff2`. Files in `public/` are served from the site root, which is why the path starts with `/fonts/`.

</details>

**Done when** the pixel fonts show with Wi-Fi off, and the Network tab in DevTools shows two requests to `/fonts/...` and none to Google. Keep the two licence files next to the fonts; the licence asks for that. Commit: `Self-host fonts`.

### 0.7 Fix the food bug

In `step`, the eating check still compares only `x`. Make it require both.

**Done when** the wyrm can pass above or below a pellet without eating it. Commit: `Fix food check to compare both axes`.

---

## Stage 1. Snake cleanup

Small changes that don't alter how the game plays. Tidying while behaviour stays the same is called *refactoring*, and the rule is: change one thing, test, commit.

### 1.1 One function for "same cell"

You compare two cells' `x` and `y` in three places. Write a small function that does it and use it everywhere. Next time the comparison is wrong, it's wrong in one place.

**Done when** `step` and `placeFood` contain no hand-written `.x === ... && .y === ...`.

### 1.2 Cap the turn queue

Mash the arrow keys and the wyrm keeps turning long after you stop, because every tap is queued. Limit the queue to three waiting turns.

### 1.3 The full board

`placeFood` loops until it finds a free cell. What happens when there are none? Decide what the game should do when the wyrm fills the board, and make it do that instead of freezing the browser.

<details><summary>Hint</summary>

After eating, compare `snake.length` with `COLS * ROWS` *before* calling `placeFood`. Filling the board is the best possible game, so ending it is reasonable.

</details>

### 1.4 Remove the demo

`src/games/demo.ts` has done its job. Delete it. Git still has it if you ever want it back (`git log --oneline -- src/games/demo.ts`).

Commit after each. **Done when** the game plays exactly as before and build and lint pass.

---

## Stage 2. Actions, not keys

**Goal:** the game stops knowing that a keyboard exists.

Right now `snake.ts` asks "was `ArrowUp` pressed?". Soon an on-screen joystick will also need to mean "up", and so will the W key. If every game checks every device, each new device means editing every game. So put a translator in the middle: devices produce **actions** (`up`, `down`, `left`, `right`, `a`, `b`, `start`, `select`), and games only ever see actions.

### What to build

1. **In `src/games/types.ts`:** a type `Action` that can only be one of those eight words. Change `Input` so `held` is a `Set<Action>` and `pressed` is an `Action[]`.
2. **A new file `src/engine/input.ts`** exporting three things:
   - `KEY_MAP`: an object from a physical key to an action. Use `event.code` names (`ArrowUp`, `KeyW`, `Space`, `Enter`, `ShiftLeft`), not `event.key`.
   - `createInput()`: returns a small "store" object holding the input state, with the methods below.
   - `attachKeyboard(input)`: adds the key listeners, and returns a function that removes them.
3. **In `GameCanvas.tsx`:** delete its own key handlers and use the store.
4. **In `snake.ts`:** react to actions. Replace the four `if`s with one lookup table.

The store's methods:

| Method | What it does |
| --- | --- |
| `state` | The `Input` object the game reads |
| `press(action)` | Marks it held and adds it to `pressed`, unless it's already held |
| `release(action)` | Un-holds it |
| `releaseAll()` | Un-holds everything |
| `endFrame()` | Empties `pressed`. The loop calls this after each update |
| `subscribe(listener)` | Calls `listener` whenever something is pressed or released. Returns a function that stops it |

**Test first:** copy the pack's `specs/input.test.ts` into `src/engine/`, run `npm run test:watch`, and build the store until all five tests go green. The tests are the exact specification.

**Why `event.code`?** `event.key` is the character typed, so it changes with Caps Lock (`w` becomes `W`) and with keyboard layout. `event.code` is the physical key's position, which is what a game cares about.

**Look up:** DevDocs → `KeyboardEvent.code`, `KeyboardEvent.repeat`, `Set`. TypeScript → "Everyday Types" (union types and literal types), "Utility Types" (`Record`, `Partial`).

<details><summary>Hint 1: the Action type</summary>

A type can be a list of exact strings joined with `|`. TypeScript then refuses any other string, and autocompletes the valid ones.

</details>

<details><summary>Hint 2: the key map</summary>

`Record<string, Action>` means "an object whose keys are strings and whose values are Actions". Looking up a key that isn't in it gives `undefined`, which is exactly the signal for "not a game key, ignore it".

</details>

<details><summary>Hint 3: subscribe</summary>

Keep a `Set` of listener functions inside `createInput`. `subscribe` adds one and returns `() => { listeners.delete(listener); }`. Returning the undo function is the same pattern as a `useEffect` cleanup, and Stage 5 uses it for exactly that.

</details>

<details><summary>Hint 4: the lookup table in snake.ts</summary>

`Partial<Record<Action, Cell>>` is "an object that may have a `Cell` for some actions". Put the four directions in it. In `update`, look up each pressed action; if you get a cell back, queue it. `a` and `start` give `undefined` and are skipped with no extra code.

</details>

**Done when**

- All five input tests pass.
- Arrow keys and WASD both steer, with Caps Lock on and off.
- Holding a key down doesn't flood the queue.
- Hold an arrow, click another window, release the key, come back: nothing is stuck.
- `snake.ts` contains no key names.

Solution: **A**. Commit: `Translate keys into actions`.

---

## Stage 3. Start, pause, game over, restart

**Goal:** the cabinet has four states, and Start moves between them.

```
            Start                Start
  title ───────────► playing ◄──────────► paused
                        │
                        │ the game ends
                        ▼
                      over ───────────► playing (a brand-new game)
                               Start
```

This picture is a **state machine**: a fixed set of states and the exact events that move between them. Drawing one before coding is the best single habit for anything with modes. Every bug of the kind "it paused while I was on the title screen" is an arrow you forgot to think about.

### What to build

1. **The game reports on itself.** Add `isOver(): boolean` and `getScore(): number` to the `Game` type. TypeScript will then point at everything that needs updating.
2. **`GameCanvas` owns the phase.** A variable that is one of `'title' | 'playing' | 'paused' | 'over'`.
3. **The loop obeys it.** Only call `game.update` while playing. Always draw. When not playing, draw a dimmed overlay with text on top: the game's name and PRESS START; PAUSED; or GAME OVER with the score.
4. **Start (Enter) follows the arrows above.** Restarting means calling `createGame()` again. This is why games are built by a function: a fresh call gives a completely fresh game, with no "reset every variable" code to forget.
5. **Tell screen readers.** A canvas is a blank picture to assistive technology. Add a visually hidden paragraph with `role="status"` whose text changes when the phase changes ("Paused. Press Start to resume.").

**Why does the engine own the phase and not the game?** All eight games need title, pause and game over. Written once in the engine, every future game gets them for free, and each game shrinks to "update and draw".

**Look up:** DevDocs → `CanvasRenderingContext2D.fillText`, `textAlign`, `textBaseline`, `save`, `restore`. React → `useState`.

<details><summary>Hint 1: the phase variable</summary>

It lives inside the effect as a plain `let`, next to `game`. It is not React state: the loop reads it 60 times a second, and nothing on the page needs to re-render when it changes.

</details>

<details><summary>Hint 2: Start</summary>

At the top of each frame, before updating, loop over `input.state.pressed` looking for `'start'` and call one function that looks at the current phase and decides the next one. `game` must be declared with `let` so restart can replace it.

</details>

<details><summary>Hint 3: a trap</summary>

Call `input.endFrame()` on every frame, including frames where the game is paused. Otherwise the same Start press is seen again next frame and the game un-pauses itself immediately.

</details>

<details><summary>Hint 4: overlay text</summary>

`ctx.save()` remembers the current drawing settings and `ctx.restore()` puts them back. Wrap the overlay in that pair so its `textAlign = 'center'` doesn't leak into the game's own score text. Centered text is drawn at `width / 2`.

</details>

<details><summary>Hint 5: the status text</summary>

This one *is* React state, because it's on the page. Call its setter only at the moment the phase changes, never once per frame. For the hidden style, search DevDocs for "clip-path"; the usual class name is `sr-only`.

</details>

**Done when**

- The game opens on a title overlay and nothing moves.
- Enter starts, Enter pauses, Enter resumes.
- Dying shows GAME OVER and the final score; Enter starts a fresh game at score 0.
- Pressing Enter many times quickly never leaves it in a strange state.
- Going Back and returning shows the title again.

Solution: **B**. Commit: `Add title, pause, game over and restart`.

---

## Stage 4. Build the cabinet (looks only)

**Goal:** the play screen becomes its own arcade cabinet with a control deck. Nothing is clickable yet; this stage is layout.

```
┌──────────────────────────────┐
│          DATA WYRM           │  marquee: the game's name
│  ┌────────────────────────┐  │
│  │                        │  │
│  │         canvas         │  │  screen
│  │                        │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  (o)   [SELECT]    (B) │  │  control deck
│  │   |    [START]   (A)   │  │
│  └────────────────────────┘  │
│  Back      keys reminder     │  footer
└──────────────────────────────┘
```

### What to build

1. **`src/components/GameCabinet.tsx`**: the whole layout above. `PlayScreen` renders it for a valid game, and keeps using `ScreenFrame` for GAME NOT FOUND.
2. **`src/components/ControlDeck.tsx`**: the joystick, two small pill buttons, two round buttons. You already have the joystick and button styles on the menu: reuse those class names.
3. **CSS** for the new pieces.

**Why a new component and not more props on `ScreenFrame`?** `ScreenFrame` is built for scrolling content with a title. A game screen has neither. When a component needs a pile of "unless it's a game" switches, it wants to be two components that share CSS classes.

**Use real `<button type="button">` elements** for everything that will be pressable, each with a visible label or an `aria-label`. A `<span>` with a click handler can't be reached or announced properly.

**The height budget.** This is the trap in this stage. Everything must fit in the window with no scrolling, because a page that scrolls while you play is unplayable. Your own laptop window is about 620 CSS pixels tall. Add up everything that is *not* the canvas (page padding, cabinet border and padding, marquee, screen padding, deck, footer), and the canvas gets what is left. Keep the same idea as your current rule, `max-height: max(minimum, calc(100vh - everything-else))`, with a new number. Make the deck and marquee compact to leave the canvas room.

**Look up:** your own `Menu.tsx` and the `.controls`, `.joystick`, `.btn` rules. DevDocs → CSS → `calc()`, `max()`, `gap`. To measure an element, right-click it → Inspect and hover over it in the Elements panel; its size appears.

<details><summary>Hint 1: reuse</summary>

Give the deck two classes: `controls` to inherit the menu's look, and a second one such as `controls--game` to adjust sizes for games only. That's the same double-class pattern as `screen screen--content`.

</details>

<details><summary>Hint 2: buttons that used to be spans</summary>

A `<button>` brings a default border and padding. Reset them for `button.btn` so it looks like the menu's `<span class="btn">`.

</details>

<details><summary>Hint 3: the old canvas rules</summary>

The canvas is no longer inside `.screen--content`, so the `.screen--content:has(.game-canvas)` rule and `align-self: center` are no longer needed. Remove them.

</details>

**Done when**

- The marquee shows the game's name and the deck looks like part of the same machine.
- No scrollbar at your normal window size.
- In DevTools device mode (Ctrl+Shift+M) at 390×800 and 360×640, everything fits across and nothing overlaps.
- The menu screen is unchanged.

Solution: **C**. Commit: `Add game cabinet layout with control deck`.

---

## Stage 5. Make the controls work

**Goal:** the on-screen joystick and buttons do exactly what the keys do, and they move when you use the keyboard too.

This is the hardest stage. It has three ideas, so take them one at a time and commit after each.

### 5.1 Share one input store ("lifting state up")

The deck needs to *write* to the input store and the canvas needs to *read* it. At the moment the store is created inside `GameCanvas`, where the deck can't reach it. When two components need the same thing, it moves up to their nearest common parent, which hands it to both. Create the store in `GameCabinet` and pass it to `GameCanvas` and `ControlDeck` as a prop.

The catch: a component function runs again on every render, and you need the *same* store every time, not a new one.

**Look up:** React → "Sharing State Between Components"; `useState` → "Avoiding recreating the initial state".

<details><summary>Hint</summary>

`const [input] = useState(createInput);` Passing the function itself (no parentheses) tells React to call it once, on the first render, and keep the result. `useRef(createInput())` would build a new store on every render and throw it away. Then add `input` to the effect's dependency list in `GameCanvas`.

</details>

**Done when** the game plays exactly as before. Commit.

### 5.2 Buttons: pointer events

Mouse, finger and stylus all produce the same **pointer events**, so one set of handlers covers every device. A game button isn't a click (which fires on release): it's *down* and *up*. Wire each button so pointer-down calls `input.press(action)` and pointer-up calls `input.release(action)`.

Two details separate a working button from one that sticks:

- A finger can slide off the button before lifting, and then the button never hears the release. **Pointer capture** makes the element keep receiving that pointer's events wherever it goes.
- The browser can cancel a touch (for example when it decides you're scrolling). Handle that too.

In CSS, give the deck `touch-action: none` so presses aren't treated as scroll or zoom gestures, and `user-select: none` so a long press doesn't select text.

**Look up:** DevDocs → "Pointer events", `Element.setPointerCapture`, `pointercancel`, CSS `touch-action`.

<details><summary>Hint</summary>

Write one function that takes an action and returns an object of handlers, then spread it onto each button: `<button {...buttonHandlers('start')}>`. The handlers are `onPointerDown`, `onPointerUp`, `onPointerCancel` and `onLostPointerCapture`. In `onPointerDown`, call `event.currentTarget.setPointerCapture(event.pointerId)` first.

</details>

**Done when** you can play start-to-pause-to-restart with only the mouse. In device mode, tapping works. Press a button, drag off it and let go: it is not stuck. Commit.

### 5.3 The deck reacts to the keyboard

Pressing Enter should make the on-screen START button dip; holding an arrow should tilt the stick. The deck needs to know what's held, and the store isn't React state, so React doesn't know when it changes. That's what `subscribe` is for: the deck keeps its own small copy of `held` in state and refreshes it whenever the store announces a change.

<details><summary>Hint 1</summary>

One `useEffect` that subscribes and returns the unsubscribe function. Because `subscribe` already returns that function, the effect body can be a single `return input.subscribe(...)`.

</details>

<details><summary>Hint 2</summary>

When copying into state, make a **new** `Set` (`new Set(input.state.held)`). React compares old and new values to decide whether to re-render; handing it the same Set object again looks like "nothing changed".

</details>

<details><summary>Hint 3: tilting in four directions</summary>

`Menu.tsx` tilts with CSS classes for up and down. With four directions it's simpler to compute two angles from `held` and write the transform as an inline `style`. Rotating around X tips the stick toward and away from you; rotating around Z leans it left and right.

</details>

**Done when** every key visibly moves its on-screen control. Commit.

### 5.4 The joystick

Make the stick itself steer. On pointer-down and on every pointer-move, work out which way the pointer is from the centre of the joystick area and press that direction. When the direction changes, release the old one and press the new one. On release, let go.

For a four-way stick, compare how far the pointer is horizontally and vertically from the centre: the larger one wins. Leave a small "dead zone" in the middle that does nothing, so a tap dead centre doesn't pick a random direction.

**Look up:** DevDocs → `Element.getBoundingClientRect`, `MouseEvent.clientX`, `Math.abs`. React → `useRef` (to remember which direction the pointer currently holds without re-rendering).

<details><summary>Hint 1: the maths</summary>

`getBoundingClientRect()` gives the area's `left`, `top`, `width` and `height` in the same coordinates as `event.clientX` and `clientY`. The centre is `left + width / 2`. Subtract to get `dx` and `dy`.

</details>

<details><summary>Hint 2: only on change</summary>

Write `moveStick(next)`, where `next` is a direction or `null`. If `next` equals what's already held, do nothing. Otherwise release the old one, press the new one, remember the new one. Every handler then becomes one line.

</details>

**Done when** you can play a whole game by dragging the stick; sliding from right to down turns once, not twice; dragging far outside the joystick still works until you let go; the stick snaps back upright on release.

Solution: **D**. Commit: `Make the control deck work with mouse and touch`.

---

## Stage 6. Escape and tab switching

### 6.1 Escape belongs to the cabinet

Today Escape jumps to the main menu from anywhere, including mid-game. New rule on a game screen: **Escape while playing pauses. Escape otherwise goes back to the game list.**

Two handlers now care about Escape: the global one in `App.tsx` and the new one in `GameCanvas`. They must not both act on the same press.

The engine also shouldn't know where "back" leads. It receives a function, `onExit`, and calls it. `GameCabinet` supplies one that changes the hash.

**Look up:** DevDocs → `Event.preventDefault`, `Event.defaultPrevented`.

<details><summary>Hint 1</summary>

`App`'s handler should do nothing when the hash starts with `#/games/`. That alone is not enough. Work out why before opening the next hint.

</details>

<details><summary>Hint 2</summary>

Both listeners are on `window`, and they run in the order they were added. If the cabinet's runs first and changes the hash to `#/games`, then `App`'s runs for the same key press, sees a hash that no longer starts with `#/games/`, and sends you on to the menu. The standard fix: the handler that deals with the press calls `event.preventDefault()`, and the other checks `event.defaultPrevented` and stands down.

</details>

<details><summary>Hint 3: a stable onExit</summary>

`onExit` goes in the effect's dependency list. If `GameCabinet` creates it inline, it's a new function on every render and the game restarts each time. Define it once, outside the component.

</details>

### 6.2 Pause when the tab is hidden

Switch tabs mid-game and you come back to a dead wyrm. Pause automatically instead.

**Look up:** DevDocs → "Document: visibilitychange event", `Document.hidden`.

**Done when** Escape pauses, a second Escape lands on the game list (not the menu), Escape on Résumé still goes to the menu, and switching tabs mid-game returns you to PAUSED.

Solution: **E**. Commit: `Make Escape pause, then exit; pause on hidden tab`.

---

## Stage 7. Sound

**Goal:** sound effects, and Select turns them on and off.

The files are in `public/sounds/`. `ASSETS.md` lists what each is for. This stage uses `start`, `pause`, `resume`, `eat`, `crash`, `gameover` and `highscore`.

### Ideas you need

- **The Web Audio API.** You create one `AudioContext`. Each sound file is fetched and *decoded* once into an `AudioBuffer`. To play it you create a tiny one-shot source node, point it at the buffer, connect it and start it. Sources are meant to be created per play and thrown away.
- **Browsers block sound until the visitor interacts.** So the context is created (or resumed) inside the first key press or tap, not when the page loads.
- **Sound must never break the game.** A missing file, a blocked context or a failed decode should mean silence, not a crash. Every risky step is wrapped so it fails quietly.
- **Games don't import the audio module.** A game that reaches out to the browser can't be tested without one. The engine *hands* the game what it needs: `createGame(env)`, where `env.playSound` is a function. This is called **dependency injection**, and in Stage 9 it's what lets a test pass in a fake.

### What to build

1. **`src/engine/audio.ts`** exporting `unlockAudio()`, `playSound(name)`, `isMuted()`, `toggleMuted()` and a type `SoundName`.
2. **In `types.ts`:** a `GameEnv` type with `playSound`, and `GameFactory` becomes `(env: GameEnv) => Game`.
3. **In `GameCanvas`:** build the `env`, pass it to `createGame` (both places), unlock audio on the first key press or pointer press, and play `start`, `pause`, `resume` and `gameover`.
4. **In `snake.ts`:** accept `env`, play `eat` and `crash`.
5. **Select (Shift) toggles mute.** Remember the choice in `localStorage`, and show a small SOUND OFF on the canvas while muted.

**Look up:** DevDocs → `AudioContext`, `BaseAudioContext.decodeAudioData`, `AudioBufferSourceNode`, `GainNode`, "Autoplay guide for media and Web Audio APIs", `Window.localStorage`. TypeScript → `keyof typeof`.

<details><summary>Hint 1: one list of sounds</summary>

Make one object from sound name to file path, marked `as const`. Then `type SoundName = keyof typeof FILES;` gives you a type that is exactly those names. Add a sound to the object and the type updates itself; misspell a name anywhere and TypeScript catches it.

</details>

<details><summary>Hint 2: module-level variables</summary>

The context, the map of decoded buffers and the muted flag are variables at the top level of `audio.ts`, outside any function. A module is loaded once, so they act as a single shared instance for the whole site.

</details>

<details><summary>Hint 3: volume</summary>

Connect every source to one `GainNode`, and that node to `context.destination`. Its `gain.value` is the master volume. Start around 0.5; the files are loud.

</details>

<details><summary>Hint 4: storage can throw</summary>

`localStorage` can be blocked (private windows, strict settings). Wrap every read and write in `try`/`catch`. If reading fails, start un-muted.

</details>

**Done when** you hear a sound on start, pause, resume, eat, crash and game over; Shift silences everything and shows SOUND OFF; the choice survives a reload; and with `public/sounds` temporarily renamed, the game still plays, silently, without crashing.

Solution: **F**. Commit: `Add sound effects and a mute toggle on Select`.

---

## Stage 8. High scores

**Goal:** the best five scores per game are remembered in the browser. The title screen shows BEST, and a new record is announced.

### What to build

1. **`src/engine/scores.ts`** exporting `loadScores(gameId, storage?)` and `saveScore(gameId, score, storage?)`. `saveScore` returns the updated list and the new score's rank (1 for a new best, `null` if it missed the top five).
2. **`GameCanvas`** receives a `gameId` prop, loads the best score for the title overlay, saves on game over, and shows NEW HIGH SCORE! when the rank is 1.

**Test first:** copy `specs/scores.test.ts` into `src/engine/`. Its eight tests are the specification.

**Why the optional `storage` parameter?** So a test can pass in a fake that lives in memory. Real code calls `loadScores('snake')` and gets `localStorage`; tests call `loadScores('snake', fake)`. Same function, no browser required.

**Never trust what you read back.** Anyone can open DevTools and edit `localStorage`, and an old version of your site may have saved a different shape. Treat stored data like user input: check it's an array, keep only whole numbers of zero or more, and fall back to an empty list on anything unexpected.

**Look up:** DevDocs → `Window.localStorage`, `JSON.parse`, `Array.isArray`, `Number.isInteger`, `Array.prototype.sort` (read the part about the compare function: the default sort treats numbers as text). TypeScript → Utility Types → `Pick`.

<details><summary>Hint 1: the key</summary>

Give every key a prefix that's yours, such as `zachs-arcade:scores:snake`. Storage is shared by everything on the same address, including other projects on `localhost`.

</details>

<details><summary>Hint 2: where the try goes</summary>

Even *touching* `localStorage` can throw when it's blocked. Read it inside the `try`: `const store = storage ?? localStorage;`.

</details>

<details><summary>Hint 3: rank</summary>

Add the new score, sort highest first, keep five, then find the score's position in that list. A position of -1 means it didn't survive the cut.

</details>

**Done when** all eight tests pass; BEST survives a reload; beating it shows NEW HIGH SCORE!; and typing `localStorage.setItem('zachs-arcade:scores:snake', 'garbage')` in the Console, then reloading, shows BEST 0 instead of an error.

Solution: **G**. Commit: `Add local high scores`.

**Stretch, no solution provided:** three-letter initials. On a new high score, show `AAA` with one letter highlighted; up and down change the letter, right or A moves on, Start confirms. Store `{ initials, score }` instead of a bare number, and update the validation to match. The global leaderboard planned for later uses the same initials.

---

## Stage 9. Tests

**Goal:** automated checks that the game's rules still hold, so future changes can't quietly break them.

Your games are plain TypeScript with no browser in them, which makes them easy to test: build a game, feed it input, ask what happened.

### 9.1 Take control of randomness

A test can't check "it eats the food" if the food is somewhere random. Add `random: () => number` to `GameEnv`. The engine passes `Math.random`; `placeFood` calls `env.random()`. A test passes a function that returns numbers it chose.

### 9.2 Run the supplied tests

Copy `specs/snake.test.ts` into `src/games/`. Read it top to bottom before running it; the `setup` helper at the top is the interesting part. Then `npm run test:watch`.

If a test fails, don't assume your code is wrong. Read the test and decide which of the two has the wrong idea. If you built something differently on purpose (a different starting position, a different twist), change the test to match your design. Tests describe *your* game.

Three things to expect:

- The test imports `COLS`, `ROWS` and `START_STEP_TIME` from `snake.ts`. Add `export` to those constants. Yours is called `STEP_TIME`; rename one side so they agree.
- One test, "pays double while boosting", covers the twist from Stage 10. Change `it(` to `it.skip(` on that test until then.
- When you add `theme` to `GameEnv` in task 10.1, TypeScript will flag the `env` object in this test for missing it. That's the type system telling you a contract changed. Add `theme: DEFAULT_THEME` there.

### 9.3 Write three of your own

Ideas, from easy to hard:

- Pressing `down` then stepping twice does not end the game.
- After the game is over, more updates don't change the score.
- More than three queued turns are ignored (from task 1.2).
- **Challenge:** the wyrm dies when it runs into itself. You'll need to feed it until it's long enough to turn back on itself, which means choosing the random numbers so that food keeps appearing right in front of it.

**A Vitest cheat sheet**

```ts
import { describe, expect, it, vi } from 'vitest';

describe('a group name', () => {
    it('says what should be true', () => {
        expect(2 + 2).toBe(4);             // exact match, for numbers, strings, booleans
        expect([1, 2]).toEqual([1, 2]);    // same contents, for arrays and objects
        expect(null).toBeNull();           // for "nothing"
        expect(0.1 + 0.2).toBeCloseTo(0.3); // for decimals

        const spy = vi.fn();               // a fake function that records its calls
        spy('eat');
        expect(spy).toHaveBeenCalledWith('eat');
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
```

`npm test` runs everything once. `npm run test:watch` re-runs on every save; keep it open in a second terminal while you work.

**Done when** `npm test` is green, three tests are your own, and you've seen a test fail on purpose: break a rule in `snake.ts`, watch the test catch it, then put it back.

Solution: **H**. Commit: `Add unit tests for Data Wyrm`.

---

## Stage 10. Polish and your twist

Pick these in any order.

### 10.1 Use the site's real colours

The canvas can't read `var(--pink)`, so the game has its own copies of the hex codes. Read the real values from the page once and hand them to the game through `env.theme`. Change a colour in `index.css` and the games follow.

**Look up:** DevDocs → `Window.getComputedStyle`, `CSSStyleDeclaration.getPropertyValue`.

<details><summary>Hint</summary>

The variables are defined on `:root`, which in JavaScript is `document.documentElement`. The value comes back with a leading space, so `.trim()` it. Keep a `DEFAULT_THEME` object with the same six colours for tests, which have no page to read from.

</details>

### 10.2 Neon glow

`ctx.shadowBlur` and `ctx.shadowColor` put a soft glow around whatever you draw next. Wrap the glowing part in `save()` and `restore()`, or the score text will glow too.

### 10.3 Speed up

Make the time between moves shrink as the score grows, with a floor so it never becomes impossible. Play it and tune the numbers by feel. This is game design, and there's no right answer.

### 10.4 Your twist

Your own rule says each game needs an original twist. Some ideas:

- **Boost:** hold A to move at double speed, and pellets eaten while boosting score double. (This is what the reference version does, and what the skipped test checks.)
- **Wrap:** the left and right edges connect, but top and bottom are still walls.
- **Glitch pellets:** a second kind of pellet appears briefly, is worth five, and vanishes if you're slow.
- **Shrinking arena:** every ten points the walls close in by one cell.

Whichever you choose, write a test for it.

### 10.5 A registry of games

`play.tsx` imports `createSnake` by name. With eight games that becomes a long `if` chain. Create `src/games/index.ts` exporting one object from game id to factory. `PlayScreen` looks the id up and shows GAME NOT FOUND if there's no entry.

While you're there: two different types are both called `Game` (the list entry in `data/games.ts` and the engine's contract in `games/types.ts`). Rename the first to `GameInfo`. Put the cursor on the name and press **F2**: VS Code renames every use safely.

Solution: **I**. Commit each separately.

---

## Stage 11. Sprites (optional)

My view: the glowing rectangles suit this site, and drawing in code keeps your "original work" rule simple. Sprites are here because you asked for them and because loading images is worth knowing for later games.

`public/sprites/sheet.png` is one image holding 22 small pictures, 16×16 pixels each, and `sheet.json` says where each one is. `docs/offline/sprites-preview.png` shows them enlarged with their names.

### What to build

1. **`src/engine/sprites.ts`**: load the image and the JSON once; export `drawSprite(ctx, name, x, y, scale)`, which returns `false` if the sheet hasn't loaded yet.
2. **Pass `drawSprite` through `env`**, like sound.
3. **In `snake.ts`'s `draw`:** try the sprite first; if it returns `false`, draw the rectangle as before. The game never waits for an image.

**The rule for pixel art: only scale by whole numbers.** A 16-pixel sprite drawn into a 20-pixel cell has to stretch some pixels and not others, and looks uneven. Either change `CELL` to 16 (and `COLS` and `ROWS` to 25 to keep a 400-pixel board), or draw at double size into 32-pixel cells. Because those are named constants, it's a two-line change.

**Look up:** DevDocs → `CanvasRenderingContext2D.drawImage` (the nine-argument form), `imageSmoothingEnabled`, `HTMLImageElement.decode`.

**Make your own with no image editor:** `SOLUTIONS.md` section J includes `spriteFromRows`, which turns an array of strings into a picture, one character per pixel. You can design sprites in a text file.

Solution: **J**.

---

## Stage 12. Ship Data Wyrm

When the game is something you'd show a recruiter:

- [ ] `npm run build`, `npm run lint` and `npm test` all pass.
- [ ] Played start to finish three ways: keyboard only, mouse only, and touch (device mode, or your phone on the preview link).
- [ ] No scrollbar on your laptop; fits on a phone.
- [ ] Sound works, mute works and is remembered.
- [ ] High score survives a reload.
- [ ] In `games.ts`, only finished games say `ready: true`.
- [ ] The description in `games.ts` mentions your twist.
- [ ] `README.md` has a short section on the games and the engine.
- [ ] The Home screen text doesn't promise anything that isn't there yet (see Appendix A).

Then, once you're online:

```bash
git push                 # dev → a Vercel preview. Check it on your phone.
git switch main
git merge dev
git push                 # this updates the live site
git switch dev
```

---

## Stage 13. Brick Blitz kickoff

**First, the name.** "Brick Blitz" is already used by other small games (Appendix B). Pick a new one before it reaches `main`; the id `bricks` can stay.

**The design in one paragraph:** a paddle at the bottom moves left and right. A ball bounces off the walls, the paddle and a wall of bricks at the top. A brick disappears when hit. Miss the ball and you lose a life. Clear every brick to finish the level.

**What's new compared with the wyrm:** movement is smooth instead of cell by cell, so positions are decimals and things have a **velocity** (`vx`, `vy`: pixels per second in each direction). Each frame, `x += vx * dt`. That's the square from your very first demo, plus bouncing.

### Milestones

Commit after each.

1. **An empty game.** `src/games/bricks.ts` exporting `createBricks(env)`, with a dark background, registered in `src/games/index.ts`, and `ready: true` on `dev` only.
2. **A paddle.** Moves while `left` or `right` is *held* (this is what `input.held` was built for), clamped to the walls with the line from your demo.
3. **A ball that bounces off three walls.** When it passes a wall, put it back at the wall and make its velocity point away. Falling off the bottom ends the game for now.
4. **The paddle hits the ball.** Use `bounceOffRect` from the starter (below).
5. **Aim.** With plain bouncing the ball follows the same path forever. Use `aimFromPaddle` so where it lands on the paddle decides the angle.
6. **Bricks.** Describe a level as data, for example an array of strings where each character is a brick or a gap. Build a list of rectangles from it. Each frame, test the ball against the bricks; on a hit, remove that brick, score, and stop checking (one brick per frame).
7. **Lives, launch and a win.** The ball starts resting on the paddle and A launches it. Three lives. Clearing the level loads the next one.
8. **Your twist, sound, and tests.**

### The physics starter

`reference/brick-blitz-starter/physics.ts` has two tested functions, `bounceOffRect` and `aimFromPaddle`, with their test file. Copy both into `src/games/bricks/`. Read the tests first: they show exactly how to call each function. Section **K** explains how they work.

### Two traps

- **Flipping twice.** If you write `vy = -vy` on a hit, and the ball is still overlapping on the next frame, it flips back and gets stuck jittering inside the paddle. Say what you mean instead: after hitting the paddle the ball goes *up*, so `vy = -Math.abs(vy)`.
- **Tunnelling.** A fast ball can move further in one frame than a brick is thick, and pass straight through. Cap the ball's speed so one frame's movement is always smaller than the thinnest thing it can hit. A 10-pixel brick at 60 frames per second allows a little under 600 pixels per second.

**Look up:** DevDocs → `Math.hypot`, `Math.sin`, `Math.abs`, `Array.prototype.filter`, `Array.prototype.findIndex`.

Solution: **K** covers the two physics functions only. The game itself is yours to build.

---

## Appendix A. Chores

Small, separate fixes for when you want a quick win. None depends on anything else.

| # | What | Where |
| --- | --- | --- |
| 1 | The scrollbar rule has two typos, so it never applies: `@supports select(::webkit-scrollbar)` should be `@supports selector(::-webkit-scrollbar)` | `index.css` |
| 2 | The Games screen uses the classes `play`, `coming-soon` and `disclaimer`, but none has any CSS yet. Style them. Your own convention is `.screen a.play` | `games.tsx`, `index.css` |
| 3 | The Home text says "top the leaderboard". There's no leaderboard yet, which breaks your everything-is-true rule. Reword it until there is one | `home.tsx` |
| 4 | Home text and résumé disagree: "for the FBI" vs contractor supporting the FBI, "nine-year career" vs experience from 2020, and a Master's degree not on the résumé | `home.tsx`, `resume.ts` |
| 5 | Real visitors with an expired captcha see "Please do not try again, if you are a robot that is." Suggested: "Verification failed. Please try again." | `api/contact.ts` line 70 |
| 6 | `let body: Record<string, unknown>` claims to know the shape before checking it. `unknown` is the honest type; narrow it after validating | `api/contact.ts` line 22 |
| 7 | Add `docs/HANDOFF.md` to the repo, updated for everything in this roadmap, so the next chat can read it from GitHub | `docs/` |
| 8 | The README says "No images except the carpet tile" and doesn't mention games, tests or the engine. Update it after Stage 12 | `README.md` |
| 9 | **Stretch:** make the menu's joystick and buttons real, using your `ControlDeck`: the stick moves the highlight and A or Start enters | `Menu.tsx` |

---

## Appendix B. Name check

Your handoff says to search each placeholder name before committing to it. I ran one web search per name on 2026-11-13. This is a quick look, not a trademark search, and I'm not a lawyer.

| id | Name | What turned up | Suggestion |
| --- | --- | --- | --- |
| `snake` | Data Wyrm | Nothing with this name | Keep |
| `bricks` | Brick Blitz | Already used by other brick-breaker games, including one on itch.io and one on an arcade site | Rename |
| `stack` | Neon Stack | Several App Store games called Neon Stack or NeonStack | Rename |
| `rocks` | Rock Buster | "Rock Buster 3D" on CrazyGames and "RockBusters" on the App Store | Rename |
| `swarm` | Swarm Strike | "Swarm Strike: Superhero Siege" on the App Store | Rename |
| `crossing` | Cosmic Crossing | Only a small itch.io game called "Cosmic Crossing Gaurd" | Probably fine; check again before release |
| `maze` | Dot Dash | A game called DotDash on itch.io | Rename |
| `dig` | Core Driller | Nothing with this name | Keep |

Brainstorm replacements offline and I'll check them when you're back. "Data Wyrm" worked because it paired two words that don't usually sit together; the taken ones are all obvious pairings.

---

## Appendix C. Decisions I made that are yours to change

I had to pick something to build and test against. None of these is fixed.

| Decision | What I chose | Why |
| --- | --- | --- |
| Start | Start, pause, resume, restart | It's the one button every state needs |
| Select | Sound on/off | Every game needs a mute, and it works the same in all eight |
| Escape | Pause while playing; otherwise back to the game list | Settles the open question in your handoff |
| A button | The game's main action (boost in Data Wyrm) | |
| B button | Unused in Data Wyrm | Brick Blitz and the shooters will want it |
| Marquee on a game screen | The game's name, not "Zach's Arcade" | Frees the space a title took inside the screen |
| Keyboard | Arrows or WASD, Space or Z = A, X = B, Enter = Start, Shift = Select | |
| Overlays | Drawn on the canvas by the engine | One implementation for all games |

Real arcade machines had Start but not Select (that came from home consoles). If you want it closer to an arcade, relabel the pills "1P START" and "SOUND".

---

## Appendix D. Picking this up with Claude again

When you're back online, push, then start with something like:

> I worked through `docs/offline/ROADMAP.md` while offline. I finished stages 0 to N. Stage M is where I got stuck: [what happened]. My branch `dev` is pushed. Please look at it, review what I did, and help me from there.

It also helps to update `docs/HANDOFF.md` (chore 7) so the state of the project is written down in the repo itself.
