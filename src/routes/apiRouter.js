const express = require("express");
const router = express.Router();

const { isLogined } = require("../middleware/authMiddleware");

const authApi = require("../api/authApi");
const reportApi = require("../api/reportApi");

router.use("/auth", authApi);
router.use("/report", isLogined, reportApi);

module.exports = router;
