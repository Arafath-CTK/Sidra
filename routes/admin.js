const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/admin");

router.get("/", adminControllers.signUpPage);
router.get("/admin", adminControllers.adminHome);

module.exports = router;
