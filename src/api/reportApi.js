const express = require("express");
const router = express.Router();
const Reports = require("../models/report");
const { isAdmin } = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const downloadPath = path.join(process.cwd(), "downloads");
function downloadImage(uuid, ext) {
  axios({
    url: `http://${process.env.INTERNAL_HOST}:${process.env.INTERNAL_PORT}/download?uuid=${uuid}`,
    responseType: "stream",
  })
    .then((response) => {
      response.data
        .pipe(fs.createWriteStream(path.join(downloadPath, `${uuid}.${ext}`)))
        .on("finish", () => {
          console.log("Image saved successfully.");
        })
        .on("error", (err) => {
          console.error("Error saving image:", err);
        });
    })
    .catch((err) => {
      console.error("Error downloading image:", err);
    });
}

async function uploadImage(filePath, uuid) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath)); // filePath는 이미지 파일의 경로입니다.

  try {
    // Axios POST 요청 보내기
    const response = await axios.post(
      `http://${process.env.INTERNAL_HOST}:${process.env.INTERNAL_PORT}/public?uuid=${uuid}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(), // FormData의 헤더 설정
        },
      }
    );
    const data = response.data;
    console.log("이미지 업로드 성공:", response.data);
    Reports.findOneAndUpdate({ id: uuid }, { detected_result: data.result });
    const ext = path.extname(data.filename).slice(1);
    downloadImage(uuid, ext);
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
  }
}
const uploadMiddleware = require("../middleware/uploadMiddleware");

router.get("/list", (req, res) => {
  const { limit = 20 } = req.query; // admin is secure user, so no sqli firewall

  if (Number.isNaN(limit) || !Number.isInteger(limit))
    return res.json({ err: "fail", result: "" });

  if (req.session.user.admin) {
    Reports.find({}, null, { limit: limit })
      .then((reports) => {
        return res.json({ err: null, result: reports });
      })
      .catch((err) => {
        console.log(err);
        return res.json({ err: "fail", result: "" });
      });
  } else {
    Reports.find(
      {
        _authorId: req.session.user.id,
      },
      null,
      { limit: limit, virtuals: true }
    )
      .then((reports) => {
        return res.json({ err: null, result: reports });
      })
      .catch((err) => {
        console.log(err);
        return res.json({ err: "fail", result: "" });
      });
  }
});

router.post(
  "/add",
  [
    body("location", "You must set location").notEmpty(),
    body("type", "You must set type").notEmpty(),
  ],
  uploadMiddleware.single("file"),
  (req, res) => {
    const { date = new Date(), location, description = "", type } = req.body;

    const saved_path = req.file.path;
    const saved_filaname = req.file.filename;

    Reports.init();
    const report = new Reports({
      date: date,
      type: type,
      location: location,
      status: 1,
      description: description,
      _authorId: req.session.user.id,
      image: saved_filaname,
    });

    report
      .save()
      .then((report) => {
        // TODO - refactoring
        uploadImage(saved_path, report.id);
        return res.json({ err: null, result: "success" });
      })
      .catch((err) => {
        console.log(err);
        return res.json({ err: "fail", result: "" });
      });
  }
);

router.get("/view", (req, res) => {
  const { id } = req.query;

  Reports.findOne({
    id: id,
    _authorId: req.session.user.admin
      ? { $or: true }
      : req.session.user.username,
  })
    .then((report) => {
      return res.json({ err: null, result: report });
    })
    .catch((e) => {
      return res.json({ err: "fail", result: "error" });
    });
});

router.post("/edit", async (req, res) => {
  const { id, description } = req.body;

  Reports.findOneAndUpdate(
    {
      id: id,
      _authorId: req.session.user.username,
    },
    description ? { description } : {}
  )
    .then((report) => {
      return res.json({ err: null, result: "success" });
    })
    .catch((e) => {
      return res.json({ err: "fail", result: "error" });
    });
});

router.post("/changeStatus", isAdmin, (req, res) => {
  const { id, status_num } = req.body;

  Reports.findOneAndUpdate(
    {
      _id: id,
    },
    {
      status: Number(status_num),
    }
  )
    .then((report) => {
      return res.json({ err: null, result: "success" });
    })
    .catch((e) => {
      return res.json({ err: "fail", result: "error" });
    });
});

router.post("/clear", isAdmin, (req, res) => {
  Reports.deleteMany({})
    .then((_) => {
      return res.json({ err: null, result: "success" });
    })
    .catch((e) => {
      return res.json({ err: "fail", result: "error" });
    });
});

module.exports = router;
