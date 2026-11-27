export type Theme = {
    bg: string;
    pink: string;
    cyan: string;
    yellow: string;
    ink: string;
    dark: string;
};

export const DEFAULT_THEME: Theme = {
    bg: '#1a0838',
    pink: '#ff3ea5',
    cyan: '#3ef0ff',
    yellow: '#ffe14a',
    ink: '#e8e6ff',
    dark: '#120624',
};

export function readTheme(): Theme {
    const styles = getComputedStyle(document.documentElement);
    const theme = { ...DEFAULT_THEME };
    for (const name of Object.keys(theme) as (keyof Theme)[]) {
        const value = styles.getPropertyValue(`--${name}`).trim();
        if (value) {
            theme[name] = value;
        }
    }
    return theme;
}
