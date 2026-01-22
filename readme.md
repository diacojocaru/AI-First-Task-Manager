 AI-First Task Manager

Overview
This project implements a small AI-first task manager where:
- A Custom GPT is the primary user interface (natural language).
- Google Sheets is the single source of truth.
- Google Apps Script exposes HTTP endpoints used by GPT for CRUD operations and task ranking.

The goal is to ship a minimal, explainable, and deterministic vertical slice.

---

Architecture

User -> Custom GPT -> Google Apps Script Web App -> Google Sheets

- GPT never stores task state.
- All reads and writes go through HTTP endpoints.
- Google Sheets provides auditable persistence.

---

Data Model (Google Sheets)

Sheet: `Tasks`

| Column | Description |
|------|------------|
| id | UUID |
| title | Task title |
| status | active / completed / snoozed |
| priority | Integer (1–5) |
| start_at | ISO datetime |
| due_at | ISO datetime |
| snoozed_until | ISO datetime |
| created_at | ISO datetime |
| completed_at | ISO datetime |

Sheet: `Logs`  
Used for basic observability (timestamp, action, payload).

---

API Endpoints (GAS Web App)

All requests are POSTed to `/exec` with a `path` field.

- `task/create`
- `task/update`
- `task/complete`
- `task/snooze`
- `task/next`

Errors return JSON with an error message.

---

"Best Task Right Now" Logic

Filtering:
- status must be `active`
- start_at <= now
- snoozed_until <= now

Scoring:
- priority * 10
- +20 if due within 4h
- +10 if due within 24h
- +5 if due within 72h

Sorting:
1. Highest score
2. Earliest due date
3. Oldest created task

This logic is deterministic and explainable.

---

Time & Locale
- All timestamps use ISO 8601.
- Local timezone: Europe/Bucharest.
- Natural language like "tomorrow morning" is interpreted as 09:00 local time.

---

Idempotency
- Completing an already completed task is a no-op.
- Updates are safe to retry.

---

Observability
- All operations are logged in the `Logs` sheet.
- Used for debugging and traceability.

---

Security (Production Notes)
Authentication is intentionally out of scope.
In production, this would be secured using:
- Per-user auth (OAuth)
- User-specific spreadsheets
- Signed requests / API gateway

---

How to Run
1. Open the Custom GPT. (see Instr. 1)
2. Use natural language to manage tasks.
3. All state changes are reflected live in Google Sheets.


Instructions on how to configure Custom GPT: 
https://github.com/diacojocaru/AI-First-Task-Manager/blob/main/GPTconfiguration.md




