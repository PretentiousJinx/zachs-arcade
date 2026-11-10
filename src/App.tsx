import HomeScreen from './screens/home';
import GameScreen from './screens/games';
import ResumeScreen from './screens/resume';
import ContactScreen from './screens/contact';
import MenuScreen from './screens/Menu';
import PlayScreen from './screens/play';
import { useState, useEffect } from 'react';

function App() {

    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (event.key === 'Escape') {
                window.location.hash = '#/';
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
        
    }, []);

    if (hash === '#/home') {
        return <HomeScreen />;
    }

    if (hash === '#/resume') {
        return <ResumeScreen />;
    }

    if (hash === '#/contact') {
        return <ContactScreen />;
    }

    if (hash.startsWith('#/games/')) {
        const gameId = hash.slice('#/games/'.length);
        return <PlayScreen gameId={gameId} />;
    }

    if (hash === '#/games') {
        return <GameScreen />;
    }

    return <MenuScreen />;

}
export default App
