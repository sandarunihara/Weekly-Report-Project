# WeeklyPulse

WeeklyPulse is a full-stack weekly report and team dashboard application.
Team members create structured reports, submit them for review, respond to correction requests, and track report history. Managers review reports, monitor compliance, and analyze team workload.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Recharts
- Backend: Spring Boot, Spring Security, JWT, Spring Data JPA
- Database: PostgreSQL
- AI assistant: Groq-compatible chat completions API

## Requirements

- Node.js 20 or newer
- Java 17 or newer
- PostgreSQL 14 or newer

## Database setup

Create a PostgreSQL database named `weekly_report_db` and a user with permission to access it.

```sql
CREATE DATABASE weekly_report_db;
```

The backend uses Hibernate `ddl-auto=update` for local development. Production deployments should use migrations instead.

## Backend setup

Set these environment variables before starting the backend:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/weekly_report_db"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your-database-password"
$env:JWT_SECRET="a-long-random-secret-at-least-32-characters"
$env:GROQ_API_KEY="your-groq-api-key"
```

Run the backend:

```powershell
cd "Weekly Report Backend"
./mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`.

## Frontend setup

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

For a different backend URL, create `frontend/.env`:

```text
VITE_API_URL=http://localhost:8080/api
```

Production build:

```powershell
npm run build
```

## Seed accounts

The development seed runs only when the users table is empty.

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@company.com | admin123 |
| Manager | manager@company.com | manager123 |
| Team member | alice@company.com | password123 |
| Team member | bob@company.com | password123 |
| Team member | carol@company.com | password123 |
| Team member | derek@company.com | password123 |
| Team member | elena@company.com | password123 |

Change or remove these credentials before any public deployment.

## Main workflows

1. Register or sign in as a team member.
2. Create and save a weekly report as a draft.
3. Submit the report for manager review.
4. Sign in as a manager and request changes with a comment.
5. Edit and resubmit the same report as the team member.
6. Approve the report as the manager.
7. Open report history to inspect versions and review actions.

## API areas

- `/api/auth`: registration and login
- `/api/reports`: report creation, editing, submission, review, versions, and history
- `/api/dashboard`: manager summaries, filters, charts, activity, and comparison
- `/api/projects`: project/category CRUD
- `/api/users`: profiles, user management, roles, and active status
- `/api/ai`: manager-only AI assistant

Report and user list endpoints accept `page` and `size` query parameters. Manager report endpoints exclude private drafts.

## Tests

```powershell
cd "Weekly Report Backend"
./mvnw.cmd test
```

The test suite includes application startup, report ownership, review-state authorization, and inactive-account authentication tests.

## Security notes

- Passwords are stored with BCrypt.
- API access uses stateless JWT authentication.
- Team members can only read and edit their own reports.
- Managers can review submitted reports but cannot edit report content.
- Draft report content is private to its owner.
- Never commit `.env` files, database passwords, or AI provider keys.

## Submission artifacts

- ER diagram: `database_er_diagram.svg` and `database_er_diagram.md`
- Presentation content: `PRESENTATION_OUTLINE.md`
- Demo walkthrough: `DEMO_SCRIPT.md`

The presentation and demo video must be uploaded to the required shared Google Drive folder before submission.
