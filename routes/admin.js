const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/admin");
const upload = require("../config/multer");
const preventBack = require("../middlewares/preventBack");
const { authenticateAdmin } = require('../middlewares/jwt');
const admin = require("../models/admin");

router.get("/signIn", preventBack, adminControllers.signInPage);
router.post("/signIn", adminControllers.signInPost);
router.get("/signout", preventBack, adminControllers.signOut)

router.get("/", preventBack, adminControllers.adminHome);
router.get("/dashboard", preventBack, adminControllers.dashboardData)
router.post("/generateReport", preventBack, adminControllers.generateReport)
 
router.get("/usersList", preventBack, adminControllers.usersListPage)
router.post("/usersList/:userId/block", authenticateAdmin(), adminControllers.userAction)

router.get("/addProduct", preventBack, authenticateAdmin(), adminControllers.addProductPage)
router.post("/addProduct", preventBack, authenticateAdmin(), upload.array('image', 3), adminControllers.addProductPost)
router.get("/listProduct", preventBack, authenticateAdmin(), adminControllers.productListPage)
router.get("/editProduct/:id", preventBack, authenticateAdmin(), adminControllers.editProductPage)
router.put("/editProduct/:id", preventBack, authenticateAdmin(), upload.array('image', 3),adminControllers.editProductPut)
router.delete("/products/:id", preventBack, authenticateAdmin(), adminControllers.deleteProduct)

router.get("/orderList", preventBack, authenticateAdmin(), adminControllers.orderListPage)
router.put("/changeStatus", authenticateAdmin(), adminControllers.changeStatus)

router.get("/couponsList", preventBack, adminControllers.couponsListPage)
router.get("/addCoupon", preventBack, adminControllers.couponsAddPage)
router.post("/addCoupon", preventBack, adminControllers.couponAddPost)
router.delete("/coupon/:id", preventBack, adminControllers.deleteCoupon)
router.get("/coupon/:id", preventBack, adminControllers.couponEditModal)
router.put("/editCoupon", preventBack, adminControllers.couponEditPost)

module.exports = router;
