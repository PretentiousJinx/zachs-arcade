import type { Game, Input } from './types';

const COLS = 20;
const ROWS = 20;
const CELL = 20;
const STEP_TIME = 0.12;

type Cell = { x: number; y: number };

export function createSnake(): Game {
    let snake: Cell[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ];
    let direction: Cell = { x: 1, y: 0 };
    let timer = 0;

    function step() {
        const head = snake[0];
        let newHead = { x: head.x + direction.x, y: head.y + direction.y};
        snake.unshift(newHead);
        snake.pop();
    }

    return {
        width: COLS * CELL,
        height: ROWS * CELL,
    
        update(dt: number, input: Input) {

            input.pressed.forEach((key) => {
                if (key === 'ArrowUp') {
                    direction = { x: 0, y: -1};
                }
                if (key === 'ArrowDown') {
                    direction = { x: 0, y: 1 };
                }
                if (key === 'ArrowRight') {
                    direction = { x: 1, y: 0 };
                }
                if (key === 'ArrowLeft') {
                    direction = { x: -1, y: 0 };
                }
                
                timer += dt;
                while (timer >= STEP_TIME) {
                    timer -= STEP_TIME;
                    step();
                };
            });
        },

        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = "#0d0221";
            ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
            ctx.fillStyle = "#ff2e97";
            snake.forEach((cell) => {
                ctx.fillRect(cell.x * CELL, cell.y * CELL, CELL - 1, CELL - 1);
            })
        },
    };
}
