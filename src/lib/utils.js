const path = require("path");
const fs = require("fs");

const imagePath = path.join(process.cwd(), "downloads");
function downloadImage(uuid) {
  axios({
    url: `http://${process.env.INTERNAL_HOST}:${process.env.INTERNAL_PORT}/download?uuid=${uuid}`,
    responseType: "stream",
  })
    .then((response) => {
      response.data
        .pipe(fs.createWriteStream(imagePath))
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

module.exports = { downloadImage };
