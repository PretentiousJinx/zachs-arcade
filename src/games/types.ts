export type Action = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';

export type Input = {
    held: Set<Action>; // keys currently held down
    pressed: Action[]; // keys pressed since last update in order
};

export type Game = {
    width: number;
    height: number;
    update(dt: number, input: Input): void;
    draw(ctx: CanvasRenderingContext2D): void;
};
