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
    KeySpace: 'start',
    KeyEnter: 'start',
    KeyEsc: 'select',
    KeyP: 'select',
    KeyX: 'b',
    KeyZ: 'a',
};

export type InputStore = {
    state: Input;
    pressed(action: Action): void;
    released(action: Action): void;
    releaseAll(): void;
    endFrame(): void;
    subscribe(listener: () => void): () => void;
};

export function createInput() {
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

        releaseAll(action) {
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
