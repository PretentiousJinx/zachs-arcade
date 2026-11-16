# Zach's Arcade: solutions

Open a section only after trying the stage and its hints in `ROADMAP.md`.

Every block of code here was copied by script out of a project that builds, passes lint and passes its tests, so what you see is what was tested. When you use a solution, type it instead of pasting it, and stop at any line you can't explain. The comments are there for that.

If your version works and looks different from mine, yours is not wrong. Keep it.

**Contents**

- [A. Stage 2: actions, not keys](#a-stage-2-actions-not-keys)
- [B. Stage 3: start, pause, game over, restart](#b-stage-3-start-pause-game-over-restart)
- [C. Stage 4: the cabinet layout](#c-stage-4-the-cabinet-layout)
- [D. Stage 5: working controls](#d-stage-5-working-controls)
- [E. Stage 6: Escape and tab switching](#e-stage-6-escape-and-tab-switching)
- [F. Stage 7: sound](#f-stage-7-sound)
- [G. Stage 8: high scores](#g-stage-8-high-scores)
- [H. Stage 9: tests](#h-stage-9-tests)
- [I. Stage 10: polish, and the finished files](#i-stage-10-polish-and-the-finished-files)
- [J. Stage 11: sprites](#j-stage-11-sprites)
- [K. Stage 13: Brick Blitz physics](#k-stage-13-brick-blitz-physics)

---

## A. Stage 2: actions, not keys

### `src/games/types.ts`: the new parts

```ts
// A logical control, not a physical key. Keyboard keys (and later the on-screen
// buttons and joystick) are all translated into these.
export type Action = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';

export type Input = {
    held: Set<Action>; // actions currently held down
    pressed: Action[]; // actions pressed since the last update, in order
};
```

### `src/engine/input.ts`: the whole file

```ts
import type { Action, Input } from '../games/types';

// event.code names the physical key, so it ignores Caps Lock and keyboard layout.
export const KEY_MAP: Record<string, Action> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
    Space: 'a',
    KeyZ: 'a',
    KeyX: 'b',
    Enter: 'start',
    ShiftLeft: 'select',
    ShiftRight: 'select',
};

export type InputStore = {
    state: Input;
    press(action: Action): void;
    release(action: Action): void;
    releaseAll(): void;
    endFrame(): void;
    subscribe(listener: () => void): () => void;
};

export function createInput(): InputStore {
    const state: Input = { held: new Set(), pressed: [] };
    const listeners = new Set<() => void>();

    function notify() {
        listeners.forEach((listener) => listener());
    }

    return {
        state,

        press(action) {
            if (state.held.has(action)) return; // already down: not a new press
            state.held.add(action);
            state.pressed.push(action);
            notify();
        },

        release(action) {
            if (!state.held.delete(action)) return; // delete() reports whether it was there
            notify();
        },

        releaseAll() {
            if (state.held.size === 0) return;
            state.held.clear();
            notify();
        },

        // Called by the game loop after each update: presses are used up once.
        endFrame() {
            state.pressed.length = 0;
        },

        // Returns the function that undoes the subscription, ready for useEffect cleanup.
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}

// Wires the keyboard to an input store. Returns a function that removes the wiring.
export function attachKeyboard(input: InputStore, target: Window = window): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
        const action = KEY_MAP[event.code];
        if (!action) return;
        event.preventDefault(); // stop arrows and space from scrolling the page
        if (!event.repeat) {
            input.press(action);
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        const action = KEY_MAP[event.code];
        if (action) {
            input.release(action);
        }
    };

    // If the window loses focus mid-press, keyup never arrives and the key would stick.
    const handleBlur = () => input.releaseAll();

    target.addEventListener('keydown', handleKeyDown);
    target.addEventListener('keyup', handleKeyUp);
    target.addEventListener('blur', handleBlur);

    return () => {
        target.removeEventListener('keydown', handleKeyDown);
        target.removeEventListener('keyup', handleKeyUp);
        target.removeEventListener('blur', handleBlur);
    };
}
```

Things worth understanding:

- **`createInput` is the same closure pattern as `createSnake`.** `state` and `listeners` live inside the function, and the returned methods can still reach them.
- **`if (state.held.has(action)) return;`** in `press` is what stops a second device (or a repeated event) from counting as a new press.
- **`state.held.delete(action)` returns `true` or `false`** depending on whether the item was there. That lets `release` skip notifying when nothing changed.
- **`attachKeyboard` returns its own undo function,** so whoever calls it never needs to know which listeners were added.

### `GameCanvas.tsx`: what changes

Delete `GAME_KEYS`, `handleKeyDown`, `handleKeyUp`, the `input` object and the two `addEventListener` and `removeEventListener` pairs for keys. In their place:

```ts
const input = createInput();
// ...
game.update(dt, input.state);
input.endFrame();
// ...
const detachKeyboard = attachKeyboard(input);
frameId = requestAnimationFrame(frame);

return () => {
    cancelAnimationFrame(frameId);
    detachKeyboard();
};
```

### `snake.ts`: what changes

```ts
// A lookup table instead of four ifs: the action is the key, the step is the value.
const TURNS: Partial<Record<Action, Cell>> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};
```

and in `update`:

```ts
for (const action of input.pressed) {
    const turn = TURNS[action];
    if (turn && turns.length < MAX_QUEUED_TURNS) {
        turns.push(turn);
    }
}
```

`for (const x of list)` is another way to write `list.forEach((x) => ...)`. Use whichever reads better to you.

---

## B. Stage 3: start, pause, game over, restart

### `src/games/types.ts`: the contract grows

```ts
export type Game = {
    width: number;
    height: number;
    update(dt: number, input: Input): void;
    draw(ctx: CanvasRenderingContext2D): void;
    isOver(): boolean;
    getScore(): number;
};

export type GameFactory = () => Game;
```

### `snake.ts`: two new methods in the returned object

```ts
isOver() {
    return !alive;
},

getScore() {
    return score;
},
```

### `src/components/GameCanvas.tsx`: the whole file at the end of Stage 3

Later stages add to this. The finished version is in section I.

```tsx
import { useEffect, useRef, useState } from 'react';
import type { GameFactory } from '../games/types';
import { attachKeyboard, createInput } from '../engine/input';

// The four states a cabinet can be in. Start moves between them.
type Phase = 'title' | 'playing' | 'paused' | 'over';

type GameCanvasProps = {
    title: string;
    createGame: GameFactory;
};

const MAX_FRAME_TIME = 0.1; // seconds; stops a huge jump after switching tabs

// Dims the game and writes centered lines of text over it.
function drawOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    lines: string[],
) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 4, 20, 0.75)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lineHeight = 28;
    const top = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
        ctx.fillStyle = index === 0 ? '#ffe14a' : '#e8e6ff';
        ctx.font = `${index === 0 ? 20 : 11}px "Press Start 2P", monospace`;
        ctx.fillText(line, width / 2, top + index * lineHeight);
    });
    ctx.restore();
}

function GameCanvas({ title, createGame }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Read aloud by screen readers; set only when the phase changes, never per frame.
    const [status, setStatus] = useState('Press Start to play.');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const input = createInput();
        let game = createGame();
        let phase: Phase = 'title';

        canvas.width = game.width;
        canvas.height = game.height;

        function handleStart() {
            if (phase === 'playing') {
                phase = 'paused';
                setStatus('Paused. Press Start to resume.');
                return;
            }
            if (phase === 'over') {
                game = createGame(); // a fresh game: this is why games are built by a function
            }
            phase = 'playing';
            setStatus('Playing.');
        }

        function overlayLines(): string[] {
            if (phase === 'title') {
                return [title.toUpperCase(), 'PRESS START'];
            }
            if (phase === 'paused') {
                return ['PAUSED', 'PRESS START'];
            }
            return ['GAME OVER', `SCORE ${game.getScore()}`, 'PRESS START'];
        }

        let frameId = 0;
        let lastTime = performance.now();

        const frame = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_TIME);
            lastTime = now;

            // Start is handled here, before the game gets its turn.
            for (const action of input.state.pressed) {
                if (action === 'start') {
                    handleStart();
                }
            }

            if (phase === 'playing') {
                game.update(dt, input.state);
                if (game.isOver()) {
                    phase = 'over';
                    setStatus(`Game over. Score ${game.getScore()}. Press Start to play again.`);
                }
            }
            input.endFrame();

            game.draw(ctx);
            if (phase !== 'playing') {
                drawOverlay(ctx, game.width, game.height, overlayLines());
            }

            frameId = requestAnimationFrame(frame);
        };

        const detachKeyboard = attachKeyboard(input);
        frameId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(frameId);
            detachKeyboard();
        };
    }, [title, createGame]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="game-canvas"
                role="img"
                aria-label={`${title} game screen`}
            />
            <p className="sr-only" role="status">
                {status}
            </p>
        </>
    );
}

export default GameCanvas;
```

Things worth understanding:

- **`phase` and `game` are plain `let` variables inside the effect.** The loop reads them every frame. Making them React state would re-render the component for no visible reason.
- **`status` is React state** because it appears on the page. `setStatus` is called only inside `handleStart` and at the moment of game over, never per frame.
- **`handleStart` is the state machine from the diagram.** One function, one decision per phase. If a transition ever misbehaves, this is the only place to look.
- **`input.endFrame()` runs on every frame,** whether or not the game updated.
- **`<>...</>` is a fragment:** a way to return two elements side by side without wrapping them in an extra `<div>`.

### `index.css`: text only screen readers can see

```css
/* Visible to screen readers only. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

`display: none` would hide it from screen readers too, which defeats the purpose. This shrinks it to a clipped single pixel instead.

### `play.tsx`: pass the title

```tsx
<GameCanvas title={game.name} createGame={createSnake} />
```

---

## C. Stage 4: the cabinet layout

### `src/components/ControlDeck.tsx`: looks only

```tsx
// Stage 4: looks only. Nothing here responds to presses yet.
function ControlDeck() {
    return (
        <div className="controls controls--game">
            <div className="stick-zone">
                <div className="joystick">
                    <div className="lever">
                        <div className="ball"></div>
                        <div className="stick"></div>
                    </div>
                </div>
            </div>

            <div className="deck-center">
                <button type="button" className="pill">
                    Select
                </button>
                <button type="button" className="pill">
                    Start
                </button>
            </div>

            <div className="buttons">
                <button type="button" className="btn cyan" aria-label="B button"></button>
                <button type="button" className="btn pink" aria-label="A button"></button>
            </div>
        </div>
    );
}

export default ControlDeck;
```

### `src/components/GameCabinet.tsx`: looks only

```tsx
import type { GameFactory } from '../games/types';
import ControlDeck from './ControlDeck';
import GameCanvas from './GameCanvas';

type GameCabinetProps = {
    title: string;
    createGame: GameFactory;
};

function GameCabinet({ title, createGame }: GameCabinetProps) {
    return (
        <main className="cabinet cabinet--game">
            <div className="marquee">{title}</div>
            <div className="screen screen--game">
                <GameCanvas title={title} createGame={createGame} />
            </div>
            <ControlDeck />
            <div className="cabinet-footer">
                <a className="back" href="#/games">
                    Back
                </a>
                <span className="key-hint">Arrows move · Enter start</span>
            </div>
        </main>
    );
}

export default GameCabinet;
```

### `src/screens/play.tsx`

```tsx
import GameCabinet from '../components/GameCabinet';
import ScreenFrame from '../components/ScreenFrame';
import { GAMES } from '../data/games';
import { createSnake } from '../games/snake';

type PlayScreenProps = {
    gameId: string;
};

function PlayScreen({ gameId }: PlayScreenProps) {
    const game = GAMES.find((g) => g.id === gameId);

    if (!game || !game.ready) {
        return (
            <ScreenFrame title="GAME NOT FOUND" backHref="#/games">
                <p>No cabinet here (yet)!</p>
            </ScreenFrame>
        );
    }

    return <GameCabinet title={game.name} createGame={createSnake} />;
}

export default PlayScreen;
```

### `index.css`

Replace your current `.screen--content:has(.game-canvas)` and `.game-canvas` rules with this one:

```css
.game-canvas {
  display: block;
  max-width: 100%;
  max-height: max(200px, calc(100vh - 330px));
  image-rendering: pixelated;
}
```

Then add this block at the end of the file. (The `.is-held` and `:focus-visible` rules are used from Stage 5; they do no harm now.)

```css
/* ---------- Game cabinet ---------- */

.cabinet--game {
  padding: 14px 20px;
}

.cabinet--game .marquee {
  font-size: 24px;
  margin-bottom: 12px;
}

.screen--game {
  min-height: 0;
  padding: 8px;
}

.controls--game {
  margin-top: 12px;
  padding: 8px 12px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.stick-zone {
  width: 88px;
  height: 88px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: grab;
}

.controls--game .joystick {
  pointer-events: none;
}

.controls--game .lever .ball {
  width: 32px;
  height: 32px;
}

.controls--game .lever .stick {
  height: 24px;
}

.deck-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.pill {
  padding: 6px 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  text-transform: uppercase;
  color: var(--ink);
  background-color: #0a0414;
  border: 2px solid #4a2a70;
  border-radius: 999px;
  box-shadow: 0 3px 0 #05020a;
  cursor: pointer;
}

.pill:active,
.pill.is-held {
  transform: translateY(3px);
  box-shadow: none;
}

button.btn {
  padding: 0;
  border: none;
}

.controls--game .btn {
  width: 44px;
  height: 44px;
}

.controls--game .btn.cyan {
  margin-top: 22px;
}

.btn.is-held {
  box-shadow: 0 2px 0 var(--side);
  transform: translateY(4px);
}

.pill:focus-visible,
.btn:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 3px;
}

.cabinet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.cabinet-footer a.back {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: var(--cyan);
  text-decoration: none;
}

.cabinet-footer a.back:hover {
  color: var(--yellow);
}

.key-hint {
  font-size: 16px;
  color: #9d97c7;
  text-align: right;
}

/* Visible to screen readers only. */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

Where the **330px** comes from: at a 620-pixel-tall window I measured everything that isn't the canvas (page padding, cabinet border and padding, marquee, screen padding and border, the 110-pixel deck, the footer) at about 330 pixels. If you change the size of any of those, measure again and adjust the number. The canvas then comes out at 290 pixels on your laptop, 400 on a tall monitor, and about 280 on a phone.

---

## D. Stage 5: working controls

### `src/components/ControlDeck.tsx`: the finished file

```tsx
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import type { Action } from '../games/types';
import type { InputStore } from '../engine/input';

type ControlDeckProps = {
    input: InputStore;
};

// Which way is the pointer pushing the stick? Four-way: the bigger axis wins.
function stickDirection(event: PointerEvent<HTMLDivElement>): Action | null {
    const box = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const deadZone = box.width * 0.12; // a small circle in the middle does nothing

    if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) return null;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
}

function ControlDeck({ input }: ControlDeckProps) {
    // A copy of what is held, so React re-renders when it changes. The game loop
    // never reads this; it reads the input store directly.
    const [held, setHeld] = useState<ReadonlySet<Action>>(() => new Set());
    const stick = useRef<Action | null>(null); // the direction the pointer is holding

    useEffect(() => {
        return input.subscribe(() => setHeld(new Set(input.state.held)));
    }, [input]);

    function moveStick(next: Action | null) {
        if (next === stick.current) return;
        if (stick.current) input.release(stick.current);
        if (next) input.press(next);
        stick.current = next;
    }

    const stickHandlers = {
        onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
            event.currentTarget.setPointerCapture(event.pointerId); // keep getting events if the finger slides off
            moveStick(stickDirection(event));
        },
        onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                moveStick(stickDirection(event));
            }
        },
        onPointerUp: () => moveStick(null),
        onPointerCancel: () => moveStick(null),
        onLostPointerCapture: () => moveStick(null),
    };

    function buttonHandlers(action: Action) {
        return {
            // Stops a mouse click from moving keyboard focus onto the button.
            onMouseDown: (event: MouseEvent<HTMLButtonElement>) => event.preventDefault(),
            onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                input.press(action);
            },
            onPointerUp: () => input.release(action),
            onPointerCancel: () => input.release(action),
            onLostPointerCapture: () => input.release(action),
        };
    }

    const heldClass = (action: Action) => (held.has(action) ? ' is-held' : '');

    const tiltX = held.has('up') ? 40 : held.has('down') ? -40 : 0;
    const tiltZ = held.has('left') ? -25 : held.has('right') ? 25 : 0;

    return (
        <div className="controls controls--game" onContextMenu={(event) => event.preventDefault()}>
            <div
                className="stick-zone"
                role="img"
                aria-label="Joystick. Drag it, or use the arrow keys."
                {...stickHandlers}
            >
                <div className="joystick">
                    <div
                        className="lever"
                        style={{
                            transform: `perspective(200px) rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`,
                        }}
                    >
                        <div className="ball"></div>
                        <div className="stick"></div>
                    </div>
                </div>
            </div>

            <div className="deck-center">
                <button
                    type="button"
                    className={'pill' + heldClass('select')}
                    {...buttonHandlers('select')}
                >
                    Select
                </button>
                <button
                    type="button"
                    className={'pill' + heldClass('start')}
                    {...buttonHandlers('start')}
                >
                    Start
                </button>
            </div>

            <div className="buttons">
                <button
                    type="button"
                    className={'btn cyan' + heldClass('b')}
                    aria-label="B button"
                    {...buttonHandlers('b')}
                ></button>
                <button
                    type="button"
                    className={'btn pink' + heldClass('a')}
                    aria-label="A button"
                    {...buttonHandlers('a')}
                ></button>
            </div>
        </div>
    );
}

export default ControlDeck;
```

Things worth understanding:

- **`stickDirection` is plain geometry.** `dx` and `dy` are how far the pointer is from the centre. Whichever is larger (ignoring the sign, which is what `Math.abs` does) decides the axis; the sign decides the direction.
- **`stick` is a ref, not state.** It remembers which direction the pointer is holding. Changing it should not re-render anything, and it must survive between renders. That's what `useRef` is for.
- **`moveStick` only acts on a change.** Pointer-move fires dozens of times a second; without the first line, each one would press again.
- **`setPointerCapture`** is why dragging outside the joystick keeps working, and why a button released off-target still gets its pointer-up.
- **`onLostPointerCapture`** is a safety net: however capture ends, the control is released.
- **`{...buttonHandlers('start')}`** spreads an object of props onto the element, so each button doesn't repeat five handler lines.
- **`onMouseDown` with `preventDefault`** stops a mouse click from moving keyboard focus onto the button, which would leave a focus ring behind.
- **`new Set(input.state.held)`** makes a copy. React decides whether to re-render by checking if the new value is a different object from the old one.

### `src/components/GameCabinet.tsx`: the finished file

`gameId` belongs to Stage 8 and `onExit` to Stage 6. Leave those two props (and `exitToGames`) out until you get there.

```tsx
import { useState } from 'react';
import type { GameFactory } from '../games/types';
import { createInput } from '../engine/input';
import ControlDeck from './ControlDeck';
import GameCanvas from './GameCanvas';

type GameCabinetProps = {
    gameId: string;
    title: string;
    createGame: GameFactory;
};

// Defined outside the component so it is the same function on every render.
function exitToGames() {
    window.location.hash = '#/games';
}

function GameCabinet({ gameId, title, createGame }: GameCabinetProps) {
    // One input store, shared by the canvas (which reads it) and the deck (which writes to it).
    // Passing the function itself to useState means it runs once, on the first render.
    const [input] = useState(createInput);

    return (
        <main className="cabinet cabinet--game">
            <div className="marquee">{title}</div>
            <div className="screen screen--game">
                <GameCanvas
                    gameId={gameId}
                    title={title}
                    createGame={createGame}
                    input={input}
                    onExit={exitToGames}
                />
            </div>
            <ControlDeck input={input} />
            <div className="cabinet-footer">
                <a className="back" href="#/games">
                    Back
                </a>
                <span className="key-hint">
                    Arrows move · Enter start · Shift sound · Esc pause
                </span>
            </div>
        </main>
    );
}

export default GameCabinet;
```

### `GameCanvas.tsx`: what changes

The store now arrives as a prop instead of being created inside the effect.

```tsx
type GameCanvasProps = {
    title: string;
    createGame: GameFactory;
    input: InputStore; // NEW
};

function GameCanvas({ title, createGame, input }: GameCanvasProps) {
```

Inside the effect, delete `const input = createInput();`. In the cleanup, let go of anything still held so nothing leaks into the next game:

```ts
return () => {
    cancelAnimationFrame(frameId);
    detachKeyboard();
    input.releaseAll(); // NEW
    input.endFrame(); // NEW
};
```

And add `input` to the dependency list: `[title, createGame, input]`.

The import changes from `createInput` to the type: `import { attachKeyboard, type InputStore } from '../engine/input';`

---

## E. Stage 6: Escape and tab switching

### `App.tsx`: the global Escape handler stands down on game screens

```ts
// On a game screen, Escape belongs to the cabinet (pause, then exit).
// defaultPrevented covers the case where the cabinet already handled this press.
if (event.defaultPrevented || window.location.hash.startsWith('#/games/')) {
    return;
}
```

This goes just above the `if (event.key === 'Escape')` line.

**Why both checks?** The two listeners are on the same `window`, so they run in the order they were added, and that order isn't something to rely on. If `App`'s runs first, the hash still says `#/games/snake`, and the second check stops it. If the cabinet's runs first, it has already changed the hash to `#/games`, so the second check would let `App` through; the first check stops it instead.

### `GameCanvas.tsx`: additions

A new prop:

```tsx
onExit: () => void;
```

Pull "pause" out into its own function, since three things now trigger it (Start, Escape and a hidden tab), and call it from `handleStart`:

```ts
function pause() {
    if (phase !== 'playing') return;
    phase = 'paused';
    setStatus('Paused. Press Start to resume.');
}
```

Two new handlers, next to the frame loop:

```ts
// Keys the games never see: Escape belongs to the cabinet, not the game.
const handleSystemKey = (event: KeyboardEvent) => {
    if (event.code !== 'Escape') return;
    event.preventDefault(); // tells App's own Escape handler this press is taken
    if (phase === 'playing') {
        pause();
    } else {
        onExit();
    }
};
const handleVisibility = () => {
    if (document.hidden) pause();
};
```

Add them where the keyboard is attached, and remove them in the cleanup:

```ts
window.addEventListener('keydown', handleSystemKey);
document.addEventListener('visibilitychange', handleVisibility);
// ...in the cleanup:
window.removeEventListener('keydown', handleSystemKey);
document.removeEventListener('visibilitychange', handleVisibility);
```

Add `onExit` to the dependency list.

### `GameCabinet.tsx`

```tsx
// Defined outside the component so it is the same function on every render.
function exitToGames() {
    window.location.hash = '#/games';
}
```

and pass `onExit={exitToGames}` to `GameCanvas`.

---

## F. Stage 7: sound

### `src/engine/audio.ts`: the whole file

```ts
// Sound effects through the Web Audio API.
// One AudioContext for the whole site, created on the first key press or tap,
// because browsers refuse to make sound before the visitor interacts.

const FILES = {
    start: '/sounds/start.wav',
    pause: '/sounds/pause.wav',
    resume: '/sounds/resume.wav',
    eat: '/sounds/eat.wav',
    crash: '/sounds/crash.wav',
    gameover: '/sounds/gameover.wav',
    highscore: '/sounds/highscore.wav',
} as const;

export type SoundName = keyof typeof FILES;

const MUTE_KEY = 'zachs-arcade:muted';

let context: AudioContext | null = null;
let master: GainNode | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
let muted = readMuted();

function readMuted(): boolean {
    try {
        return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
        return false; // storage can be blocked (private mode); sound just starts on
    }
}

async function loadSound(ctx: AudioContext, name: SoundName): Promise<void> {
    try {
        const response = await fetch(FILES[name]);
        if (!response.ok) return;
        const data = await response.arrayBuffer();
        buffers.set(name, await ctx.decodeAudioData(data));
    } catch {
        // A missing or broken file means that one sound stays silent. Never crash the game.
    }
}

// Call from a real user gesture (keydown or pointerdown). Safe to call many times.
export function unlockAudio(): void {
    if (!context) {
        const ctx = new AudioContext();
        context = ctx;
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
        (Object.keys(FILES) as SoundName[]).forEach((name) => void loadSound(ctx, name));
    }
    if (context.state === 'suspended') {
        void context.resume();
    }
}

export function playSound(name: SoundName): void {
    if (muted || !context || !master) return;
    const buffer = buffers.get(name);
    if (!buffer) return; // not loaded yet
    const source = context.createBufferSource(); // sources are single-use and cheap
    source.buffer = buffer;
    source.connect(master);
    source.start();
}

export function isMuted(): boolean {
    return muted;
}

export function toggleMuted(): boolean {
    muted = !muted;
    try {
        localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
        // The choice just won't be remembered next visit.
    }
    return muted;
}
```

Things worth understanding:

- **`as const`** freezes the object so TypeScript knows the exact keys, and `keyof typeof FILES` turns those keys into a type. One list, and the type can never fall out of step with it.
- **`void loadSound(...)`** starts loading without waiting. `void` is a note to the reader (and the linter) that ignoring the result is deliberate.
- **`async` and `await`:** fetching and decoding take time. `await` pauses *that function* until the result arrives, while the rest of the page carries on.
- **A new source per play.** Buffer sources can only be started once. Creating one each time is the intended use, and it lets the same sound overlap itself.
- **Every `catch` is empty on purpose,** with a comment saying what happens instead. A silent game beats a crashed one.

### `src/games/types.ts`: the environment

```ts
import type { SoundName } from '../engine/audio';

// Everything a game needs from the outside world is handed to it, so the game
// itself stays plain TypeScript: no browser, no React, easy to test.
export type GameEnv = {
    playSound: (name: SoundName) => void;
};

export type GameFactory = (env: GameEnv) => Game;
```

### `GameCanvas.tsx`: additions

```ts
import { isMuted, playSound, toggleMuted, unlockAudio } from '../engine/audio';
```

Build the environment once and pass it wherever a game is created:

```ts
const env = { playSound };
let game = createGame(env);
// ...and in handleStart:
game = createGame(env);
```

Sounds for the cabinet's own events. `handleStart` becomes:

```ts
function handleStart() {
    if (phase === 'playing') {
        pause();
        return;
    }
    if (phase === 'paused') {
        playSound('resume');
    } else {
        if (phase === 'over') {
            game = createGame(env); // a fresh game: this is why games are built by a function
        }
        playSound('start');
    }
    phase = 'playing';
    setStatus('Playing.');
}
```

Add `playSound('pause');` inside `pause()`, and `playSound('gameover');` where the game ends.

Unlock on the first key or pointer press. Add `unlockAudio();` as the first line of `handleSystemKey` (before the Escape check, so every key counts), and add a pointer handler:

```ts
const handlePointer = () => unlockAudio();
window.addEventListener('pointerdown', handlePointer);
// ...and remove it in the cleanup
```

Select toggles sound. In the loop that already looks for `'start'`:

```ts
for (const action of input.state.pressed) {
    if (action === 'start') {
        handleStart();
    } else if (action === 'select') {
        setStatus(toggleMuted() ? 'Sound off.' : 'Sound on.');
    }
}
```

And after the overlay is drawn, the indicator:

```ts
if (isMuted()) {
    ctx.fillStyle = '#e8e6ff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('SOUND OFF', game.width - 8, 10);
}
```

### `snake.ts`: additions

```ts
export function createSnake(env: GameEnv): Game {
```

`env.playSound('crash');` where the wyrm dies, and `env.playSound('eat');` where it eats.

---

## G. Stage 8: high scores

### `src/engine/scores.ts`: the whole file

```ts
// Local high scores: the top 5 per game, kept in the browser's localStorage.

const MAX_SCORES = 5;

// The two methods we use. Tests pass a fake with the same shape.
export type ScoreStorage = Pick<Storage, 'getItem' | 'setItem'>;

function storageKey(gameId: string): string {
    return `zachs-arcade:scores:${gameId}`;
}

export function loadScores(gameId: string, storage?: ScoreStorage): number[] {
    try {
        // Even touching localStorage can throw when it is blocked, so do it inside the try.
        const store = storage ?? localStorage;
        const raw = store.getItem(storageKey(gameId));
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Stored data can be edited or corrupted, so never trust its shape.
        return parsed
            .filter((value): value is number => Number.isInteger(value) && value >= 0)
            .sort((a, b) => b - a)
            .slice(0, MAX_SCORES);
    } catch {
        return [];
    }
}

export type SaveResult = {
    scores: number[]; // the list after saving, best first
    rank: number | null; // 1 = new best; null = did not make the list
};

export function saveScore(gameId: string, score: number, storage?: ScoreStorage): SaveResult {
    const before = loadScores(gameId, storage);
    if (!Number.isInteger(score) || score <= 0) {
        return { scores: before, rank: null };
    }

    const scores = [...before, score].sort((a, b) => b - a).slice(0, MAX_SCORES);
    const index = scores.indexOf(score);
    const rank = index === -1 ? null : index + 1;

    try {
        const store = storage ?? localStorage;
        store.setItem(storageKey(gameId), JSON.stringify(scores));
    } catch {
        // Storage full or blocked: the score still shows for this round.
    }
    return { scores, rank };
}
```

Things worth understanding:

- **`Pick<Storage, 'getItem' | 'setItem'>`** means "a type with just these two methods of `Storage`". The real `localStorage` fits it, and so does a five-line fake.
- **`const parsed: unknown = JSON.parse(raw);`** `JSON.parse` could return anything. Calling it `unknown` forces you to check before using it, and `Array.isArray` is that check.
- **`(value): value is number =>`** is a *type guard*: a filter that also tells TypeScript the surviving items are numbers.
- **`.sort((a, b) => b - a)`** sorts highest first. Without the compare function, `sort` compares as text, and `10` comes before `9`.
- **`[...before, score]`** builds a new array instead of changing the old one, so `before` still holds what was loaded.

### `GameCanvas.tsx`: additions

```ts
import { loadScores, saveScore } from '../engine/scores';
```

A new prop, `gameId: string`, added to the dependency list too. Then, next to `phase`:

```ts
let best = loadScores(gameId)[0] ?? 0;
let rank: number | null = null;
```

`??` means "use the right side if the left is `undefined` or `null`", which covers an empty list.

Game over becomes its own function:

```ts
function handleGameOver() {
    phase = 'over';
    const score = game.getScore();
    const result = saveScore(gameId, score);
    rank = result.rank;
    best = result.scores[0] ?? 0;
    playSound(rank === 1 ? 'highscore' : 'gameover');
    setStatus(`Game over. Score ${score}. Press Start to play again.`);
}
```

and the overlay shows it:

```ts
function overlayLines(): string[] {
    if (phase === 'title') {
        return [title.toUpperCase(), 'PRESS START', `BEST ${best}`];
    }
    if (phase === 'paused') {
        return ['PAUSED', 'PRESS START'];
    }
    return [
        'GAME OVER',
        `SCORE ${game.getScore()}`,
        rank === 1 ? 'NEW HIGH SCORE!' : `BEST ${best}`,
        'PRESS START',
    ];
}
```

In `GameCabinet`, accept a `gameId` prop and pass it down. In `play.tsx`, pass `gameId={game.id}`.

---

## H. Stage 9: tests

### `types.ts` and `GameCanvas.tsx`: inject randomness

```ts
export type GameEnv = {
    random: () => number; // like Math.random: 0 up to (not including) 1
    playSound: (name: SoundName) => void;
};
```

```ts
const env = { random: Math.random, playSound };
```

In `snake.ts`, `placeFood` uses `env.random()` in place of `Math.random()`.

Note that it's `Math.random` with no parentheses: you're handing over the function itself, for the game to call later.

### The test file

It's `specs/snake.test.ts` in the pack. How it works:

- **`setup(randoms)`** builds a game whose "random" numbers come from a list. `randoms[next++ % randoms.length]` reads the next number and wraps around to the start when the list runs out.
- **`column(12)`** turns "I want column 12" into the random number that produces it: `(12 + 0.5) / COLS`. The `+ 0.5` aims at the middle of the cell so rounding can't tip it into a neighbour.
- **`step(pressed, held)`** advances the game by exactly one move, by passing a `dt` equal to the step time.
- **`vi.fn()`** is a fake `playSound` that records how it was called, so a test can check that eating made the `eat` sound.

Each test follows the same three beats: set up a situation, do something, check the result. Keep to that shape in your own.

---

## I. Stage 10: polish, and the finished files

### `src/engine/theme.ts`

```ts
export type Theme = {
    bg: string;
    pink: string;
    cyan: string;
    yellow: string;
    ink: string;
    dark: string;
};

// Used by tests, and as a fallback if a CSS variable is ever missing.
export const DEFAULT_THEME: Theme = {
    bg: '#1a0838',
    pink: '#ff3ea5',
    cyan: '#3ef0ff',
    yellow: '#ffe14a',
    ink: '#e8e6ff',
    dark: '#120624',
};

// The canvas cannot understand var(--pink), so read the real values off :root once.
export function readTheme(): Theme {
    const styles = getComputedStyle(document.documentElement);
    const theme = { ...DEFAULT_THEME };
    for (const name of Object.keys(theme) as (keyof Theme)[]) {
        const value = styles.getPropertyValue(`--${name}`).trim();
        if (value) {
            theme[name] = value;
        }
    }
    return theme;
}
```

`Object.keys(theme) as (keyof Theme)[]` tells TypeScript the keys are the six colour names and not just "some strings", so `theme[name] = value` is allowed.

In `types.ts`, add `theme: Theme;` to `GameEnv` (and `import type { Theme } from '../engine/theme';`). In `GameCanvas`, `const theme = readTheme();` and include it in `env`.

### `src/games/index.ts`: the registry

```ts
import type { GameFactory } from './types';
import { createSnake } from './snake';

// One place that connects a game id (from src/data/games.ts) to the code that builds it.
// Adding a game later is one import and one line here.
export const GAME_FACTORIES: Record<string, GameFactory | undefined> = {
    snake: createSnake,
};
```

### `src/screens/play.tsx`: the finished file

```tsx
import GameCabinet from '../components/GameCabinet';
import ScreenFrame from '../components/ScreenFrame';
import { GAMES } from '../data/games';
import { GAME_FACTORIES } from '../games';

type PlayScreenProps = {
    gameId: string;
};

function PlayScreen({ gameId }: PlayScreenProps) {
    const game = GAMES.find((g) => g.id === gameId);
    const createGame = GAME_FACTORIES[gameId];

    if (!game || !game.ready || !createGame) {
        return (
            <ScreenFrame title="GAME NOT FOUND" backHref="#/games">
                <p>No cabinet here (yet)!</p>
            </ScreenFrame>
        );
    }

    return <GameCabinet gameId={game.id} title={game.name} createGame={createGame} />;
}

export default PlayScreen;
```

### `src/games/types.ts`: the finished file

```ts
import type { SoundName } from '../engine/audio';
import type { Theme } from '../engine/theme';

// A logical control, not a physical key. Keyboard keys, on-screen buttons and
// the joystick are all translated into these, so games never ask "which key?".
export type Action = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';

export type Input = {
    held: Set<Action>; // actions currently held down
    pressed: Action[]; // actions pressed since the last update, in order
};

// Everything a game needs from the outside world is handed to it, so the game
// itself stays plain TypeScript: no browser, no React, easy to test.
export type GameEnv = {
    random: () => number; // like Math.random: 0 up to (not including) 1
    playSound: (name: SoundName) => void;
    theme: Theme;
};

export type Game = {
    width: number;
    height: number;
    update(dt: number, input: Input): void;
    draw(ctx: CanvasRenderingContext2D): void;
    isOver(): boolean;
    getScore(): number;
};

export type GameFactory = (env: GameEnv) => Game;
```

### `src/games/snake.ts`: the finished file

This includes the glow, the speed-up and the boost twist. Your twist may be different, and that's the point.

```ts
import type { Action, Game, GameEnv, Input } from './types';

export const COLS = 20;
export const ROWS = 20;
const CELL = 20; // pixels per cell
export const START_STEP_TIME = 0.12; // seconds between moves at score 0
const MIN_STEP_TIME = 0.06; // the fastest the wyrm ever gets
const SPEED_UP_PER_POINT = 0.002;
const MAX_QUEUED_TURNS = 3;

type Cell = { x: number; y: number };

// A lookup table instead of four ifs: the action is the key, the step is the value.
const TURNS: Partial<Record<Action, Cell>> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};

function sameCell(a: Cell, b: Cell): boolean {
    return a.x === b.x && a.y === b.y;
}

export function createSnake(env: GameEnv): Game {
    // The head is the FIRST item in the array.
    const snake: Cell[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ];
    const turns: Cell[] = [];
    let direction: Cell = { x: 1, y: 0 };
    let timer = 0;
    let alive = true;
    let score = 0;
    let boosting = false;
    let food = placeFood();

    function placeFood(): Cell {
        while (true) {
            const spot = {
                x: Math.floor(env.random() * COLS),
                y: Math.floor(env.random() * ROWS),
            };
            if (!snake.some((cell) => sameCell(cell, spot))) {
                return spot;
            }
        }
    }

    function stepTime(): number {
        const base = Math.max(MIN_STEP_TIME, START_STEP_TIME - score * SPEED_UP_PER_POINT);
        return boosting ? base / 2 : base;
    }

    function step() {
        const next = turns.shift();
        if (next) {
            const isReverse = next.x === -direction.x && next.y === -direction.y;
            if (!isReverse) {
                direction = next;
            }
        }

        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        const hitWall = newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS;
        const hitSelf = snake.some((cell) => sameCell(cell, newHead));

        if (hitWall || hitSelf) {
            alive = false;
            env.playSound('crash');
            return;
        }

        snake.unshift(newHead);

        if (sameCell(newHead, food)) {
            score += boosting ? 2 : 1; // the twist: boosting is risky, so it pays double
            env.playSound('eat');
            if (snake.length === COLS * ROWS) {
                alive = false; // the board is full: nowhere left to put food
                return;
            }
            food = placeFood();
        } else {
            snake.pop();
        }
    }

    return {
        width: COLS * CELL,
        height: ROWS * CELL,

        update(dt: number, input: Input) {
            if (!alive) return;

            for (const action of input.pressed) {
                const turn = TURNS[action];
                if (turn && turns.length < MAX_QUEUED_TURNS) {
                    turns.push(turn);
                }
            }
            boosting = input.held.has('a');

            timer += dt;
            while (alive && timer >= stepTime()) {
                timer -= stepTime();
                step();
            }
        },

        draw(ctx: CanvasRenderingContext2D) {
            const { theme } = env;

            ctx.fillStyle = theme.dark;
            ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);

            ctx.save(); // remember the drawing settings...
            ctx.shadowBlur = 8;

            ctx.shadowColor = theme.cyan;
            ctx.fillStyle = theme.cyan;
            ctx.fillRect(food.x * CELL + 4, food.y * CELL + 4, CELL - 8, CELL - 8);

            snake.forEach((cell, index) => {
                const color = !alive ? '#666666' : index === 0 ? theme.yellow : theme.pink;
                ctx.shadowColor = color;
                ctx.fillStyle = color;
                ctx.fillRect(cell.x * CELL, cell.y * CELL, CELL - 1, CELL - 1);
            });

            ctx.restore(); // ...and put them back, so the glow does not leak into the text

            ctx.fillStyle = theme.yellow;
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`SCORE ${score}`, 8, 8);
        },

        isOver() {
            return !alive;
        },

        getScore() {
            return score;
        },
    };
}
```

Notes:

- **`while (alive && timer >= stepTime())`**: the `alive &&` stops the loop the moment the wyrm dies mid-frame.
- **`stepTime()` is a function, not a constant,** because the answer now depends on the score and on whether A is held.
- **In `draw`, the nested `? :`** reads as: dead → grey; otherwise head → yellow; otherwise pink.

### `src/components/GameCanvas.tsx`: the finished file

```tsx
import { useEffect, useRef, useState } from 'react';
import type { GameFactory } from '../games/types';
import { attachKeyboard, type InputStore } from '../engine/input';
import { isMuted, playSound, toggleMuted, unlockAudio } from '../engine/audio';
import { loadScores, saveScore } from '../engine/scores';
import { readTheme, type Theme } from '../engine/theme';

// The four states a cabinet can be in. Start moves between them.
type Phase = 'title' | 'playing' | 'paused' | 'over';

type GameCanvasProps = {
    gameId: string;
    title: string;
    createGame: GameFactory;
    input: InputStore;
    onExit: () => void;
};

const MAX_FRAME_TIME = 0.1; // seconds; stops a huge jump after switching tabs

// Dims the game and writes centered lines of text over it.
function drawOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: Theme,
    lines: string[],
) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 4, 20, 0.75)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lineHeight = 28;
    const top = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
        ctx.fillStyle = index === 0 ? theme.yellow : theme.ink;
        ctx.font = `${index === 0 ? 20 : 11}px "Press Start 2P", monospace`;
        ctx.fillText(line, width / 2, top + index * lineHeight);
    });
    ctx.restore();
}

function GameCanvas({ gameId, title, createGame, input, onExit }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Read aloud by screen readers; set only when the phase changes, never per frame.
    const [status, setStatus] = useState('Press Start to play.');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const theme = readTheme();
        const env = { random: Math.random, playSound, theme };

        let game = createGame(env);
        let phase: Phase = 'title';
        let best = loadScores(gameId)[0] ?? 0;
        let rank: number | null = null;

        canvas.width = game.width;
        canvas.height = game.height;

        function pause() {
            if (phase !== 'playing') return;
            phase = 'paused';
            playSound('pause');
            setStatus('Paused. Press Start to resume.');
        }

        function handleStart() {
            if (phase === 'playing') {
                pause();
                return;
            }
            if (phase === 'paused') {
                playSound('resume');
            } else {
                if (phase === 'over') {
                    game = createGame(env); // a fresh game: this is why games are built by a function
                }
                playSound('start');
            }
            phase = 'playing';
            setStatus('Playing.');
        }

        function handleGameOver() {
            phase = 'over';
            const score = game.getScore();
            const result = saveScore(gameId, score);
            rank = result.rank;
            best = result.scores[0] ?? 0;
            playSound(rank === 1 ? 'highscore' : 'gameover');
            setStatus(`Game over. Score ${score}. Press Start to play again.`);
        }

        function overlayLines(): string[] {
            if (phase === 'title') {
                return [title.toUpperCase(), 'PRESS START', `BEST ${best}`];
            }
            if (phase === 'paused') {
                return ['PAUSED', 'PRESS START'];
            }
            return [
                'GAME OVER',
                `SCORE ${game.getScore()}`,
                rank === 1 ? 'NEW HIGH SCORE!' : `BEST ${best}`,
                'PRESS START',
            ];
        }

        // Keys the games never see: Escape belongs to the cabinet, not the game.
        const handleSystemKey = (event: KeyboardEvent) => {
            unlockAudio();
            if (event.code !== 'Escape') return;
            event.preventDefault(); // tells App's own Escape handler this press is taken
            if (phase === 'playing') {
                pause();
            } else {
                onExit();
            }
        };
        const handlePointer = () => unlockAudio();
        const handleVisibility = () => {
            if (document.hidden) pause();
        };

        let frameId = 0;
        let lastTime = performance.now();

        const frame = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_TIME);
            lastTime = now;

            // Start and Select are handled here, before the game gets its turn.
            for (const action of input.state.pressed) {
                if (action === 'start') {
                    handleStart();
                } else if (action === 'select') {
                    setStatus(toggleMuted() ? 'Sound off.' : 'Sound on.');
                }
            }

            if (phase === 'playing') {
                game.update(dt, input.state);
                if (game.isOver()) {
                    handleGameOver();
                }
            }
            input.endFrame();

            game.draw(ctx);
            if (phase !== 'playing') {
                drawOverlay(ctx, game.width, game.height, theme, overlayLines());
            }
            if (isMuted()) {
                ctx.fillStyle = theme.ink;
                ctx.font = '8px "Press Start 2P", monospace';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.fillText('SOUND OFF', game.width - 8, 10);
            }

            frameId = requestAnimationFrame(frame);
        };

        const detachKeyboard = attachKeyboard(input);
        window.addEventListener('keydown', handleSystemKey);
        window.addEventListener('pointerdown', handlePointer);
        document.addEventListener('visibilitychange', handleVisibility);
        frameId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(frameId);
            detachKeyboard();
            window.removeEventListener('keydown', handleSystemKey);
            window.removeEventListener('pointerdown', handlePointer);
            document.removeEventListener('visibilitychange', handleVisibility);
            input.releaseAll();
            input.endFrame();
        };
    }, [gameId, title, createGame, input, onExit]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="game-canvas"
                role="img"
                aria-label={`${title} game screen`}
            />
            <p className="sr-only" role="status">
                {status}
            </p>
        </>
    );
}

export default GameCanvas;
```

---

## J. Stage 11: sprites

### `src/engine/sprites.ts`

```ts
// Loads one sprite sheet (an image holding many small pictures) plus the JSON
// file that says where each picture sits inside it.

type Frame = { x: number; y: number; w: number; h: number };

let image: HTMLImageElement | null = null;
let frames: Record<string, Frame> = {};

// Fire-and-forget: until loading finishes, drawSprite returns false and the
// game draws its plain rectangles instead.
export async function loadSprites(): Promise<void> {
    if (image) return;
    try {
        const response = await fetch('/sprites/sheet.json');
        if (!response.ok) return;
        const atlas = (await response.json()) as Record<string, Frame>;
        const sheet = new Image();
        sheet.src = '/sprites/sheet.png';
        await sheet.decode(); // resolves once the picture is ready to draw
        frames = atlas;
        image = sheet;
    } catch {
        // No sprites: the rectangles stay.
    }
}

// Draws one named sprite with its top-left corner at (x, y), enlarged by a whole number.
// Returns false if it could not, so the caller can fall back.
export function drawSprite(
    ctx: CanvasRenderingContext2D,
    name: string,
    x: number,
    y: number,
    scale = 1,
): boolean {
    const frame = frames[name];
    if (!image || !frame) return false;
    ctx.imageSmoothingEnabled = false; // keep pixel art sharp instead of blurry
    ctx.drawImage(
        image,
        frame.x,
        frame.y,
        frame.w,
        frame.h,
        x,
        y,
        frame.w * scale,
        frame.h * scale,
    );
    return true;
}

// Pixel art with no image editor: each string is a row, each character a pixel.
// Returns a small canvas, which drawImage accepts just like an image.
export function spriteFromRows(rows: string[], palette: Record<string, string>): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = rows[0].length;
    canvas.height = rows.length;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    rows.forEach((row, y) => {
        [...row].forEach((char, x) => {
            const color = palette[char];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            }
        });
    });
    return canvas;
}
```

- **The nine-argument `drawImage`** copies a rectangle *out of* the sheet (`frame.x, frame.y, frame.w, frame.h`) *onto* the canvas (`x, y, width, height`).
- **`imageSmoothingEnabled = false`** stops the browser blurring pixels when it enlarges them.
- **`spriteFromRows`** returns a small canvas. `drawImage` accepts a canvas anywhere it accepts an image, so you can design sprites as text with no image editor:

```ts
const pellet = spriteFromRows(
    ['..cc..', '.cddc.', 'cdccdc', 'cccccc', '.cccc.', '..cc..'],
    { c: '#3ef0ff', d: '#c9fbff' },
);
ctx.imageSmoothingEnabled = false;
ctx.drawImage(pellet, x, y, 12, 12); // 6 pixels drawn at double size
```

Characters that aren't in the palette (here `.`) stay transparent. Build each sprite once when the game is created, not inside `draw`.

### Wiring it in

In `types.ts`, add to `GameEnv`:

```ts
// Draws a named sprite; returns false when sprites are not loaded (yet).
drawSprite: (
    ctx: CanvasRenderingContext2D,
    name: string,
    x: number,
    y: number,
    scale?: number,
) => boolean;
```

In `GameCanvas`:

```ts
import { drawSprite, loadSprites } from '../engine/sprites';
// ...
const env = { random: Math.random, playSound, theme, drawSprite };
void loadSprites();
```

In the test's `env`, add `drawSprite: () => false,`.

### `snake.ts`: sprite size and drawing

```ts
export const COLS = 25;
export const ROWS = 25;
const CELL = 16; // pixels per cell: the same size as one sprite
```

and the middle of `draw` becomes:

```ts
// Sprite first; if it is not loaded yet, fall back to a rectangle.
if (!env.drawSprite(ctx, 'pellet', food.x * CELL, food.y * CELL)) {
    ctx.fillStyle = theme.cyan;
    ctx.fillRect(food.x * CELL + 4, food.y * CELL + 4, CELL - 8, CELL - 8);
}

const facing =
    direction.x === 1 ? 'right' : direction.x === -1 ? 'left' : direction.y === 1 ? 'down' : 'up';

snake.forEach((cell, index) => {
    const name = index > 0 ? 'wyrm_body' : alive ? `wyrm_head_${facing}` : 'skull';
    if (!env.drawSprite(ctx, name, cell.x * CELL, cell.y * CELL)) {
        ctx.fillStyle = index === 0 ? theme.yellow : theme.pink;
        ctx.fillRect(cell.x * CELL, cell.y * CELL, CELL - 1, CELL - 1);
    }
});
```

Because the supplied tests use `COLS` and `ROWS` instead of fixed numbers, they keep passing after the grid changes size.

---

## K. Stage 13: Brick Blitz physics

The file and its tests are in the pack at `reference/brick-blitz-starter/`.

```ts
// Collision helpers for Brick Blitz. Plain maths, no canvas, so they can be unit tested.

export type Rect = { x: number; y: number; w: number; h: number }; // x, y = top-left corner
export type Ball = { x: number; y: number; r: number; vx: number; vy: number }; // x, y = centre

// If the ball overlaps the rectangle: push it back out, bounce it, and return true.
// Works for walls of bricks and for the paddle.
export function bounceOffRect(ball: Ball, rect: Rect): boolean {
    // How far each edge of the ball's bounding box has sunk into the rectangle.
    const fromLeft = ball.x + ball.r - rect.x;
    const fromRight = rect.x + rect.w - (ball.x - ball.r);
    const fromTop = ball.y + ball.r - rect.y;
    const fromBottom = rect.y + rect.h - (ball.y - ball.r);

    // If any of these is zero or negative, there is a gap on that side: no hit.
    if (fromLeft <= 0 || fromRight <= 0 || fromTop <= 0 || fromBottom <= 0) return false;

    // The ball came in through the side it has sunk into the least.
    const sideways = Math.min(fromLeft, fromRight);
    const vertical = Math.min(fromTop, fromBottom);

    if (sideways < vertical) {
        if (fromLeft < fromRight) {
            ball.x -= fromLeft;
            ball.vx = -Math.abs(ball.vx); // "make it go left", not "flip it"
        } else {
            ball.x += fromRight;
            ball.vx = Math.abs(ball.vx);
        }
    } else {
        if (fromTop < fromBottom) {
            ball.y -= fromTop;
            ball.vy = -Math.abs(ball.vy);
        } else {
            ball.y += fromBottom;
            ball.vy = Math.abs(ball.vy);
        }
    }
    return true;
}

const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 degrees from straight up

// Gives the player aim: where the ball lands on the paddle decides the angle it leaves at.
// Centre = straight up, edges = steep. The speed stays the same. Call after a paddle hit.
export function aimFromPaddle(ball: Ball, paddle: Rect): void {
    const speed = Math.hypot(ball.vx, ball.vy);
    const centre = paddle.x + paddle.w / 2;
    const offset = Math.max(-1, Math.min(1, (ball.x - centre) / (paddle.w / 2))); // -1 .. 1
    const angle = offset * MAX_BOUNCE_ANGLE;
    ball.vx = speed * Math.sin(angle);
    ball.vy = -speed * Math.cos(angle); // negative y is up the screen
}
```

### How `bounceOffRect` works

Picture the ball as the square box around it. For each side of the rectangle, measure how far the ball's box has sunk in past that side:

- `fromLeft`: how far the ball's right edge is past the rectangle's left edge.
- `fromRight`, `fromTop`, `fromBottom`: the same idea for the other three.

If any one of these is zero or less, there's a gap on that side, so the two aren't touching at all.

If all four are positive, they overlap. Which side did the ball come in through? The one it has sunk into **least**, because it only just arrived there. Push the ball back out by exactly that amount, and point its velocity away from that side.

`-Math.abs(ball.vy)` means "upward, whatever it was before". If the ball is somehow still overlapping next frame, this leaves it going up, where `vy = -vy` would flip it back down and trap it.

### How `aimFromPaddle` works

- `Math.hypot(vx, vy)` is the ball's speed: the length of its velocity, by Pythagoras.
- `offset` is where the ball landed, from -1 (left edge) through 0 (centre) to 1 (right edge).
- That becomes an angle between -60° and 60° away from straight up.
- `sin` and `cos` split the same speed back into sideways and upward parts.

The speed going in equals the speed coming out. Only the direction changes, and the player chooses it by where they catch the ball.

### Using them in a game loop

```ts
// after moving the ball this frame
if (bounceOffRect(ball, paddle)) {
    aimFromPaddle(ball, paddle);
    env.playSound('bounce');
}

const hit = bricks.findIndex((brick) => bounceOffRect(ball, brick));
if (hit !== -1) {
    bricks.splice(hit, 1); // remove that one brick
    score += 10;
    env.playSound('brick');
}
```

`findIndex` stops at the first brick that reports a hit, which gives you "one brick per frame" for free. Add `bounce` and `brick` to the `FILES` list in `audio.ts` before using them, and TypeScript will then accept the names.
