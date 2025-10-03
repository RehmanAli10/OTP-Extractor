const crypto = require("crypto");

function safeCompare(a, b) {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");

    if (bufA.length !== bufB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

module.exports = function sharedKeyAuth(req, res, next) {
  const encodedToken = req.get("x-app-key");

  if (!encodedToken) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: missing app key",
    });
  }

  const envKey = process.env.SHARED_KEY;

  if (!envKey) {
    console.error("SHARED_KEY not configured");
    return res.status(500).json({
      success: false,
      message: "Server configuration error",
    });
  }

  try {
    const decodedToken = Buffer.from(encodedToken, "base64").toString("utf8");
    if (!safeCompare(decodedToken, envKey)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: invalid app key",
      });
    }

    req.sharedAuth = { authenticated: true };
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid token format",
    });
  }
};
