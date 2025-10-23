const cors = require("cors");
require("dotenv").config();

const corsMiddleware = cors({
  origin: process.env.CORS_URL,
});

module.exports = corsMiddleware;
