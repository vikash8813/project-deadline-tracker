# Project Deadline Tracker

A small full-stack app for tracking client projects, their deadlines, budgets and statuses.

## 1. How to Run Locally

**Requirements:** Node.js 20 or newer.

```bash
npm install        # installs the tool that runs server and client together
npm run setup      # installs the server and client dependencies
npm run dev        # starts both
```

Then open **http://localhost:5173/projects**.

- The API runs on `http://localhost:4000` and the frontend on `http://localhost:5173`.
- **Environment variables:** none are required. `PORT` (default `4000`) can change the API port; if you change it, update the proxy target in `client/vite.config.js` to match.
- **Database:** SQLite, stored in `server/data.sqlite`. The file is created and seeded with the five supplied projects on first start, so there is nothing to install or configure. Delete the file to reset the data.
- **Deployment:** Vercel serves the React build and API functions. Production uses Neon Postgres through Vercel's `DATABASE_URL`; local development continues to use SQLite with no credentials.

**What you should see on first load**

| Project | What it demonstrates |
|---|---|
| Internal HR Dashboard | **Overdue** badge and red stripe (deadline 30 Sep 2026 has passed) |
| Brand Identity for Startup | Spent equals budget, so it is **not** over budget; completed, so it is **not** overdue |
| Mobile App for Fitness Tracking | **Over budget** badge (becomes overdue too after 20 Nov 2026) |
| E-Commerce Website Redesign | A normal active project |
| Portfolio Website | Shows "No deadline", is never overdue, and has an **Over budget** badge |

**Edge-case decisions**

- **Exact budget limit:** a project with `spentAmount` equal to `budget` is **within budget**. Only spending that exceeds the budget is flagged, because spending all of the planned money is the plan working, not a problem.
- **No deadline:** shown as "No deadline" and never treated as overdue.
- **Completed projects:** a completed project is not marked overdue even if its deadline has passed, because nothing is late once the work is delivered.
- **Due today:** a project is overdue only after its deadline day has fully ended.
- **Empty filter results:** a filter with no matches shows a message such as `No projects with the status "On hold".`
- **Server validation errors:** the form does no validation of its own, so every rule lives in one place (the server), and the form shows the server's message at the top and under each rejected field. To try it, submit the form empty or with a negative budget.

**API**

| Method | Path | Result |
|---|---|---|
| GET | `/api/projects` | All projects. Optional `?status=active`. An unknown status returns 400. |
| POST | `/api/projects` | Creates a project (201). Invalid input returns 400 with `{ error, details }`. |
| PATCH | `/api/projects/:id/status` | Updates the status. Invalid status returns 400, unknown id returns 404. |

## 2. Stack Choice

- **Backend:** Node.js with Express
- **Database:** SQLite locally (through `better-sqlite3`) and Neon Postgres on Vercel
- **Frontend:** React with Vite and React Router, styled with plain CSS

I chose Express and React because I am comfortable with them and they keep a three-endpoint app small and readable. I chose SQLite because it gives real persistence in a single file, so the app runs locally with no database server to install and no connection string to configure.

## 3. Decision 1 — Tasks Model

**Option B:** I would create a separate Task collection linked by `projectId`, because tasks can then be added, updated, filtered and paginated on their own without loading or rewriting the whole project, and the project record does not keep growing as tasks are added.

## 4. Decision 2 — Sort Order

I sort by deadline with the nearest first (projects without a deadline go last), because the purpose of a deadline tracker is to show what needs attention soonest, which creation date does not tell you.

## 5. Bug Hunt

```js
function isOverdue(project) {
  return new Date(project.deadline) < new Date();
}
```

**Bug 1 — Timezone handling.** A date-only string such as `"2026-12-15"` is parsed as midnight **UTC**, while `new Date()` is the current moment, so the two sides are not the same kind of value. In India (UTC+5:30) a project due today is marked overdue from 5:30 AM on its deadline day, when the day has not ended, and in timezones behind UTC it is marked overdue the evening before.

**Bug 2 — Missing data handling.** When the deadline is `null`, `new Date(null)` becomes 1 January 1970, so a project with no deadline is always reported as overdue. When the deadline is `undefined` or an invalid string, the result is `Invalid Date`, every comparison with it is `false`, and the function silently reports "not overdue" instead of signalling bad data.

## 6. AI Usage

**Tools used:** Claude Code (Anthropic's Claude) and OpenAI Codex/ChatGPT.

**What I asked it to generate**

- A plan based on the assessment brief, including a stack recommendation and the edge-case decisions.
- The Express server: database setup and seeding, validation, and the three endpoints.
- The React frontend: the projects page, list, status filter, add-project form and CSS.
- A first draft of this README.
- A final requirement-by-requirement audit, production deployment adaptation for Vercel and Neon Postgres, and submission-readiness checks.

**What was reviewed and verified**

- Every endpoint was called with valid and invalid input and the status codes checked: 200 and 201 for valid requests, 400 for a missing title, an invalid status, a negative or non-numeric amount, an impossible date (`2026-02-30`) and malformed JSON, and 404 for an unknown project id.
- The overdue and over-budget rules were checked against the edge cases: no deadline, a deadline that is today, a completed project with a past deadline, and spending exactly equal to the budget.
- The seed data was compared against the brief to confirm it is unchanged.
- I read through each file to make sure I understand it and can explain it, and I made the edge-case and technical decisions described above myself rather than accepting defaults.
