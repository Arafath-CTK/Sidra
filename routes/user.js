const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");
const preventBack = require('../middlewares/preventBack');

router.get("/", preventBack, userControllers.homePage);
router.get("/signIn", preventBack, userControllers.signInPage)
router.get("/signUp", preventBack, userControllers.signUpPage)
router.post("/signUpPost", userControllers.signUpPost)
router.post("/signInPost", userControllers.signInPost)

router.get("/myAccount", userControllers.myAccountPage)


module.exports = router;