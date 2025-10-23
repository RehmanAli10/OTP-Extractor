const cors = require("cors");
require("dotenv").config();

const corsMiddleware = cors({
  origin: function (origin, callback) {
    if (origin === process.env.CORS_URL) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
});

module.exports = corsMiddleware;
