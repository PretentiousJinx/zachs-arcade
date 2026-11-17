import { useEffect, useRef, useState } from 'react';
import type { Game } from '../games/types';
import { attachKeyboard, createInput } from '../engine/input';
type Phase = 'title' | 'playing' | 'paused' | 'over';

type GameCanvasProps = {
    createGame: () => Game;
    title: string;
};

const LINE_HEIGHT = 28;

function drawOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    lines: string[],
) {
    ctx.save();

    ctx.fillStyle = 'rgba(13, 2, 33, 0.75)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffe14d';
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const top = height / 2 - ((lines.length - 1) * LINE_HEIGHT) / 2;
    lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, top + i * LINE_HEIGHT);
    });

    ctx.restore();
}

function GameCanvas({ createGame, title }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState('Press Start to play.');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let game = createGame();
        let phase: Phase = 'title';
        canvas.width = game.width;
        canvas.height = game.height;

        function handleStart() {
            if (phase === 'title') {
                phase = 'playing';
                setStatus('playing');
            } else if (phase === 'playing') {
                phase = 'paused';
                setStatus('paused');
            } else if (phase === 'paused') {
                phase = 'playing';
                setStatus('playing');
            } else if (phase === 'over') {
                game = createGame();
                phase = 'playing';
                setStatus('playing');
            }
        }

        const input = createInput();

        const detach = attachKeyboard(input);

        let frameId = 0;
        let lastTime = performance.now();

        const frame = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            if (input.state.pressed.includes('start')) {
                handleStart();
            }

            if (phase === 'playing') {
                game.update(dt, input.state);

                if (game.isOver()) {
                    phase = 'over';
                    setStatus(`Game Over. Score: ${game.getScore()}. Press Start to play again`);
                }
            }

            input.endFrame();
            game.draw(ctx);

            if (phase === 'title') {
                drawOverlay(ctx, game.width, game.height, [title.toUpperCase(), 'PRESS START']);
            } else if (phase === 'paused') {
                drawOverlay(ctx, game.width, game.height, ['PAUSED']);
            } else if (phase === 'over') {
                drawOverlay(ctx, game.width, game.height, [
                    'GAME OVER',
                    `SCORE ${game.getScore()}`,
                ]);
            }

            frameId = requestAnimationFrame(frame);
        };

        frameId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(frameId);
            detach();
        };
    }, [createGame, title]);

    return (
        <>
            <canvas ref={canvasRef} className="game-canvas" />
            <p className="sr-only" role="status">
                {status}
            </p>
        </>
    );
}

export default GameCanvas;
