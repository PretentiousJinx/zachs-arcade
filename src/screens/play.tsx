import ScreenFrame from "../components/ScreenFrame";
import { GAMES } from "../data/games"
import GameCanvas from "../components/GameCanvas";
import { createDemo } from "../games/demo";

type PlayScreenProps = {
    gameId: string;
}

function PlayScreen({ gameId }: PlayScreenProps) {
    const game = GAMES.find((g) => g.id === gameId);

    if (!game || !game.ready) { 
        return (
            <ScreenFrame title="GAME NOT FOUND" backHref="#/games">
                <p>That cabinet is still being built. Check back soon!!</p>
            </ScreenFrame>
        )
    }

    return (
        <ScreenFrame title={game.name} backHref="#/games">
            <GameCanvas createGame={ createDemo } />
        </ScreenFrame>
    )
}
export default PlayScreen;