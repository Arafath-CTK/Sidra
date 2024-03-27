const helper = require("../helpers/user");
const User = require("../models/user");
const Product = require("../models/product");
const JWT = require("../middlewares/jwt");
const bcrypt = require("bcrypt");
const { use } = require("../routes/user");

let homePage = async (req, res) => {
  try {
    const plants = await Product.find({ category: "plants" });
    const containers = await Product.find({ category: "pots" });
    const supplies = await Product.find({ category: "supplies" });

    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      if (tokenExtracted.role === "user") {
        return res.render("user/home", {
          title: "Sidra | Home",
          user: true,
          plants: plants.slice(-8).reverse(),
          containers: containers.slice(-8).reverse(),
          supplies: supplies.slice(-8).reverse(),
        });
      }
    }
    return res.render("user/home", {
      title: "Sidra | Home",
      user: false,
      plants: plants.slice(-8).reverse(),
      containers: containers.slice(-8).reverse(),
      supplies: supplies.slice(-8).reverse(),
    });
  } catch (error) {
    res.render("error", { layout: false, errorMessage: error });
  }
};

let signUpPage = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      if (tokenExtracted.role === "user") {
        return res.redirect("/");
      }
    }
    console.log("sign up page rendered successfully");
    res.status(200).render("user/signUp", { title: "Sidra | SignUp" });
  } catch (error) {
    console.error("error getting the signup page");
    res.status(404).render("error", { layout: false, errorMessage: error });
  }
};

let signInPage = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      if (tokenExtracted.role === "user") {
        return res.redirect("/");
      }
    }
    res.status(200).render("user/signIn", { title: "Sidra | SignIn" });
  } catch (error) {
    console.error("error getting the signin page");
    res.status(404).render("error", { layout: false, errorMessage: error });
  }
};

let signUpVerification = async (req, res) => {
  try {
    const { email } = req.body;
    let emailExistance = await helper.signUpVerificationHelper(email);
    if (emailExistance.emailExist) {
      console.log("The entered email already exists");
      res.status(200).render("user/signUp", {
        title: "Sidra | SignUp",
        emailError: "Email already exists",
        enteredName: req.body.name,
        enteredEmail: req.body.email,
        enteredPhoneNumber: phoneNumber,
      });
    } else {
      const { otp, expiry } = await helper.generateAndSendOTP(email);
      req.session.otp = { email, otp, expiry };
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Error initiating email verification: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: `internal server error: ${error}`,
    });
  }
};

let signUpVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Retrieve OTP from session
    const sessionOTP = req.session?.otp;

    if (
      !sessionOTP ||
      sessionOTP.email !== email ||
      otp !== sessionOTP.otp ||
      new Date() > sessionOTP.expiry
    ) {
      return res.status(400).json({ invalidOTP: true });
    } else {
      console.log("OTP verified");

      // Clear OTP from session after successful verification
      req.session.otp = null;
      res.status(200).json({ otpVerified: true });
    }
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: `internal server error: ${error}`,
    });
  }
};

let signUpPost = async (req, res) => {
  try {
    console.log("User registration started");
    let registered = await helper.signUpHelper(req.body);
    if (registered.success) {
      console.log(registered.user, "User registration completed");
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    res.render("error", { errorMessage: error });
  }
};

let signInPost = async (req, res) => {
  try {
    console.log("Signing in started");
    let signedIn = await helper.signInHelper(req.body);

    if (signedIn.invalidEmail) {
      console.log("invalid email id");
      return res.render("user/signIn", {
        title: "Sidra | SignIn",
        emailError: "Invalid email id",
        email: req.body.email,
        password: req.body.password,
      });
    } else if (signedIn.passwordNotMatching) {
      console.log("Incorrect Password");
      return res.render("user/signIn", {
        title: "Sidra | SignIn",
        passwordError: "Incorrect Password",
        email: req.body.email,
        password: req.body.password,
      });
    } else if (signedIn.blockedUser) {
      console.log("The user is blocked");
      return res.render("user/signIn", {
        title: "Sidra | SignIn",
        emailError:
          "Access Denied: Your account has been temporarily suspended",
        email: req.body.email,
        password: req.body.password,
      });
    } else if (signedIn.verified) {
      console.log("User verified and Signed in successfully");
      const token = await JWT.signUser(signedIn.existingUser);
      res.cookie("userToken", token, { htttpOnly: true, maxAge: 7200000 });
      return res.redirect("/");
    }
  } catch (error) {
    return res.render("error", { errorMessage: error });
  }
};

let logout = async (req, res) => {
  try {
    res.clearCookie("userToken");
    console.log("Cookies are cleared and user logged out");
    return res.redirect("/");
  } catch (error) {
    console.log("Error while rendering the logging out");
    res.status(404).render("error", { layout: false, errorMessage: error });
  }
};

let forgotPasswordPage = (req, res) => {
  res.render("user/forgotPassword", { title: "Sidra | Forgot Password" });
};

let forgotPasswordPost = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("not found");
      res.status(404).json({ userNotFound: true });
    } else {
      const { otp, expiry } = await helper.generateAndSendOTP(email);
      req.session.otp = { email, otp, expiry };
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Error initiating password reset: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: `internal server error: ${error}`,
    });
  }
};

let verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Retrieve OTP from session
    const sessionOTP = req.session?.otp;

    if (
      !sessionOTP ||
      sessionOTP.email !== email ||
      otp !== sessionOTP.otp ||
      new Date() > sessionOTP.expiry
    ) {
      return res.status(400).json({ invalidOTP: true });
    } else {
      console.log("OTP verified, proceed with password reset");

      // Clear OTP from session after successful verification
      req.session.otp = null;
      res.status(200).json({ otpVerified: true });
    }
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: `internal server error: ${error}`,
    });
  }
};

let resetPassword = async (req, res) => {
  try {
    const { email, confirmPassword } = req.body;

    const user = await User.findOne({ email });
    const passwordMatch = await bcrypt.compare(confirmPassword, user.password);
    if (!user) {
      return res.status(404).json({ userNotFound: true });
    } else if (passwordMatch) {
      return res.status(400).json({ samePassword: true });
    } else {
      const hashedPassword = await bcrypt.hash(confirmPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Error while resetting the password");
    res.status(500).render("error", {
      layout: false,
      errorMessage: `internal server error: ${error}`,
    });
  }
};

let myAccountPage = async (req, res) => {
  try {
    if (!req.cookies.userToken) {
      return res.render("user/signIn", { title: "Sidra | SignIn" });
    }
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      role = tokenExtracted.role;
      email = tokenExtracted.userEmail;
      if (role !== "user") {
        return res.render("user/signIn", { title: "Sidra | SignIn" });
      }
      let userData = await User.findOne({ email: email });
      let year = userData.register_date.split("/")[2];
      let addresses = userData.addresses;

      return res.status(200).render("user/myAccount", {
        title: "Sidra | My Account",
        user: true,
        userName: userData.name,
        userPhone_number: userData.phone_number,
        userEmail: userData.email,
        memberSince: year,
        addresses,
      });
    }
  } catch (error) {
    console.error("Unexpected error occured due to: ", error);
    return res
      .status(404)
      .render("error", { layout: false, errorMessage: error });
  }
};

let addAddress = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      let userId = tokenExtracted.userId;
      let addedAddress = await helper.addAddressHelper(req.body, userId);

      if (addedAddress.addressExist) {
        console.log("address already exists");
        return res.status(409).json({ addressExist: true });
      } else if (addedAddress.success) {
        console.log("address added successfully");
        return res.status(200).json({ success: true });
      }
    }
  } catch (error) {
    console.error("Error while adding the error");
    res.status(500).render("error", {
      layout: false,
      errorMessage: `internal server error: ${error}`,
    });
  }
};

let editAddressPage = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const user = await User.findById(userId);
    const address = user.addresses.find((addr) => addr._id == addressId);

    res.status(200).json(address);
  } catch (error) {
    console.error("Error occured while getting the address: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error occured while getting the address",
    });
  }
};

