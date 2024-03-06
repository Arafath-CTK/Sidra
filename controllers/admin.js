const helper = require("../helpers/admin");
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
// const Swal = require("sweetalert2").default;

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
    const adminData = await Admin.findOne(signInEmail);
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

let usersListPage = async (req, res) => {
  try {
    const users = await User.find();

    users.forEach((user) => {
      user.isActive = user.status === "Active";
    });

    res.status(200).render("admin/usersList", { users });
  } catch (error) {
    console.error("Error rendering the users list page", error);
    res
      .status(500)
      .render("error", { errorMessage: "Error rendering the users list" });
  }
};

let userAction = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    user.status = user.status === "Active" ? "Blocked" : "Active";
    await user.save();
    res.status(200).redirect("/admin/usersList");
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      errorMessage: "Error occured while taking action against user",
    });
  }
};

let addProductPage = async (req, res) => {
  try {
    res.status(200).render("admin/productAdd");
  } catch (error) {
    console.error("Error rendering the Product adding page: ", error);
    res.status(500).render("error", {
      errorMessage: "Error rendering the Product adding page",
    });
  }
};

let addProductPost = async (req, res) => {
  try {
    let uploaded = await helper.addProductHelper(req.body, req.files);

    if (uploaded.productExist) {
      console.log("Product already exists");
      return res.render("admin/productAdd", {
        productAddError: "Product already exists",
      });
    } else if (uploaded.success) {
      console.log("Product added successfully");
      res.status(200).redirect("/admin/listproduct");

      // const options = {
      //   title: "Product Added!",
      //   text: "What would you like to do next?",
      //   icon: "success",
      //   showCancelButton: true,
      //   confirmButtonText: "View Products",
      //   cancelButtonText: "Add New Product",
      // };

      // const result = await Swal.fire(options);

      // if (result.isConfirmed) {
      //   // If user clicks on "View Products" button
      //   res.redirect("/listProduct");
      // } else {
      //   // If user clicks on "Add New Product" button or closes the modal
      //   res.redirect("/addProduct");
      // }
    }
  } catch (error) {
    console.error("Error submitting the Product: ", error);
    res.status(500).render("admin/productAdd", {
      productAddError: "Error submitting the Product",
    });
  }
};

let productListPage = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).render("admin/productList", { products });
  } catch (error) {
    console.error("Error rendering the Product listing page: ", error);
    res.status(500).render("error", {
      errorMessage: "Error rendering the Product listing page",
    });
  }
};

module.exports = {
  signInPage,
  adminHome,
  signInPost,
  usersListPage,
  userAction,
  addProductPage,
  addProductPost,
  productListPage,
};
