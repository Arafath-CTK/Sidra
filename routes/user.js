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

router.get("/myAccount", preventBack, userControllers.myAccountPage);
router.get("/logout", preventBack, userControllers.logout);
router.get("/forgotPassword", userControllers.forgotPasswordPage);
router.post("/forgotPasswordPost", preventBack, userControllers.forgotPasswordPost);
router.post("/verifyOTP", preventBack, userControllers.verifyOTP);
router.post("/resetPassword", preventBack, userControllers.resetPassword);

module.exports = router;
