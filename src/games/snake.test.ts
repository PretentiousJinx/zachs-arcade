import { describe, expect, it, vi } from 'vitest';
import { COLS, ROWS, createSnake, START_STEP_TIME } from './snake';
import type { Action, GameEnv, Input } from './types';
import { DEFAULT_THEME } from '../engine/theme';
// The random number that makes placeFood pick a given column or row.
const column = (x: number) => (x + 0.5) / COLS;
const row = (y: number) => (y + 0.5) / ROWS;

// Builds a game whose "random" numbers come from a list we choose, so every
// test knows exactly where the food will appear.
function setup(randoms: number[] = [0, 0]) {
    let next = 0;
    const playSound = vi.fn();
    const env: GameEnv = {
        random: () => randoms[next++ % randoms.length],
        playSound,
        theme: DEFAULT_THEME,
    };
    const game = createSnake(env);

    // Advance the game by exactly one move, optionally pressing or holding controls.
    function step(pressed: Action[] = [], held: Action[] = []) {
        const input: Input = { held: new Set(held), pressed };
        game.update(START_STEP_TIME, input);
    }

    return { game, step, playSound };
}

describe('Data Wyrm', () => {
    it('starts alive with a score of zero', () => {
        const { game } = setup();
        expect(game.isOver()).toBe(false);
        expect(game.getScore()).toBe(0);
    });

    it('dies when it reaches the right wall', () => {
        const { game, step, playSound } = setup();
        // The head starts in column 10 moving right, so it can take COLS - 11 safe steps.
        for (let i = 0; i < COLS - 11; i++) step();
        expect(game.isOver()).toBe(false);
        step();
        expect(game.isOver()).toBe(true);
        expect(playSound).toHaveBeenCalledWith('crash');
    });

    it('ignores a turn straight back into its own neck', () => {
        const { game, step } = setup();
        step(['left']);
        expect(game.isOver()).toBe(false);
    });

    it('keeps both turns when two are pressed between moves', () => {
        const { game, step } = setup();
        // Moving right: up then left is legal, as two separate moves.
        step(['up', 'left']);
        step();
        expect(game.isOver()).toBe(false);
    });

    it('scores and makes a sound when it eats', () => {
        // Column 12, row 10: two cells ahead of the head.
        const { game, step, playSound } = setup([column(12), row(10), 0, 0]);
        step();
        expect(game.getScore()).toBe(0);
        step();
        expect(game.getScore()).toBe(1);
        expect(playSound).toHaveBeenCalledWith('eat');
    });

    it('does not eat food that is only in the same column', () => {
        // Column 12 again, but row 0: the head passes underneath it.
        const { game, step } = setup([column(12), row(0), 0, 0]);
        step();
        step();
        expect(game.getScore()).toBe(0);
    });

    it.skip('pays double while boosting', () => {
        const { game, step } = setup([column(12), row(10), 0, 0]);
        // Holding A halves the time per move, so one update covers both cells.
        step([], ['a']);
        expect(game.getScore()).toBe(2);
    });

    it('stops changing once it is over', () => {
        const { game, step } = setup();
        for (let i = 0; i < COLS; i++) step();
        const score = game.getScore();
        step(['up']);
        expect(game.isOver()).toBe(true);
        expect(game.getScore()).toBe(score);
    });

    it('ignores a fourth queued turn', () => {
        // Food at column 9, row 7: only reachable if the fourth turn (left) is kept.
        const { game, step } = setup([column(9), row(7), 0, 0]);
        // Four turns pressed before one move. The queue holds three, so 'left' is dropped.
        step(['up', 'up', 'up', 'left']);
        step();
        step();
        step();
        // Kept: up, up, up. The head goes (10, 9), (10, 8), (10, 7), (10, 6) and misses the food.
        // If 'left' were kept, the fourth move would land on (9, 7) and score.
        expect(game.getScore()).toBe(0);
        expect(game.isOver()).toBe(false);
    });

    it('survives turning down and moving twice', () => {
        const { game, step } = setup();

        step(['down']);
        step();
        expect(game.isOver()).toBe(false);
    });

    it('plays the crash sound only once', () => {
        const { playSound, step } = setup();
        for (let i = 0; i < COLS + 5; i++) {
            step();
        }
        expect(playSound).toHaveBeenCalledTimes(1);
    });
});
