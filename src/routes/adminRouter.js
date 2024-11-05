const express = require("express");
const path = require("path");
const router = express.Router();
const db = require("../db");

const { isAdmin } = require("../middleware/authMiddleware");

router.get("/login", (req, res) => {
  res.sendFile(path.join(process.view, "admin/login.html"));
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!(await db.existUsername(username)))
    return res.sendFile(path.join(process.view, "admin/login.html"));

  const user = await db.loginUser(username, password);

  if (user && user.admin) {
    req.session.user = {
      id: user._id,
      admin: user.admin,
      username: user.username,
    };

    return res.redirect(302, "/admin");
  } else {
    return res.sendFile(path.join(process.view, "admin/login.html"));
  }
});

router.get("/", isAdmin, (req, res, next) => {
  res.sendFile(path.join(process.view, "admin/index.html"));
});

module.exports = router;
