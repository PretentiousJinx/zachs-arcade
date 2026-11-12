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
    let alive = true;
    let turns: Cell[] = [];


    function step() {
        const next = turns.shift();
        if (next) {
            const isReverse = next.x === -direction.x && next.y === -direction.y;
            if (!isReverse) {
                direction = next;
            }
        }
        const head = snake[0];
        let newHead = { x: head.x + direction.x, y: head.y + direction.y};
        const hitWall =
            newHead.x < 0 ||
            newHead.x >= COLS ||
            newHead.y < 0 ||
            newHead.y >= ROWS;

            const hitSelf = snake.some(
                (cell) => cell.x === newHead.x && cell.y === newHead.y);
        
            if (hitWall || hitSelf) {
            alive = false;
            return;
        }
        snake.unshift(newHead);
        snake.pop();
    }

    return {
        width: COLS * CELL,
        height: ROWS * CELL,
    
        update(dt: number, input: Input) {
            if (!alive) return;

            input.pressed.forEach((key) => {
                if (key === 'ArrowUp') {
                    turns.push({ x: 0, y: -1});
                }
                if (key === 'ArrowDown') {
                    turns.push({ x: 0, y: 1});
                }
                if (key === 'ArrowRight') {
                    turns.push({ x: 1, y: 0});
                }
                if (key === 'ArrowLeft') {
                    turns.push({ x: -1, y: 0});
                };

            });

            timer += dt;
            while (timer >= STEP_TIME) {
                timer -= STEP_TIME;
                step();
            }
        },

        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = "#0d0221";
            ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
            ctx.fillStyle = alive? "#ff2e97" : '#666666';
            snake.forEach((cell) => {
                ctx.fillRect(cell.x * CELL, cell.y * CELL, CELL - 1, CELL - 1);
            })
        },
    };
}