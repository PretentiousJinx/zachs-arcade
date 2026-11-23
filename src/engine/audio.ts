// Sound effects through the Web Audio API.
// One AudioContext for the whole site, created on the first key press or tap,
// because browsers refuse to make sound before the visitor interacts.

const FILES = {
    start: '/sounds/start.wav',
    pause: '/sounds/pause.wav',
    resume: '/sounds/resume.wav',
    eat: '/sounds/eat.wav',
    crash: '/sounds/crash.wav',
    gameover: '/sounds/gameover.wav',
    highscore: '/sounds/highscore.wav',
} as const;

export type SoundName = keyof typeof FILES;

const MUTE_KEY = 'zachs-arcade:muted';

let context: AudioContext | null = null;
let master: GainNode | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
const loading = new Map<SoundName, Promise<void>>();
let muted = readMuted();

function readMuted(): boolean {
    try {
        return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
        return false;
    }
}

async function loadSound(ctx: AudioContext, name: SoundName): Promise<void> {
    try {
        const response = await fetch(FILES[name]);
        if (!response.ok) return;
        const data = await response.arrayBuffer();
        buffers.set(name, await ctx.decodeAudioData(data));
    } catch {
        // A missing or broken file means that one sound stays silent. Never crash the game.
    }
}

export function unlockAudio(): void {
    if (!context) {
        const ctx = new AudioContext();
        context = ctx;
        master = ctx.createGain();
        master.gain.value = 0.5;
        master.connect(ctx.destination);
        (Object.keys(FILES) as SoundName[]).forEach((name) =>
            loading.set(name, loadSound(ctx, name)),
        );
    }
    if (context.state === 'suspended') {
        void context.resume();
    }
}

const MAX_DELAY_MS = 250;

function startBuffer(buffer: AudioBuffer): void {
    if (!context || !master) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(master);
    source.start();
}

export function playSound(name: SoundName): void {
    if (muted || !context) return;
    const buffer = buffers.get(name);
    if (buffer) {
        startBuffer(buffer);
        return;
    }

    const askedAt = performance.now();
    void loading.get(name)?.then(() => {
        const late = buffers.get(name);
        if (late && !muted && performance.now() - askedAt < MAX_DELAY_MS) {
            startBuffer(late);
        }
    });
}

export function isMuted(): boolean {
    return muted;
}

export function toggleMuted(): boolean {
    muted = !muted;
    try {
        localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
        // The choice just won't be remembered next visit.
    }
    return muted;
}
