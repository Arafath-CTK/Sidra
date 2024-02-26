const helper = require("../helpers/user");

let homePage = (req, res) => {
  res.render("user/home");
};

let signUpPage = (req, res) => {
  res.render("user/signUp");
};

let signInPage = (req, res) => {
  res.render("user/signIn");
};

let myAccountPage = (req, res) => {
  res.render("user/myAccount");
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
      return res.render("user/signIn", {emailError: "Invalid email id", email: req.body.email, password: req.body.password})
    } else if (signedIn.passwordNotMatching) {
      console.log("Incorrect Password");
      return res.render("user/signIn", {passwordError: "Incorrect Password", email: req.body.email, password: req.body.password })
    } else if(signedIn.verified) {
      console.log("User verified and Signed in successfully");
      // const token = await signUser(signedIn.existingUser)
      // res.cookie("jwt", token, {htttpOnly: true, maxAge: 7200000})
      return res.redirect("/")
    }
  } catch (error) {
    return res.render("error", { errorMessage: error });
  }
};

module.exports = {
  homePage,
  signUpPage,
  signInPage,
  myAccountPage,
  signUpPost,
  signInPost,
};
