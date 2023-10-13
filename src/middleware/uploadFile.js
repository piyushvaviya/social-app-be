const fs = require("fs");
const multer = require("multer");
const path = require("path");

class Uploader {
  constructor(destination = "files") {
    this.storage = multer.diskStorage({
      destination: function (_req, _file, cb) {
        const destinationPath = path.join(
          __dirname,
          `../../assets/${destination}`
        );
        if (!fs.existsSync(destinationPath)) {
          fs.mkdirSync(destinationPath, { recursive: true });
        }
        return cb(null, destinationPath);
      },
      filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + file.originalname;
        return cb(null, file.fieldname + "-" + uniqueSuffix);
      },
    });
    this.upload = multer({ storage: this.storage });
  }
}

module.exports = Uploader;
// const storage = multer.diskStorage({
//   destination: function (_req, _file, cb) {
//     const destinationPath = path.join(__dirname, "../../files");
//     if (!fs.existsSync(destinationPath)) {
//       fs.mkdirSync(destinationPath, { recursive: true });
//     }
//     return cb(null, destinationPath);
//   },
//   filename: function (_req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + file.originalname;
//     return cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// const upload = multer({ storage });

// module.exports = { upload };
