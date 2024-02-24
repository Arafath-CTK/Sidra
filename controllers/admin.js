const Admin = require("../models/admin");

// Admin signup page
let signInPage = (req, res) => {
  res.render("admin/signin");
};

let adminHome = (req, res) => {
  res.render("admin/dashboard");
};

let signInPost = async (req, res) => {
  try {
    const { signInEmail, signInPassword } = req.body;
    const adminData = await Admin.findById("65d86b85958675a31c9de541");
    console.log(adminData);
    if (adminData === null) {
      return res.status(401).render("admin/signin", {
        replaceMail: "Wrong email id",
        enteredMail: signInEmail,
        enteredPassword: signInPassword,
      });
    }
    if (adminData.password !== signInPassword) {
      return res.status(401).render("admin/signin", {
        replacePassword: "Wrong Password",
        enteredMail: signInEmail,
      });
    } else {
      res.redirect("/admin/home");
    }
  } catch (error) {
    console.error("Error while logging in ", error);
    res.render("error", { errorMessage: error });
  }
};

module.exports = { signInPage, adminHome, signInPost };
