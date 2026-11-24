import type { Game, Input, Action, GameEnv } from './types';

export const COLS = 20;
export const ROWS = 20;
const CELL = 20;
export const START_STEP_TIME = 0.12;
type Cell = { x: number; y: number };
const DIRECTIONS: Partial<Record<Action, Cell>> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};

export function createSnake(env: GameEnv): Game {
    const snake: Cell[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ];
    let timer = 0;
    let alive = true;
    let direction: Cell = { x: 1, y: 0 };
    const turns: Cell[] = [];

    function sameCell(a: Cell, b: Cell): boolean {
        return a.x === b.x && a.y === b.y;
    }

    function placeFood(): Cell {
        while (true) {
            const spot = {
                x: Math.floor(env.random() * COLS),
                y: Math.floor(env.random() * ROWS),
            };
            const onSnake = snake.some((cell) => sameCell(cell, spot));
            if (!onSnake) {
                return spot;
            }
        }
    }

    let food = placeFood();
    let score = 0;

    function step() {
        const next = turns.shift();
        if (next) {
            const isReverse = next.x === -direction.x && next.y === -direction.y;
            if (!isReverse) {
                direction = next;
            }
        }
        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };
        const hitWall = newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS;

        const hitSelf = snake.some((cell) => sameCell(cell, newHead));

        if (hitWall || hitSelf) {
            alive = false;
            env.playSound('crash');
            return;
        }
        snake.unshift(newHead);

        if (sameCell(newHead, food)) {
            score += 1;
            env.playSound('eat');
            if (snake.length === COLS * ROWS) {
                alive = false;
                return;
            }
            food = placeFood();
        } else {
            snake.pop();
        }
    }

    return {
        width: COLS * CELL,
        height: ROWS * CELL,

        isOver() {
            return !alive;
        },

        getScore() {
            return score;
        },

        update(dt: number, input: Input) {
            if (this.isOver()) return;

            input.pressed.forEach((action) => {
                const turn = DIRECTIONS[action];
                if (turn && turns.length < 3) {
                    turns.push(turn);
                }
            });

            timer += dt;
            while (timer >= START_STEP_TIME) {
                timer -= START_STEP_TIME;
                step();
            }
        },

        draw(ctx: CanvasRenderingContext2D) {
            ctx.fillStyle = '#0d0221';
            ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
            ctx.fillStyle = alive ? '#ff2e97' : '#666666';
            snake.forEach((cell) => {
                ctx.fillRect(cell.x * CELL, cell.y * CELL, CELL - 1, CELL - 1);
            });

            ctx.fillStyle = '#3ef0ff';
            ctx.fillRect(food.x * CELL, food.y * CELL, CELL - 1, CELL - 1);

            ctx.fillStyle = '#ffe14d';
            ctx.font = '12px "Press Start 2P"';
            ctx.textBaseline = 'top';
            ctx.fillText(`SCORE ${score}`, 8, 8);
        },
    };
}
