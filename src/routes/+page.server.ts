import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { movie } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/login');
	}
	const movies = await db
		.select()
		.from(movie)
		.where(eq(movie.userId, event.locals.user.id))
		.orderBy(desc(movie.createdAt));
	return { movies };
};

export const actions: Actions = {
	addMovie: async (event) => {
		if (!event.locals.user) {
			return redirect(302, '/login');
		}
		const formData = await event.request.formData();
		const title = formData.get('title')?.toString()?.trim() ?? '';
		if (!title) {
			return fail(400, { message: 'Title is required' });
		}
		await db.insert(movie).values({
			userId: event.locals.user.id,
			title
		});
	},
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/login');
	}
};
