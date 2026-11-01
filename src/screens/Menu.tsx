import { useState, useEffect } from 'react';

const OPTIONS = [
    { label: 'Home', link: '#/home' },
    { label: 'Contact Me', link: '#/contact' },
    { label: 'Resume', link: '#/resume' },
    { label: 'Games', link: '#/games' }
];

function MenuScreen() {

    // Remember selected option in state and highlight it in the menu
    const [selected, setSelected] = useState(0);

    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp') {

                event.preventDefault();
                // Handle up arrow key press to move selection up
                setSelected((prev) => (prev > 0 ? prev - 1 : OPTIONS.length - 1));

            } 
            else if (event.key === 'ArrowDown') {

                event.preventDefault();
                // Handle down arrow key press to move selection down
                setSelected((prev) => (prev < OPTIONS.length - 1 ? prev + 1 : 0));

            }
            else if (event.key === 'Enter') {

                event.preventDefault();
                // Handle enter key press navigate to the selected option's link
                window.location.hash = OPTIONS[selected].link;

            }
        };

        window.addEventListener('keydown', handleKey);

        return () => {
            window.removeEventListener('keydown', handleKey);
        };
    }, [selected]);

    return (
        <main>
            <h1>Welcome to My Arcade</h1>
            <nav>
                <ul>
                    {OPTIONS.map((option, index) => (
                        <li key={option.link} className={index === selected ? 'selected' : ''}>
                            <a 
                                href={option.link}
                                onFocus={() => setSelected(index)}
                                onMouseEnter={() => setSelected(index)}
                                >
                                {option.label}
                            </a>
                            
                        </li>
                    ))}
                </ul>
            </nav>
        </main>        
    )
}

export default MenuScreen;
