import { env } from '$env/dynamic/private';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBMovieResult {
	id: number;
	title: string;
	poster_path: string | null;
	release_date: string | null;
}

export function posterUrl(
	path: string | null,
	size: 'w92' | 'w154' | 'w342' | 'w500' | 'original' = 'w92'
): string | undefined {
	if (!path) return undefined;
	return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function fetchTMDB<T>(path: string): Promise<T | null> {
	const key = env.TMDB_API_KEY;
	if (!key?.trim()) return null;

	const url = `${TMDB_BASE}${path}`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${key}` }
	});
	if (!res.ok) return null;
	return res.json();
}

export async function searchMovies(query: string): Promise<TMDBMovieResult[]> {
	const trimmed = query.trim();
	if (!trimmed) return [];

	const qs = new URLSearchParams({ query: trimmed });
	const data = await fetchTMDB<{ results: TMDBMovieResult[] }>(
		`/search/movie?${qs.toString()}`
	);
	if (!data?.results) return [];
	return data.results.map((r) => ({
		id: r.id,
		title: r.title,
		poster_path: r.poster_path ?? null,
		release_date: r.release_date ?? null
	}));
}

export async function searchMoviePoster(title: string): Promise<string | null> {
	const results = await searchMovies(title);
	const first = results[0];
	return first?.poster_path ?? null;
}
