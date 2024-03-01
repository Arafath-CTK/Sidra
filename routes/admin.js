const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/admin");
  
// router.get("/", adminControllers.adminHome);
router.get("/", adminControllers.signInPage);
router.get("/home", adminControllers.adminHome);
router.post("/signInPost", adminControllers.signInPost);

router.get("/usersList", adminControllers.usersListPage)
router.post("/usersList/:userId/block", adminControllers.userAction)
module.exports = router;