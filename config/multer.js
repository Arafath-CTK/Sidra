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
const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;

// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("./cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "uploads", // specify the folder name where you want to store uploaded files
//     allowed_formats: ["jpg", "png"],
//     // other parameters can be added based on your requirements
//   },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;
