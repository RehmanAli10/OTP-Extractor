// utils/logger.js
const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "../logs");
const logFile = path.join(logsDir, "logs.json");

// ✅ Ensure logs directory exists
function ensureLogsDirectory() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// ✅ Initialize log file if missing
function initializeLogFile() {
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, JSON.stringify([], null, 2));
  }
}

// ✅ Append log entry
async function appendLog(data) {
  try {
    ensureLogsDirectory();
    initializeLogFile();

    let logs = [];
    if (fs.existsSync(logFile)) {
      const fileContent = fs.readFileSync(logFile, "utf8");
      try {
        logs = JSON.parse(fileContent);
        if (!Array.isArray(logs)) logs = [];
      } catch (e) {
        logs = [];
      }
    }

    // Before adding logs cleanup
    logs = cleanupOldLogs(logs);

    logs.push({
      timestamp: new Date().toISOString(),
      ...data,
    });

    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error("❌ Failed to write log:", error);
  }
}

// ✅ Log specific actions
async function logRegister(email, status, reason, meta = {}) {
  await appendLog({ action: "register", email, status, reason, meta });
}

async function logLogin(email, status, reason, meta = {}) {
  await appendLog({ action: "login", email, status, reason, meta });
}

async function logVerifyTotp(email, status, reason, meta = {}) {
  await appendLog({ action: "verify-totp", email, status, reason, meta });
}

// ✅ Read all logs
async function getLogs() {
  try {
    if (fs.existsSync(logFile)) {
      const fileContent = fs.readFileSync(logFile, "utf8");
      let logs = JSON.parse(fileContent);
      logs = cleanupOldLogs(logs);
      return logs;
    }
    return [];
  } catch (error) {
    console.error("❌ Failed to read logs:", error);
    return [];
  }
}

// Clean up logs
function cleanupOldLogs(logs) {
  const cutoff = Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  return logs.filter((log) => {
    if (!log.timestamp) return false;

    const logTime = Date.parse(log.timestamp);

    if (isNaN(logTime)) return false;

    return logTime >= cutoff;
  });
}

// ✅ Clear all logs
async function clearLogs() {
  try {
    fs.writeFileSync(logFile, JSON.stringify([], null, 2));
  } catch (error) {
    console.error("❌ Failed to clear logs:", error);
  }
}

module.exports = {
  logRegister,
  logLogin,
  logVerifyTotp,
  getLogs,
  clearLogs,
};
