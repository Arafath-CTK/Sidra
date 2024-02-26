const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");

router.get("/", userControllers.homePage);
router.get("/myAccount", userControllers.myAccountPage)
router.get("/signIn", userControllers.signInPage)
router.get("/signUp", userControllers.signUpPage)
router.post("/signUpPost", userControllers.signUpPost)
router.post("/signInPost", userControllers.signInPost)


module.exports = router;
