# Watchlist

A minimal app to log movies you want to watch. Built with SvelteKit, Drizzle, and Better Auth.

- **Login / register** at `/login`
- **Watchlist** at `/` (add movies by title, sign out)

## Database migrations

We use **migrations only** (never `db:push`), including for local dev, because the app connects to the live database. Pushing would change the live schema directly and skip migration history.

### Applying schema changes (run these yourself)

**1. Generate a migration**

From the project root, with `DATABASE_URL` available (e.g. in `.env`):

```sh
pnpm run db:generate
```

- If Drizzle asks for a **migration name**, type a short slug (e.g. `add_movie_table`) and press Enter. If you don’t care about the name, you can press Enter to accept the default.
- If it asks about **renames** (e.g. “table X was removed and table Y was added – is this a rename?”), choose **No** so it generates a drop and a create instead of renaming. That keeps the migration correct for “drop task, add movie” style changes.

Generated files will appear under `drizzle/` (e.g. a new folder with `migration.sql` and `snapshot.json`).

**2. Review the SQL**

Open the new `drizzle/<folder>/migration.sql` and confirm it does what you expect (e.g. `DROP TABLE "task"`, `CREATE TABLE "movie"`). Fix the schema in `src/lib/server/db/schema.ts` and run `db:generate` again if needed.

**3. Apply the migration**

When the SQL looks good:

```sh
pnpm run db:migrate
```

- This connects to the database using `DATABASE_URL` and runs any migrations that haven’t been applied yet. There is no confirmation prompt; it just runs. So reviewing the SQL in step 2 is important.

Applied migrations are recorded in the `__drizzle_migrations` table in your database.

---

## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
