import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const movie = pgTable('movie', {
	id: serial('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	posterPath: text('poster_path'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const movieRelations = relations(movie, ({ one }) => ({
	user: one(user, {
		fields: [movie.userId],
		references: [user.id]
	})
}));

export * from './auth.schema';
