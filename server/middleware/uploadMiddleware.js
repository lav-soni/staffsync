const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(dir, { recursive: true }); // creates the folder if missing

const storage = process.env.CLOUDINARY_URL
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      filename: (req, file, cb) =>
        cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
    });

const fileFilter = (req, file, cb) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG or WEBP images are allowed"));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2 MB
