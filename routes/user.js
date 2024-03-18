const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");
const preventBack = require("../middlewares/preventBack");
const { authenticateUser } = require('../middlewares/jwt');

router.get("/signIn", preventBack, userControllers.signInPage);
router.post("/signIn", preventBack, userControllers.signInPost);
router.get("/signUp", preventBack, userControllers.signUpPage);
router.post("/signUp", preventBack, userControllers.signUpPost);
router.get("/logout", preventBack, userControllers.logout);
router.get("/forgotPassword", preventBack, userControllers.forgotPasswordPage);
router.post("/forgotPassword", userControllers.forgotPasswordPost);
router.post("/verifyOTP", userControllers.verifyOTP);
router.post("/resetPassword", userControllers.resetPassword);

router.get("/", preventBack, userControllers.homePage);
router.get("/myAccount", preventBack, authenticateUser(), userControllers.myAccountPage);
router.get("/shop", userControllers.shopPage);

module.exports = router;
