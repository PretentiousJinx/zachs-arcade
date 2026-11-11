import type { Game, Input } from "./types";

export function createDemo(): Game {
    let x = 190;
    let y = 190;
    const size = 20;
    const speed = 200;

    return {

        width: 400,
        height: 400,

        update(dt: number, input: Input) {
            if (input.held.has('ArrowRight')) {
                x += speed * dt;
            }
            if (input.held.has('ArrowLeft')) {
                x -= speed * dt;
            }
            if (input.held.has('ArrowDown')) {
                y += speed * dt;
            }
            if (input.held.has('ArrowUp')) {
                y -= speed * dt;
            }

            x = Math.max(0, Math.min(x, 400 - size));

            y = Math.max(0, Math.min(y, 400 - size));
        },
    
        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = "#0d0221";
            ctx.fillRect(0, 0, 400, 400);

            ctx.fillStyle = "#ff2e97";
            ctx.fillRect(x, y, size, size);


        },
    }
}
