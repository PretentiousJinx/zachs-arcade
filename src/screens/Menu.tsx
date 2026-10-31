const OPTIONS = [
    { label: 'Home', link: '#/home' },
    { label: 'Contact Me', link: '#/contact' },
    { label: 'Resume', link: '#/resume' },
    { label: 'Games', link: '#/games' }
];

function MenuScreen() {
    
    return (
        <main>
            <h1>Welcome to My Arcade</h1>
            <nav>
                <ul>
                    {OPTIONS.map((option) => (
                        <li key={option.link}>
                            <a href={option.link}>{option.label}</a>
                        </li>
                    ))}
                </ul>
            </nav>
        </main>        
    )
}

export default MenuScreen;