let editAddressPut = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    let editedAddress = await helper.editAddressHelper(
      req.body,
      userId,
      addressId
    );

    if (editedAddress.addressExist) {
      console.log("address already exists");
      return res.status(409).json({ addressExist: true });
    } else if (editedAddress.success) {
      console.log("address added successfully");
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Error occured while editing the address: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error occured while editing the address",
    });
  }
};

let deleteAddress = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      let userId = tokenExtracted.userId;
      const addressId = req.params.id;
      const deleted = await helper.deleteAddressHelper(addressId, userId);
      if (deleted.userNotExist) {
        return res.status(409).json({ userNotExist: true });
      } else {
        return res.status(200).json({ success: true });
      }
    }
  } catch (error) {
    console.error("Error occured while deleting the address: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error occured while deleting the address",
    });
  }
};

let shopPage = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let products = await Product.find();
      res
        .status(200)
        .render("user/shop", { title: "Sidra | Shop", user: true, products });
    } else {
      let products = await Product.find();
      res
        .status(200)
        .render("user/shop", { title: "Sidra | Shop", user: false, products });
    }
  } catch (error) {
    console.error("Error rendering the Shop page: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering the Shop page",
    });
  }
};

let plantsPage = async (req, res) => {
  try {
    const plants = await Product.find({ category: "plants" });

    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      if (tokenExtracted.role === "user") {
        return res.status(200).render("user/shop", {
          title: "Sidra | Shop",
          user: true,
          products: plants,
        });
      }
    }
    return res.status(200).render("user/shop", {
      title: "Sidra | Shop",
      user: false,
      products: plants,
    });
  } catch (error) {
    console.error("Error rendering the plants: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering the plants",
    });
  }
};

let containersPage = async (req, res) => {
  try {
    const containers = await Product.find({ category: "pots" });

    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      if (tokenExtracted.role === "user") {
        return res.status(200).render("user/shop", {
          title: "Sidra | Shop",
          user: true,
          products: containers,
        });
      }
    }
    return res.status(200).render("user/shop", {
      title: "Sidra | Shop",
      user: false,
      products: containers,
    });
  } catch (error) {
    console.error("Error rendering the plants: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering the plants",
    });
  }
};

let suppliesPage = async (req, res) => {
  try {
    const supplies = await Product.find({ category: "supplies" });

    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      if (tokenExtracted.role === "user") {
        return res.status(200).render("user/shop", {
          title: "Sidra | Shop",
          user: true,
          products: supplies,
        });
      }
    }
    return res.status(200).render("user/shop", {
      title: "Sidra | Shop",
      user: false,
      products: supplies,
    });
  } catch (error) {
    console.error("Error rendering the plants: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering the plants",
    });
  }
};

let singleProductPage = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      const productId = req.params.id;
      let product = await Product.findById(productId);
      res.status(200).render("user/singleProduct", {
        title: "Sidra | Product",
        user: true,
        product,
      });
    } else {
      const productId = req.params.id;
      let product = await Product.findById(productId);
      res.status(200).render("user/singleProduct", {
        title: "Sidra | Product",
        user: false,
        product,
      });
    }
  } catch (error) {
    console.error("Error rendering the product page: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering the product page",
    });
  }
};

let wishlistPage = async (req, res) => {
  try {
    if (req.user.role === "user") {
      let userId = req.user.id;

      let user = await User.findById(userId).populate("wishlist");

      res.status(200).render("user/wishlist", {
        user: true,
        title: "Sidra | Wishlist",
        wishlist: user.wishlist,
      });
    } else {
      res.status(302).redirect("/signIn");
    }
  } catch (error) {
    console.error("Error rendering wishlist: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering wishlist",
    });
  }
};

let addToWishlist = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      const userId = tokenExtracted.userId;
      const productId = req.params.id;

      let addedProduct = await helper.addToWishlistHelper(userId, productId);

      if (addedProduct.productExist) {
        console.log("Product already exists in wishlist");
        return res.status(200).json({ productExist: true });
      } else if (addedProduct.success) {
        console.log("Product added to wishlist successfully");
        return res.status(200).json({ success: true });
      }
    } else {
      return res.status(200).json({ notLogged: true });
    }
  } catch (error) {
    console.error("Error adding product to wishlist: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error adding product to wishlist",
    });
  }
};

