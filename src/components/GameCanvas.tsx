import { useEffect, useRef } from 'react';
import type { Game } from '../games/types';
import { attachKeyboard, createInput } from '../engine/input';

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

        const game = createGame();
        canvas.width = game.width;
        canvas.height = game.height;

        const input = createInput();

        const detach = attachKeyboard(input);

        let frameId = 0;
        let lastTime = performance.now();

        const frame = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;
            game.update(dt, input.state);
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
