const helper = require("../helpers/user");
const JWT = require("../middlewares/jwt");

let homePage = async (req, res) => {
  try {
    if (req.cookies.jwt) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.jwt);
      return res.render("user/home", { user: true });
    }
    return res.render("user/home");
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
    } else if (signedIn.verified) {
      console.log("User verified and Signed in successfully");
      const token = await JWT.signUser(signedIn.existingUser);
      res.cookie("jwt", token, { htttpOnly: true, maxAge: 7200000 });
      return res.redirect("/");
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

let forgotPasswordPost = async (req, res) => {};

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
};
