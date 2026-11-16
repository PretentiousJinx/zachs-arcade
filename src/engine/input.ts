import type { Action, Input } from '../games/types';

export const KEY_MAP: Record<string, Action> = {
    ArrowUp: 'up',
    KeyW: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
    Space: 'a',
    Enter: 'start',
    KeyP: 'select',
    KeyX: 'b',
    KeyZ: 'a',
};

export type InputStore = {
    state: Input;
    press(action: Action): void;
    release(action: Action): void;
    releaseAll(): void;
    endFrame(): void;
    subscribe(listener: () => void): () => void;
};

export function attachKeyboard(input: InputStore): () => void {
    const handleKeyDown = (event: KeyboardEvent) => {
        const action = KEY_MAP[event.code];
        if (!action) return; // not a recognized game key: let the browser have it
        event.preventDefault(); // stop arrows and space from scrolling

        input.press(action);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        const action = KEY_MAP[event.code];
        if (!action) return;
        input.release(action);
    };

    // release everything in case window losses focus while key is pressed
    const handleBlur = () => {
        input.releaseAll();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('blur', handleBlur);
    };
}

export function createInput(): InputStore {
    const state: Input = { held: new Set(), pressed: [] };
    const listeners = new Set<() => void>();

    function notify() {
        listeners.forEach((listener) => listener());
    }

    return {
        state,

        press(action) {
            if (state.held.has(action)) return; // already down not something new
            state.held.add(action);
            state.pressed.push(action);
            notify();
        },

        release(action) {
            if (!state.held.delete(action)) return; // reports whether it was there
            notify();
        },

        releaseAll() {
            if (state.held.size === 0) return;
            state.held.clear();
            notify();
        },

        // Called by the game loop after each update presses are used up once
        endFrame() {
            state.pressed.length = 0;
        },

        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}
