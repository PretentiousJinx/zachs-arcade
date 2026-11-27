export type Action = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';
import type { SoundName } from '../engine/audio';
import type { Theme } from '../engine/theme';
export type Input = {
    held: Set<Action>; // keys currently held down
    pressed: Action[]; // keys pressed since last update in order
};

export type Game = {
    width: number;
    height: number;
    update(dt: number, input: Input): void;
    draw(ctx: CanvasRenderingContext2D): void;
    isOver(): boolean;
    getScore(): number;
};

export type GameEnv = {
    random: () => number;
    playSound: (name: SoundName) => void;
    theme: Theme;
};
export type GameFactory = (env: GameEnv) => Game;
