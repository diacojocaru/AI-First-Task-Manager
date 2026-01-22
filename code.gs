function getTasksSheet() {
  return SpreadsheetApp.getActive().getSheetByName("Tasks");
}

function getLogsSheet() {
  return SpreadsheetApp.getActive().getSheetByName("Logs");
}

function logAction(action, payload) {
  getLogsSheet().appendRow([
    new Date().toISOString(),
    action,
    JSON.stringify(payload)
  ]);
}

function uuid() {
  return Utilities.getUuid();
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const path = body.path;

  try {
    switch (path) {
      case "task/create":
        return json(createTask(body));
      case "task/update":
        return json(updateTask(body));
      case "task/complete":
        return json(completeTask(body));
      case "task/snooze":
        return json(snoozeTask(body));
      case "task/next":
        return json(getNextTask(body));
      default:
        return json({ error: "Unknown path" }, 400);
    }
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

function json(obj, code = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function createTask(data) {
  const sheet = getTasksSheet();
  const id = uuid();
  const now = new Date().toISOString();

  sheet.appendRow([
    id,
    data.title,
    "active",
    data.priority || 3,
    data.start_at || now,
    data.due_at || "",
    "",
    now,
    ""
  ]);

  logAction("create", { id, title: data.title });
  return { id, status: "active" };
}

function updateTask(data) {
  const sheet = getTasksSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      const headers = rows[0];
      Object.keys(data.fields).forEach(key => {
        const col = headers.indexOf(key);
        if (col !== -1) {
          sheet.getRange(i + 1, col + 1).setValue(data.fields[key]);
        }
      });
      logAction("update", data);
      return { ok: true };
    }
  }
  throw new Error("Task not found");
}

function completeTask(data) {
  const sheet = getTasksSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      if (rows[i][2] === "completed") {
        return { ok: true, alreadyCompleted: true };
      }
      sheet.getRange(i + 1, 3).setValue("completed");
      sheet.getRange(i + 1, 9).setValue(new Date().toISOString());
      logAction("complete", data);
      return { ok: true };
    }
  }
  throw new Error("Task not found");
}

function snoozeTask(data) {
  const sheet = getTasksSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      sheet.getRange(i + 1, 3).setValue("snoozed");
      sheet.getRange(i + 1, 7).setValue(data.until);
      logAction("snooze", data);
      return { ok: true };
    }
  }
  throw new Error("Task not found");
}

function getNextTask(data) {
  const now = new Date(data.now);
  const rows = getTasksSheet().getDataRange().getValues();
  let best = null;
  let bestScore = -1;

  for (let i = 1; i < rows.length; i++) {
    const [
      id, title, status, priority,
      startAt, dueAt, snoozedUntil
    ] = rows[i];

    if (status !== "active") continue;
    if (startAt && new Date(startAt) > now) continue;
    if (snoozedUntil && new Date(snoozedUntil) > now) continue;

    let urgency = 0;
    if (dueAt) {
      const diffHrs = (new Date(dueAt) - now) / 36e5;
      if (diffHrs <= 4) urgency = 20;
      else if (diffHrs <= 24) urgency = 10;
      else if (diffHrs <= 72) urgency = 5;
    }

    const score = priority * 10 + urgency;

    if (score > bestScore) {
      bestScore = score;
      best = { id, title, score };
    }
  }

  logAction("next", best);
  return best || { message: "No active tasks" };
}

