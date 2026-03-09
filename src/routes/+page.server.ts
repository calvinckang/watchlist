import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { movie, user } from '$lib/server/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { searchMoviePoster, posterUrl } from '$lib/server/tmdb';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const rows = await db
		.select()
		.from(movie)
		.where(eq(movie.userId, event.locals.user.id))
		.orderBy(desc(movie.createdAt));

	const needsBackfill = rows.filter((r) => !r.posterPath);
	const backfillPromises = needsBackfill.map(async (m) => {
		const path = await searchMoviePoster(m.title);
		if (path) {
			await db.update(movie).set({ posterPath: path }).where(eq(movie.id, m.id));
			return { ...m, posterPath: path };
		}
		return m;
	});
	const backfilled = await Promise.all(backfillPromises);
	const backfillMap = new Map(backfilled.map((m) => [m.id, m.posterPath]));

	const movies = rows.map((m) => ({
		...m,
		posterPath: m.posterPath ?? backfillMap.get(m.id) ?? null,
		posterUrl: posterUrl(m.posterPath ?? backfillMap.get(m.id) ?? null)
	}));

	return { movies, user: event.locals.user };
};

export const actions: Actions = {
	addMovie: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const title = formData.get('title')?.toString()?.trim() ?? '';
		const posterPath = formData.get('poster_path')?.toString()?.trim() || null;
		if (!title) {
			return fail(400, { message: 'Title is required' });
		}
		await db.insert(movie).values({
			userId: event.locals.user.id,
			title,
			posterPath
		});
	},
	removeMovie: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const id = formData.get('id');
		const parsed = typeof id === 'string' ? parseInt(id, 10) : NaN;
		if (Number.isNaN(parsed) || parsed < 1) {
			return fail(400, { message: 'Invalid movie' });
		}
		await db
			.delete(movie)
			.where(and(eq(movie.id, parsed), eq(movie.userId, event.locals.user!.id)));
	},
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	},
	updateAvatar: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const emoji = formData.get('emoji')?.toString()?.trim();
		await db.update(user).set({ image: emoji || null }).where(eq(user.id, event.locals.user.id));
	}
};
