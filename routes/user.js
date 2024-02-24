const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");

router.get("/", userControllers.homePage);

module.exports = router;
