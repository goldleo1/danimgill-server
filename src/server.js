const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");

const db = require("./db");
require("dotenv").config();
process.view = path.join(__dirname, "views");
process.root = path.join(__dirname);

const app = express();

app.use(
  compression({
    level: 6,
    threshold: 100 * 1000, // no compression under 100kb
  })
);
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'", "*.fontawesome.com", "http:"],
        "script-src": ["'self'", "*.fontawesome.com"],
        // "style-src": ["'self'", "'unsafe-inline'"],
        // "connect-src": [, "ka-f."],
      },
    },
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: "20mb" }));

app.use("/public", express.static(path.join(process.root, "public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/detect", express.static(path.join(process.cwd(), "downloads")));

app.use(
  expressSession({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true,
  })
);

const adminRouter = require("./routes/adminRouter");
const apiRouter = require("./routes/apiRouter");

app.get("/", (req, res) => {
  res.sendFile(path.join(process.view, "index.html"));
});

app.use("/admin", adminRouter);
app.use("/api/v0", apiRouter);

app.get("/robots.txt", (req, res) => {
  res.send(`User-agent: *
Disallow: /`);
});

app.get("/favicon.ico", (req, res) => {
  res.send("");
});

app.use((req, res) => {
  res.status(404).send("not found");
});

app.listen(process.env.PORT ?? 3000, async (err) => {
  if (err) return console.error(err);

  await db.connect();

  const exist = await db.existUsername(process.env.ADMIN_USERNAME);
  if (!exist) {
    const user = await db.createUser(
      process.env.ADMIN_USERNAME,
      process.env.ADMIN_PASSWORD,
      true
    );

    if (user) console.log("admin account created");
    else console.error("error occured while creating admin account");
  }

  console.log("Server is running on " + process.env.PORT ?? 3000);
});
