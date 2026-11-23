import ScreenFrame from '../components/ScreenFrame';
import { GAMES } from '../data/games';
import { createSnake } from '../games/snake';
import GameCabinet from '../components/GameCabinet';

type PlayScreenProps = {
    gameId: string;
};

function PlayScreen({ gameId }: PlayScreenProps) {
    const game = GAMES.find((g) => g.id === gameId);

    if (!game || !game.ready) {
        return (
            <ScreenFrame title="GAME NOT FOUND" backHref="#/games">
                <p>That cabinet is still being built. Check back soon!!</p>
            </ScreenFrame>
        );
    }

    return <GameCabinet title={game.name} gameId={game.id} createGame={createSnake} />;
}
export default PlayScreen;
