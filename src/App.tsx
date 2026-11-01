import HomeScreen from './screens/home';
import GameScreen from './screens/games';
import ResumeScreen from './screens/resume';
import ContactScreen from './screens/contact';
import MenuScreen from './screens/Menu';
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

    if (hash === '#/games') {
        return <GameScreen />;
    }

    return <MenuScreen />;

}
export default App
