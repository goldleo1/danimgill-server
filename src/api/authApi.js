const express = require("express");
const router = express.Router();
const uuid = require("uuid");
const db = require("../db");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!(await db.existUsername(username)))
    return res.json({
      status: "fail",
      msg: "username or password is invalid",
    });

  const user = await db.loginUser(username, password);

  if (user.username) {
    req.session.user = {
      id: user._id,
      admin: false,
      username: user.username,
    };

    return res.json({
      status: "success",
      msg: "login successed",
    });
  } else {
    return res.json({
      status: "fail",
      msg: "username or password is invalid",
    });
  }
});

router.post("/logout", async (req, res) => {
  req.session.user = {};

  return res.json({
    status: "success",
    msg: "logout successed",
  });
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (await db.existUsername(username))
    return res.json({
      status: "fail",
      msg: "user already exists",
    });

  try {
    await db.createUser(username, password);
    return res.json({
      status: "success",
      msg: "register successed",
    });
  } catch (e) {
    console.log("[error]", e);
    return res.json({
      status: "fail",
      msg: "register failed with some issues",
    });
  }
});

module.exports = router;
