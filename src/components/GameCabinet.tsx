import type { Game } from '../games/types';
import GameCanvas from './GameCanvas';
import ControlDeck from './ControlDeck';

type GameCabinetProps = {
    title: string;
    createGame: () => Game;
};

function GameCabinet({ title, createGame }: GameCabinetProps) {
    return (
        <main className="cabinet cabinet--game">
            <div className="marquee">{title}</div>
            <div className="screen screen--game">
                <GameCanvas createGame={createGame} title={title} />
            </div>
            <ControlDeck />
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
