import { useEffect, useRef } from 'react';
import type { Game } from '../games/types';
import { attachKeyboard, createInput } from '../engine/input';
type Phase = 'title' | 'playing' | 'paused' | 'over';

type GameCanvasProps = {
    createGame: () => Game;
};

function GameCanvas({ createGame }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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
            } else if (phase === 'playing') {
                phase = 'paused';
            } else if (phase === 'paused') {
                phase = 'playing';
            } else if (phase === 'over') {
                game = createGame();
                phase = 'playing';
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
                }
            }

            input.endFrame();
            game.draw(ctx);

            frameId = requestAnimationFrame(frame);
        };

        frameId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(frameId);
            detach();
        };
    }, [createGame]);

    return <canvas ref={canvasRef} className="game-canvas" />;
}

export default GameCanvas;
