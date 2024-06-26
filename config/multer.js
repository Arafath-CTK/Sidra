const multer = require("multer");

// Multer storage configuration
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname); // you can customize the filename if needed
  },
});

// Multer file filter
const fileFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept image files only
  } else {
    cb(new Error("Please upload only images."), false);
  }
};

// Initialize multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fieldNameSize: 100,
    fieldSize: 1024 * 1024 * 5,
  },
});

module.exports = upload;