let removeFromWishlist = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      let userId = tokenExtracted.userId;
      let productId = req.params.id;

      const deleted = await helper.removeFromWishlistHelper(userId, productId);
      if (deleted.userNotExist) {
        return res.status(200).json({ userNotExist: true });
      } else {
        return res.status(200).json({ success: true });
      }
    } else {
      res.status(200).json({ notLogged: true });
    }
  } catch (error) {
    console.error(
      "Error occured while removing the product from wishlist: ",
      error
    );
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error occured while removing the product from wishlist",
    });
  }
};

let checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;

    const user = await User.findById(userId).populate("wishlist");

    const wishlisted = user.wishlist.some((prod) => prod._id.equals(productId));

    if (wishlisted) {
      res.status(200).json({ wishlisted: true });
    } else {
      res.status(200).json({ wishlisted: false });
    }
  } catch (error) {
    console.error("Error occured while getting the address: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error occured while getting the address",
    });
  }
};

let cartPage = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      let userId = tokenExtracted.userId;

      let userData = await User.findById(userId).populate("cart.product");
      let products = userData.cart;

      res
        .status(200)
        .render("user/cart", { title: "Sidra | Cart", user: true, products });
    } else {
      console.log("failed");
    }
  } catch (error) {
    console.error("Error rendering the cart page: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering the cart page",
    });
  }
};

let addToCart = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      let userId = tokenExtracted.userId;

      let addedProduct = await helper.addToCartHelper(req.body, userId);

      if (addedProduct.productExist) {
        console.log("Product already exists in cart");
        return res.status(200).json({ productExist: true });
      } else {
        console.log("Product added to cart successfully");
        return res.status(200).json({ success: true });
      }
    } else {
      console.log("user not logged in");
      return res.status(200).json({ notLogged: true });
    }
  } catch (error) {
    console.error("Error adding product to the cart: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error adding product to the cart",
    });
  }
};

let removeFromCart = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      let userId = tokenExtracted.userId;
      let cartId = req.params.id;

      let removed = await helper.removeFromCartHelper(userId, cartId);

      if (removed.userNotExist) {
        return res.status(200).json({ userNotExist: true });
      } else {
        return res.status(200).json({ success: true });
      }
    } else {
      res.status(200).json({ notLogged: true });
    }
  } catch (error) {
    console.error("Error removing product from the cart: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error removing product from the cart",
    });
  }
};

let updateQuantity = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      let userId = tokenExtracted.userId;

      let updated = await helper.updateQuantityHelper(userId, req.body);

      if (updated.productNotExist) {
        return res.status(200).json({ productNotExist: true });
      } else if (updated.success) {
        console.log("Cart updated successfully", updated.updatedCart);
        return res.status(200).json({ success: true });
      } else {
        return res.status(200).json({ failed: true });
      }
    } else {
      res.status(200).json({ notLogged: true });
    }
  } catch (error) {
    console.error("Error updating the quantity of the cart: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error updating the quantity of the cart",
    });
  }
};

let cartCount = async (req, res) => {
  try {
    if (req.cookies.userToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.userToken);
      let userId = tokenExtracted.userId;

      let user = await User.findById(userId);

      if (!user) {
        return res.status(200).json({ userNotFound: true });
      }

      let cartCount = user.cart.length;

      return res.status(200).json({ success: true, cartCount: cartCount });
    } else {
      res.status(200).json({ notLogged: true });
    }
  } catch (error) {
    console.error("Error getting the cart count");
    res.status(500).json({ failed: true });
  }
};

module.exports = {
  homePage,
  signUpPage,
  signInPage,
  myAccountPage,
  addAddress,
  editAddressPage,
  editAddressPut,
  deleteAddress,
  signUpVerification,
  signUpVerifyOTP,
  signUpPost,
  signInPost,
  logout,
  forgotPasswordPage,
  forgotPasswordPost,
  verifyOTP,
  resetPassword,
  shopPage,
  plantsPage,
  containersPage,
  suppliesPage,
  singleProductPage,
  wishlistPage,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  cartPage,
  addToCart,
  removeFromCart,
  updateQuantity,
  cartCount,
};
