const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");
const preventBack = require("../middlewares/preventBack");
const user = require("../models/user");

router.get("/", preventBack, userControllers.homePage);
router.get("/signIn", preventBack, userControllers.signInPage);
router.get("/signUp", preventBack, userControllers.signUpPage);
router.post("/signUpPost", userControllers.signUpPost);
router.post("/signInPost", userControllers.signInPost);
router.get("/logout", preventBack, userControllers.logout)

router.get("/myAccount", userControllers.myAccountPage);
router.get("/forgotPassword", userControllers.forgotPasswordPage)
router.post("/forgotPassword",userControllers.forgotPasswordPost)

module.exports = router;
