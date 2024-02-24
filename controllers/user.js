const helper = require("../helpers/user");

let homePage = (req, res) => {
  res.render("user/home");
};

module.exports = { homePage };
