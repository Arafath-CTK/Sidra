const helper = require("../helpers/user");
const User = require("../models/user");
const Product = require("../models/product");
const JWT = require("../middlewares/jwt");
const bcrypt = require("bcrypt");

let homePage = async (req, res) => {
  try {
    const plants = await Product.find({ category: "plants" });
    const containers = await Product.find({ category: "pots" });
    const supplies = await Product.find({ category: "supplies" });

    if (req.cookies.jwt) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.jwt);
      return res.render("user/home", {
        user: true,
        plants,
        containers,
        supplies,
      });
    }
    return res.render("user/home", {
      user: false,
      plants,
      containers,
      supplies,
    });
  } catch (error) {
    res.render("error", { errorMessage: error });
  }
};

let signUpPage = (req, res) => {
  res.render("user/signUp");
};

let signInPage = async (req, res) => {
  if (req.cookies.jwt) {
    let tokenExtracted = await JWT.verifyUser(req.cookies.jwt);
    if (tokenExtracted.role === "user") {
      return res.redirect("/");
    }
  }
  res.render("user/signIn");
};

let myAccountPage = async (req, res) => {
  try {
    if (!req.cookies.jwt) {
      return res.render("user/signIn");
    }
    if (req.cookies.jwt) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.jwt);
      role = tokenExtracted.role;
      if (role !== "user") {
        return res.render("user/signIn");
      }
    }
    return res.render("user/myAccount", { user: true });
  } catch (error) {
    console.error("Unexpected error occured due to: ", error);
    return res.status(404).render("error", { errorMessage: error });
  }
};

let signUpPost = async (req, res) => {
  try {
    console.log("User registration started");
    let registered = await helper.signUpHelper(req.body);
    if (registered.emailExist) {
      console.log("The entered email already exists");
      res.status(200).render("user/signUp", {
        emailError: "Email already exists",
        enteredName: req.body.name,
        enteredEmail: req.body.email,
        enteredPhoneNumber: phoneNumber,
      });
    } else {
      console.log(registered.user, "User registration completed");
      return res.redirect("/signIn");
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
        emailError: "Invalid email id",
        email: req.body.email,
        password: req.body.password,
      });
    } else if (signedIn.passwordNotMatching) {
      console.log("Incorrect Password");
      return res.render("user/signIn", {
        passwordError: "Incorrect Password",
        email: req.body.email,
        password: req.body.password,
      });
    } else if (signedIn.blockedUser) {
      console.log("The user is blocked");
      return res.render("user/signIn", {
        emailError:
          "Access Denied: Your account has been temporarily suspended",
        email: req.body.email,
        password: req.body.password,
      });
    } else if (signedIn.verified) {
      console.log("User verified and Signed in successfully");
      const token = await JWT.signUser(signedIn.existingUser);
      res.cookie("jwt", token, { htttpOnly: true, maxAge: 7200000 });
      return res.redirect("/myAccount");
    }
  } catch (error) {
    return res.render("error", { errorMessage: error });
  }
};

let logout = (req, res) => {
  res.clearCookie("jwt");
  console.log("Cookies are cleared and user logged out");
  return res.redirect("/");
};

// forgot password
let forgotPasswordPage = (req, res) => {
  res.render("user/forgotPassword");
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

      user.otp = otp;
      user.otpExpiry = new Date(expiry);
      await user.save();

      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Error initiating password reset: ", error);
    res
      .status(500)
      .render("error", { errorMessage: `internal server error: ${error}` });
  }
};

let verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ userNotFound: true });
    } else if (otp !== user.otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ invalidOTP: true });
    } else {
      res.status(200).json({ otpVerified: true });
    }
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    res
      .status(500)
      .render("error", { errorMessage: `internal server error: ${error}` });
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
    res
      .status(500)
      .render("error", { errorMessage: `internal server error: ${error}` });
  }
};

let shopPage = async (req, res) => {
  try {
    let products = await Product.find();
    res.status(200).render("user/shop", { products });
  } catch (error) {
    console.error("Error rendering the Shop page: ", error);
    res.status(500).render("error", {
      errorMessage: "Error rendering the Shop page",
    });
  }
};

module.exports = {
  homePage,
  signUpPage,
  signInPage,
  myAccountPage,
  signUpPost,
  signInPost,
  logout,
  forgotPasswordPage,
  forgotPasswordPost,
  verifyOTP,
  resetPassword,
  shopPage,
};
