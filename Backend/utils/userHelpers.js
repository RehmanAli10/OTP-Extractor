// utils/userHelpers.js
const fs = require("fs");
const path = require("path");
const cache = require("./userCache");

const usersFilePath = path.join(__dirname, "../user.json");

const CACHE_KEY = "users_data";
const CACHE_TTL = 180000; // 3 minutes

// ✅ Read users.json (with cache support)
function readUsers() {
  try {
    const cachedUsers = cache.get(CACHE_KEY);
    if (cachedUsers) return cachedUsers;

    if (!fs.existsSync(usersFilePath)) {
      const emptyUsers = { users: {} };
      fs.writeFileSync(usersFilePath, JSON.stringify(emptyUsers, null, 2));
      cache.set(CACHE_KEY, emptyUsers, CACHE_TTL);
      return emptyUsers;
    }

    const data = fs.readFileSync(usersFilePath, "utf8");
    const users = JSON.parse(data);

    cache.set(CACHE_KEY, users, CACHE_TTL);
    return users;
  } catch (error) {
    console.error("❌ Error reading users file:", error);
    return { users: {} };
  }
}

// ✅ Write users.json (with cache update)
function writeUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    cache.set(CACHE_KEY, users, CACHE_TTL);
    return true;
  } catch (error) {
    console.error("❌ Error writing users file:", error);
    return false;
  }
}

// ✅ Get specific user by email
function getUserByEmail(email) {
  try {
    const users = readUsers();
    return users.users[email] || null;
  } catch (error) {
    console.error("❌ Error getting user by email:", error);
    return null;
  }
}

// ✅ Check if user exists
function userExists(email) {
  try {
    const users = readUsers();
    return !!users.users[email];
  } catch (error) {
    console.error("❌ Error checking if user exists:", error);
    return false;
  }
}

// ✅ Invalidate cache
function invalidateUsersCache() {
  cache.delete(CACHE_KEY);
}

// ✅ Cache diagnostics (moved here from controller)
function getCacheDiagnostics(iterations = 100, action = null) {
  try {
    if (action === "clear") cache.clear();
    else if (action === "refresh") cache.delete(CACHE_KEY);

    // Performance test
    const fileStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      if (fs.existsSync(usersFilePath))
        JSON.parse(fs.readFileSync(usersFilePath));
    }
    const fileTime = Date.now() - fileStart;

    const cacheStart = Date.now();
    for (let i = 0; i < iterations; i++) cache.get(CACHE_KEY);
    const cacheTime = Date.now() - cacheStart;

    const cached = cache.get(CACHE_KEY);
    const fileData = fs.existsSync(usersFilePath)
      ? JSON.parse(fs.readFileSync(usersFilePath))
      : { users: {} };

    return {
      performance: {
        fileTime: `${fileTime}ms`,
        cacheTime: `${cacheTime}ms`,
        speedup: `${(((fileTime - cacheTime) / fileTime) * 100).toFixed(
          0
        )}% faster`,
      },
      data: {
        cacheUsers: cached ? Object.keys(cached.users || {}).length : 0,
        fileUsers: Object.keys(fileData.users || {}).length,
        matches: JSON.stringify(cached) === JSON.stringify(fileData),
      },
      cache: {
        size: cache.cache.size,
        hasUsers: !!cached,
      },
      ...(action && { action: `${action} completed` }),
    };
  } catch (error) {
    return { error: error.message };
  }
}

module.exports = {
  readUsers,
  writeUsers,
  getUserByEmail,
  userExists,
  invalidateUsersCache,
  getCacheDiagnostics,
};
