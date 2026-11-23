import { useEffect, useRef, useState } from 'react';
import type { GameFactory } from '../games/types';
import { attachKeyboard, type InputStore } from '../engine/input';
import { isMuted, playSound, toggleMuted, unlockAudio } from '../engine/audio';
import { loadScores, saveScore } from '../engine/scores';

type Phase = 'title' | 'playing' | 'paused' | 'over';

type GameCanvasProps = {
    createGame: GameFactory;
    gameId: string;
    onExit: () => void;
    title: string;
    input: InputStore;
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

function GameCanvas({ createGame, gameId, title, input, onExit }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState('Press Start to play.');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const env = { playSound };
        let game = createGame(env);
        let phase: Phase = 'title';
        let best = loadScores(gameId)[0] ?? 0;
        let rank: number | null = null;
        canvas.width = game.width;
        canvas.height = game.height;

        function pause() {
            if (phase !== 'playing') return;
            phase = 'paused';
            setStatus('Paused. Press Start to resume.');
            playSound('pause');
            input.releaseAll();
        }

        function handleStart() {
            if (phase === 'playing') {
                pause();
                return;
            }
            if (phase === 'paused') {
                playSound('resume');
            } else {
                if (phase === 'over') {
                    game = createGame(env);
                }
                playSound('start');
            }
            phase = 'playing';
            setStatus('Playing.');
        }

        function handleGameOver() {
            phase = 'over';
            const score = game.getScore();
            const result = saveScore(gameId, score);
            rank = result.rank;
            best = result.scores[0] ?? 0;
            if (rank === 1) {
                playSound('highscore');
                setStatus(`New high score: ${score}! Press Start to play again.`);
            } else {
                playSound('gameover');
                setStatus(`Game Over. Score: ${score}. Press Start to play again`);
            }
        }

        const handleSystemKey = (event: KeyboardEvent) => {
            unlockAudio();
            if (event.code !== 'Escape') return;
            event.preventDefault();
            if (event.repeat) return;
            if (phase === 'playing') {
                pause();
            } else {
                onExit();
            }
        };

        const handleVisibility = () => {
            if (document.hidden) pause();
        };

        const handlePointer = () => unlockAudio();

        const detach = attachKeyboard(input);
        window.addEventListener('keydown', handleSystemKey);
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('pointerdown', handlePointer);

        let frameId = 0;
        let lastTime = performance.now();

        const frame = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            for (const action of input.state.pressed) {
                if (action === 'start') {
                    handleStart();
                } else if (action === 'select') {
                    setStatus(toggleMuted() ? 'Sound off.' : 'Sound on.');
                }
            }

            if (phase === 'playing') {
                game.update(dt, input.state);

                if (game.isOver()) {
                    handleGameOver();
                }
            }

            input.endFrame();
            game.draw(ctx);

            if (phase === 'title') {
                drawOverlay(ctx, game.width, game.height, [
                    title.toUpperCase(),
                    'PRESS START',
                    `BEST ${best}`,
                ]);
            } else if (phase === 'paused') {
                drawOverlay(ctx, game.width, game.height, ['PAUSED']);
            } else if (phase === 'over') {
                drawOverlay(ctx, game.width, game.height, [
                    'GAME OVER',
                    `SCORE ${game.getScore()}`,
                    rank === 1 ? 'NEW HIGH SCORE!' : `BEST ${best}`,
                ]);
            }

            if (isMuted()) {
                ctx.save();
                ctx.fillStyle = '#e8e6ff';
                ctx.font = '8px "Press Start 2P", monospace';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.fillText('SOUND OFF', game.width - 8, 10);
                ctx.restore();
            }

            frameId = requestAnimationFrame(frame);
        };

        frameId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(frameId);
            detach();
            window.removeEventListener('keydown', handleSystemKey);
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('pointerdown', handlePointer);
        };
    }, [createGame, gameId, title, input, onExit]);

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
