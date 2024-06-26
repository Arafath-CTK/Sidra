const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user");
const preventBack = require("../middlewares/preventBack");
const { authenticateUser } = require('../middlewares/jwt');

router.get("/signIn", preventBack, userControllers.signInPage);
router.post("/signIn", preventBack, userControllers.signInPost);
router.get("/signUp", preventBack, userControllers.signUpPage);
router.post("/signUpVerification", preventBack, userControllers.signUpVerification);
router.post("/signUpVerifyOTP", preventBack, userControllers.signUpVerifyOTP)
router.post("/signUp", preventBack, userControllers.signUpPost);
router.get("/logout", preventBack, userControllers.logout);
router.get("/forgotPassword", preventBack, userControllers.forgotPasswordPage);
router.post("/forgotPassword", userControllers.forgotPasswordPost);
router.post("/verifyOTP", preventBack, userControllers.verifyOTP);
router.post("/resetPassword", userControllers.resetPassword);

router.get("/", preventBack, userControllers.homePage);
router.get("/myAccount", preventBack, authenticateUser(), userControllers.myAccountPage);
router.post("/address", preventBack, authenticateUser(), userControllers.addAddress);
router.get("/address/:id", preventBack, authenticateUser(), userControllers.editAddressPage)
router.put("/address/:id", preventBack, authenticateUser(), userControllers.editAddressPut)
router.delete("/address/:id", preventBack, authenticateUser(), userControllers.deleteAddress);
router.post("/myAccount/newEmailVerification", preventBack, authenticateUser(), userControllers.newEmailVerification);
router.post("/myAccount/editUserData", preventBack, authenticateUser(), userControllers.editUserData)

router.get("/shop", userControllers.shopPage);
router.get("/shop/plants", userControllers.plantsPage);
router.get("/shop/containers", userControllers.containersPage);
router.get("/shop/supplies", userControllers.suppliesPage);
router.get("/singleProduct/:id", preventBack, userControllers.singleProductPage);
router.get("/shop/filter", userControllers.filter);
router.get("/search", userControllers.search);

router.get("/wishlist", authenticateUser(), userControllers.wishlistPage)
router.post("/addtowishlist/:id", userControllers.addToWishlist)
router.delete("/removeFromWishlist/:id", userControllers.removeFromWishlist)
router.get("/checkwishlist/:id", authenticateUser(), userControllers.checkWishlist)

router.get("/cart",preventBack, authenticateUser(), userControllers.cartPage);
router.post("/addtocart", preventBack, userControllers.addToCart);
router.delete("/cart/remove/:id", preventBack, userControllers.removeFromCart);
router.post("/cart/updateQuantity", userControllers.updateQuantity);
router.put("/cart/updateSelected/:id", userControllers.updateSelected)
router.get("/cart/count", userControllers.cartCount);
router.get("/checkout", preventBack, userControllers.checkoutPage);
router.post("/coupon", userControllers.applyCoupon)
router.post("/placeOrder", userControllers.placeOrder);
router.post("/payment/create-order", userControllers.createOrder);
router.put("/cancelOrder", userControllers.cancelOrder);

router.get("/contactus", userControllers.contactusPage)

module.exports = router;
 