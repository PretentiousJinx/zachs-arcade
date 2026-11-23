import { describe, expect, it } from 'vitest';
import { loadScores, saveScore, type ScoreStorage } from './scores';

// A stand-in for localStorage that lives in memory, so tests need no browser.
function fakeStorage(initial: Record<string, string> = {}): ScoreStorage {
    const data = new Map(Object.entries(initial));
    return {
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => {
            data.set(key, value);
        },
    };
}

describe('scores', () => {
    it('starts with an empty list', () => {
        expect(loadScores('snake', fakeStorage())).toEqual([]);
    });

    it('saves a score and reports its rank', () => {
        const storage = fakeStorage();
        expect(saveScore('snake', 7, storage)).toEqual({ scores: [7], rank: 1 });
        expect(saveScore('snake', 3, storage)).toEqual({ scores: [7, 3], rank: 2 });
        expect(loadScores('snake', storage)).toEqual([7, 3]);
    });

    it('keeps only the best five', () => {
        const storage = fakeStorage();
        [5, 9, 1, 7, 3, 8].forEach((score) => saveScore('snake', score, storage));
        expect(loadScores('snake', storage)).toEqual([9, 8, 7, 5, 3]);
    });

    it('gives no rank to a score that misses the list', () => {
        const storage = fakeStorage();
        [5, 6, 7, 8, 9].forEach((score) => saveScore('snake', score, storage));
        expect(saveScore('snake', 2, storage).rank).toBeNull();
    });

    it('keeps each game separate', () => {
        const storage = fakeStorage();
        saveScore('snake', 4, storage);
        expect(loadScores('bricks', storage)).toEqual([]);
    });

    it('ignores zero and nonsense scores', () => {
        const storage = fakeStorage();
        expect(saveScore('snake', 0, storage).rank).toBeNull();
        expect(saveScore('snake', 2.5, storage).rank).toBeNull();
        expect(loadScores('snake', storage)).toEqual([]);
    });

    it('survives corrupted stored data', () => {
        const key = 'zachs-arcade:scores:snake';
        expect(loadScores('snake', fakeStorage({ [key]: 'not json' }))).toEqual([]);
        expect(loadScores('snake', fakeStorage({ [key]: '{"a":1}' }))).toEqual([]);
        expect(loadScores('snake', fakeStorage({ [key]: '[3,"x",-1,8]' }))).toEqual([8, 3]);
    });

    it('survives storage that throws', () => {
        const broken: ScoreStorage = {
            getItem: () => {
                throw new Error('blocked');
            },
            setItem: () => {
                throw new Error('blocked');
            },
        };
        expect(loadScores('snake', broken)).toEqual([]);
        expect(saveScore('snake', 5, broken)).toEqual({ scores: [5], rank: 1 });
    });
});
