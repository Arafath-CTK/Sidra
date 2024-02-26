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

let signUpPost = (req, res) => {
  console.log(req.body);
  let { name, email, phoneNumber, password, confirmPassword } = req.body;
  
};

// let checkAuthentication = (req, res) => {
//   if (req.user) {
//     res.status(200).send("Authenticated");
//   } else {
//     res.status(401).send("Not Authenticated");
//   }
// };

module.exports = {
  homePage,
  signUpPage,
  signInPage,
  myAccountPage,
  signUpPost,
};
