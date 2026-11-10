import ScreenFrame from "../components/ScreenFrame";
import { GAMES } from "../data/games"

function GameScreen() {
  return (
    <ScreenFrame title="SELECT GAME">
      {GAMES.map((game) => (
        <article key={game.id} className="job">
          <h3>{game.name}</h3>
          <p className="job-meta">Inspired by {game.inspiredBy}</p>
          <p>{game.description}</p>
          {game.ready ? (
            <a className="play" href={`#/games/${game.id}`}>PLAY ►</a>
          ) : (
            <span className="coming-soon">COMING SOON</span>
          )}
        </article>
      ))}
      <p className="disclaimer">
        These games are original works inspired by classic arcade titles.
        Not affiliated with or endorsed by the owners of the original titles.
      </p>
    </ScreenFrame>
  ); 
}
export default GameScreen;