const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");

router.get("/", userControllers.homePage);
router.get("/signUp", userControllers.signUpPage)
router.get("/signIn", userControllers.signInPage)
router.get("/myAccount", userControllers.myAccountPage)
router.post("/signUpPost", userControllers.signUpPost)
// router.get("/checkAuthentication", userControllers.checkAuthentication);


module.exports = router;
