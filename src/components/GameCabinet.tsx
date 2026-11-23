import type { GameFactory } from '../games/types';
import GameCanvas from './GameCanvas';
import ControlDeck from './ControlDeck';
import { useState } from 'react';
import { createInput } from '../engine/input';

type GameCabinetProps = {
    title: string;
    createGame: GameFactory;
};

function exitToGames() {
    window.location.hash = '#/games';
}

function GameCabinet({ title, createGame }: GameCabinetProps) {
    const [input] = useState(createInput);
    return (
        <main className="cabinet cabinet--game">
            <div className="marquee">{title}</div>
            <div className="screen screen--game">
                <GameCanvas
                    createGame={createGame}
                    title={title}
                    input={input}
                    onExit={exitToGames}
                />
            </div>
            <ControlDeck input={input} />
            <div className="cabinet-footer">
                <a className="back" href="#/games">
                    Back
                </a>
                <p>Arrows/WASD move · Enter start · P select · Z/Space A · X B</p>
            </div>
        </main>
    );
}
export default GameCabinet;
