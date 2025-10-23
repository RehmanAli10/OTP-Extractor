const cors = require("cors");

const corsMiddleware = cors({
  origin: "https://otpsharingapp.vercel.app/",
});

module.exports = corsMiddleware;
