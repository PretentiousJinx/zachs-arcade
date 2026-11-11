export type Input = {
    held: Set<string>; // keys currently held down
    pressed: string[]; // keys pressed since last update in order
};

export type Game = {
    width: number;
    height: number;
    update(dt: number, input: Input): void;
    draw(ctx: CanvasRenderingContext2D): void;
};
