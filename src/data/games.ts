export type Game = {
    id: string;
    name: string;
    inspiredBy: string;
    description: string;
    ready: boolean;
};

export const GAMES: Game[] = [
    { id: 'snake', name: 'Neon Noodle', inspiredBy: 'Snake', description: 'Eat the glowing pellets and grow without biting your own tail.', ready: false },
    { id: 'bricks', name: 'Brick Blitz', inspiredBy: 'Breakout', description: 'Bounce the ball and smash every brick in the wall.', ready: false },
    { id: 'stack', name: 'Neon Stack', inspiredBy: 'Tetris', description: 'Fit the falling shapes together and clear full rows.', ready: false },
    { id: 'rocks', name: 'Rock Buster', inspiredBy: 'Asteroids', description: 'Steer, thrust and blast drifting space rocks into pieces.', ready: false },
    { id: 'swarm', name: 'Swarm Strike', inspiredBy: 'Galaga', description: 'Hold off diving waves of alien bugs.', ready: false },
    { id: 'crossing', name: 'Cosmic Crossing', inspiredBy: 'Frogger', description: 'Dodge the traffic and make it safely across.', ready: false },
    { id: 'maze', name: 'Dot Dash', inspiredBy: 'Pac-Man', description: 'Clear the maze of dots while staying one step ahead of the chasers.', ready: false },
    { id: 'dig', name: 'Core Driller', inspiredBy: 'Dig Dug', description: 'Tunnel underground and outsmart the creatures below.', ready: false },
];