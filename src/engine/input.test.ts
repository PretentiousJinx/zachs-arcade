import { describe, expect, it, vi } from 'vitest';
import { createInput } from './input';

describe('input store', () => {
    it('records a press as both held and pressed', () => {
        const input = createInput();
        input.press('up');
        expect(input.state.held.has('up')).toBe(true);
        expect(input.state.pressed).toEqual(['up']);
    });

    it('does not count a second press while already held', () => {
        const input = createInput();
        input.press('a');
        input.press('a');
        expect(input.state.pressed).toEqual(['a']);
    });

    it('keeps presses in order and clears them at the end of the frame', () => {
        const input = createInput();
        input.press('up');
        input.press('left');
        expect(input.state.pressed).toEqual(['up', 'left']);
        input.endFrame();
        expect(input.state.pressed).toEqual([]);
        expect(input.state.held.has('up')).toBe(true); // still held
    });

    it('tells subscribers about changes until they unsubscribe', () => {
        const input = createInput();
        const listener = vi.fn();
        const unsubscribe = input.subscribe(listener);
        input.press('b');
        input.release('b');
        expect(listener).toHaveBeenCalledTimes(2);
        unsubscribe();
        input.press('b');
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('releases everything at once', () => {
        const input = createInput();
        input.press('left');
        input.press('a');
        input.releaseAll();
        expect(input.state.held.size).toBe(0);
    });
});
