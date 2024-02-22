// Admin signup page
let signUpPage = (req, res) => {
  res.render("admin/signin");
};

let adminHome = (req, res) => {
  res.render("admin/index");
};

module.exports = { signUpPage, adminHome };
