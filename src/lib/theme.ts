export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function getTheme(): Theme {
	if (typeof document === 'undefined') return 'light';
	const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
	localStorage.setItem(STORAGE_KEY, theme);
	document.documentElement.setAttribute('data-theme', theme);
	window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function toggleTheme(): Theme {
	const current = getTheme();
	const next: Theme = current === 'dark' ? 'light' : 'dark';
	setTheme(next);
	return next;
}

export function initTheme(): void {
	if (typeof document === 'undefined') return;
	const theme = getTheme();
	document.documentElement.setAttribute('data-theme', theme);
}
