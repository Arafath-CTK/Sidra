const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/admin");
const upload = require("../config/multer");

router.get("/", adminControllers.signInPage);
router.get("/home", adminControllers.adminHome);
router.post("/signInPost", adminControllers.signInPost);

router.get("/usersList", adminControllers.usersListPage)
router.post("/usersList/:userId/block", adminControllers.userAction)

router.get("/addProduct", adminControllers.addProductPage)
router.get("/listProduct", adminControllers.productListPage)
router.post("/addProduct", upload.array('image', 3), adminControllers.addProductPost)
router.get("/editProduct/:id", adminControllers.editProductPage)
router.put("/editProduct/:id", upload.array('image', 3),adminControllers.editProductPut)
router.delete("/products/:id", adminControllers.deleteProduct)

module.exports = router;
