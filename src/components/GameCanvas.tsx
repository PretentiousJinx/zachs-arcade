import { useEffect, useRef } from "react";
import type { Game, Input } from '../games/types';

type GameCanvasProps = {
    createGame: () => Game;
}

const GAME_KEYS = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];

function GameCanvas({ createGame }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect (() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const game = createGame();
        canvas.width = game.width;
        canvas.height = game.height;

        const input: Input = { held: new Set(), pressed: [] };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (GAME_KEYS.includes(event.key)) {
                event.preventDefault();
            }
            if (!event.repeat) {
                input.pressed.push(event.key);
            }
            input.held.add(event.key);
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            input.held.delete(event.key);
        };

        let frameId = 0;
        let lastTime = performance.now();

        const frame = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            game.update(dt, input);
            input.pressed.length = 0;
            game.draw(ctx);

            frameId = requestAnimationFrame(frame);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        frameId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [createGame]);

    return <canvas ref={canvasRef} className="game-canvas" />;
}

export default GameCanvas;