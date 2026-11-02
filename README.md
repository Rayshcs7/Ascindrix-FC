# Ascindrix FC

Next.js + TypeScript + Tailwind CSS, with an admin dashboard.

```bash
npm install
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin

## Admin password

Set it in `.env.local`:

```
ADMIN_PASSWORD=your-password
```

Restart the dev server after changing it.

## Where data lives

The admin edits the JSON files in `data/`: matches, players, news and standings.
Uploaded photos are saved in `data/uploads/`.
Back up the whole `data` folder to back up the site's content.

These files need a writable disk, so they work locally and on a normal server (VPS).
These files need a writable disk. They will not save on Vercel, which needs a database instead.

## Running a live match

1. Admin > Fixtures and results > open a match > **Open match centre**.
2. Save the lineup (starters and substitutes, from first team and reserves).
3. Press **Kick off**, then log goals, cards and substitutions as they happen.
4. Press **Half time**, **Start second half** and **Full time**.

The public match page, home page and fixtures list update automatically while a match is live.
Goals set the score for you. Own goals count for the other team.

## Time zone

Match times are shown exactly as you enter them (club local time).
`CLUB_TIMEZONE` in `.env.local` tells the site what "now" is, so a game stops being "next" the moment its kick-off passes.
Default is `Africa/Nairobi`. Use any name from the IANA list, e.g. `Europe/London`.
