// Routes calling go here

const express = require("express");
const app = express();
const corsMiddleware = require("./middlewares/corseMiddleware.js");
const ipMiddleware = require("./middlewares/ipMiddleware.js");

// Imported Routes
const healthRoute = require("./routes/healthRoute.js");
const authRoute = require("./routes/authRoute.js");
const secretRoute = require("./routes/getSecretRoute.js");
const ghlRoute = require("./routes/ghlRoute.js");
const userRoute = require("./routes/userRoute.js");

// MIDDLEWARES
app.use(corsMiddleware);
app.use(ipMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/", healthRoute);
app.use("/auth", authRoute);
app.use("/auth", secretRoute);
app.use("/admin", userRoute);
app.use("/ghl", ghlRoute);

//LOCAL SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
