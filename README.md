<img width="1357" height="704" alt="Image" src="https://github.com/user-attachments/assets/036f60c1-ee57-411a-b1ed-ef3a8800a939" />
<img width="1357" height="701" alt="Image" src="https://github.com/user-attachments/assets/940d63cb-2ab5-4004-ae73-185ff3bd472c" />
<img width="1355" height="699" alt="Image" src="https://github.com/user-attachments/assets/aef1cf70-5228-471d-9191-a1c8594bf060" />
<img width="1355" height="700" alt="Image" src="https://github.com/user-attachments/assets/9bb5f1d1-752c-47e8-a7af-97f215a4c271" />
<img width="1356" height="699" alt="Image" src="https://github.com/user-attachments/assets/715089cd-e5e1-4509-b45d-c6bc1c2eebc3" />
<img width="1355" height="702" alt="Image" src="https://github.com/user-attachments/assets/e7ee2a72-dbff-4fac-b3e3-3f3c93059405" />
<img width="1355" height="701" alt="Image" src="https://github.com/user-attachments/assets/079bbde2-aea3-46d6-8a05-b4e2a7d6948d" />
<img width="1355" height="701" alt="Image" src="https://github.com/user-attachments/assets/393f681b-6e10-4382-a261-dc7a7b96d630" />
<img width="1355" height="699" alt="Image" src="https://github.com/user-attachments/assets/26b6707d-9b18-47c3-b6da-42a3c25a680d" />

This is a [Next.js](https://nextjs.org) app that uses Clerk (auth), Drizzle ORM, Postgres, Hume, Arcjet, and Google Gemini.

## Quick start (Windows, cmd.exe)

Prereqs:
- Node.js 20+ and npm
- Docker Desktop running (for local Postgres)
- A Clerk application (Publishable + Secret keys)
- Optional: Arcjet key, Hume keys, Gemini key if you want those features locally

1) Copy environment template and fill values

```bat
copy .env.example .env.local
```

Edit `.env.local` and set at least:
- DB_HOST=localhost, DB_PORT=5432, DB_USER=postgres, DB_PASSWORD=yourpassword, DB_NAME=job_board
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
- (optional) ARCJET_KEY, HUME_API_KEY, HUME_SECRET_KEY, NEXT_PUBLIC_HUME_CONFIG_ID, GEMINI_API_KEY

2) Start Postgres via Docker

```bat
docker compose up -d
```

This uses `docker-compose.yml` and reads DB_* from your `.env.local`.

3) Install dependencies

```bat
npm install
```

4) Generate and run database migrations (Drizzle)

```bat
npm run db:generate
npm run db:push
```

If you prefer applying SQL migrations:

```bat
npm run db:migrate
```

5) Run the dev server

```bat
npm run dev
```

Open http://localhost:3000

Sign-in routes are configured under `/sign-in` and app pages under `/app`.

## Notes

- Middleware uses Arcjet and Clerk. If `ARCJET_KEY` or Clerk keys are missing, requests may be blocked or auth will fail.
- Webhooks: the Clerk webhook endpoint is at `POST /api/webhooks/clerk`. For local testing, configure a Clerk webhook and tunnel (e.g., `ngrok`) or disable webhooks while developing UI.
- Database config is built from DB_* variables to `DATABASE_URL` internally via `src/data/env/server.ts`.

## Scripts

- `npm run dev` — start Next.js dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — start built app
- `npm run db:generate` — generate Drizzle SQL
- `npm run db:push` — push schema to DB
- `npm run db:migrate` — run migrations
- `npm run db:studio` — Drizzle Studio

## Troubleshooting

- Port 5432 busy: stop other Postgres instances or change `DB_PORT` and the published port mapping in `docker-compose.yml`.
- Auth redirect loops: Ensure public routes in `src/middleware.ts` match your local paths and Clerk keys are valid.
- Env validation errors: Both `src/data/env/client.ts` and `server.ts` validate required variables. Check `.env.local`.
