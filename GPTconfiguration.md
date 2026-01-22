Step-by-step instructions to configure the Custom GPT

These instructions describe how to recreate the Custom GPT used in this demo.
No private URLs or credentials are required.

Step 1 - Create a Custom GPT

Open ChatGPT.

Navigate to Explore GPTs -> Create or go straight to https://chatgpt.com/gpts/editor

Choose Create a GPT.


Step 2 - Basic Configuration
Name
AI-First Task Manager

Description
Manage tasks using natural language. Tasks are stored in Google Sheets.


Step 3 — System Instructions

Paste the following text into the Instructions field:

You are an AI-first task manager.

Rules:
- You NEVER store tasks in memory.
- Google Sheets is the single source of truth.
- You MUST call the provided HTTP tool for every read or write.
- You translate natural-language intent into deterministic API calls.
- You explain decisions briefly and clearly.

Behavior:
- When the user asks “what should I work on now?”, call the task/next endpoint.
- When the user asks to create a task, call the task/create endpoint.
- When the user asks to complete or snooze a task, infer the task ID from the most recently retrieved task or ask a clarification only if necessary.
- Always use ISO 8601 timestamps.
- Assume a fixed local timezone (e.g., Europe/Bucharest).

Never hallucinate task data.


Step 4 — Enable Actions

Go to the Actions section.

Click Create new action.

Select OpenAPI schema.


Step 5 — Define the OpenAPI Schema

Paste the following schema and replace BASE_URL with the URL of the deployed Google Apps Script Web App:

openapi: 3.1.0
info:
  title: AI First Task Manager API
  version: 1.0.0
servers:
  - url: BASE_URL
paths:
  /exec:
    post:
      operationId: callTaskManager
      summary: Call task manager backend
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                path:
                  type: string
                  enum:
                    - task/create
                    - task/update
                    - task/complete
                    - task/snooze
                    - task/next
                title:
                  type: string
                priority:
                  type: number
                start_at:
                  type: string
                due_at:
                  type: string
                until:
                  type: string
                id:
                  type: string
                fields:
                  type: object
                now:
                  type: string
                locale:
                  type: string
      responses:
        "200":
          description: OK


    or paste directly:


    openapi: 3.1.0
info:
  title: AI First Task Manager API
  version: 1.0.0
servers:
  - url: https://script.google.com/macros/s/AKfycbziYtasIOzjxl8L1K037HcMu2bGT5lbIQJII0dCRprwWOedh-4SUxaIl5vwAVbV5Q4ozQ
paths:
  /exec:
    post:
      operationId: callTaskManager
      summary: Call task manager backend
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                path:
                  type: string
                  enum:
                    - task/create
                    - task/update
                    - task/complete
                    - task/snooze
                    - task/next
                title:
                  type: string
                priority:
                  type: number
                start_at:
                  type: string
                due_at:
                  type: string
                until:
                  type: string
                id:
                  type: string
                fields:
                  type: object
                now:
                  type: string
                locale:
                  type: string
      responses:
        "200":
          description: OK



Step 6 — Authentication

In the Authentication section, select:

None

This ensures the demo does not require credentials, as required by the brief.



Step 7 — Save the GPT

Click Save.

The Custom GPT is now ready to use.


Step 8 — Expected Behavior

Once configured, the GPT should:

Use natural language as the primary interface.

Call the backend for every task read or mutation.

Reflect all changes live in Google Sheets.

Resolve ambiguous inputs explicitly and consistently.

Produce deterministic and explainable outputs.

Notes on Scope and Security

This configuration is intended for demonstration purposes only.

Authentication and per-user data isolation are intentionally out of scope.

In production, proper authorization and access control would be required.


Why this approach is used

Providing reproducible configuration instructions ensures:

Transparency

Auditability

Ease of evaluation

No dependency on private or temporary URLs


Prompts to type to GPT:

1️. Get the next task
What should I work on now?

2️. Complete the selected task
Mark this task complete.

3️. Snooze the task
Snooze this until tomorrow morning.

4️. Ambiguous request (required)
Finish the report later.

5️. Create a task with time constraints (optional but good)
Create a task called "Review pull request" with medium priority starting tomorrow morning.

(Optional) Extra clarity test
What should I work on now?
