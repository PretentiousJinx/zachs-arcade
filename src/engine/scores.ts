const MAX_SCORES = 5;

export type ScoreStorage = Pick<Storage, 'getItem' | 'setItem'>;

function storageKey(gameId: string): string {
    return `zachs-arcade:scores:${gameId}`;
}

export function loadScores(gameId: string, storage?: ScoreStorage): number[] {
    try {
        const store = storage ?? localStorage;
        const raw = store.getItem(storageKey(gameId));
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((value): value is number => Number.isInteger(value) && value >= 0)
            .sort((a, b) => b - a)
            .slice(0, MAX_SCORES);
    } catch {
        return [];
    }
}

export type SaveResult = {
    scores: number[];
    rank: number | null;
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
