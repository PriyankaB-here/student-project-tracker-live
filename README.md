# Student Project Tracker — Cloud Variant

A hands-on web app development project for tracking student project ideas.

## Technologies
- HTML, CSS, JavaScript
- Node.js and Express
- Vercel for hosting
- Supabase PostgreSQL for database storage

## Live Application
https://student-project-tracker-live-gt4dv3mn6-priyanka-3426.vercel.app/

## Run Locally

1. Install Node.js 22.x.
2. Clone this repository and open its folder in the terminal.
3. Install dependencies:

   ```powershell
   npm.cmd ci
   ```

4. Copy `.env.example` to `.env`.
5. Add your own Supabase Transaction Pooler connection string to `.env`:

   ```text
   DATABASE_URL=your_private_connection_string
   ```

6. Start the application:

   ```powershell
   npm.cmd start
   ```

7. Open http://localhost:3000.

## Database Setup
- Run `schema.sql` in the Supabase SQL Editor to create the `projects` table.
- The table contains `id`, `name`, and `status` columns.
- Set `DATABASE_URL` in `.env` locally and in Vercel's environment variables.
- Never commit `.env` or expose database credentials in frontend code.
- Existing SQLite records are not migrated automatically.

## Demo and Security
This is a shared demo application with no sign-in system. Visitors can use shared project routes, so use synthetic test records only. Anyone running their own copy must configure their own Supabase database and hosting environment.

## Verification
The deployed application was tested for project persistence after refreshing the page.