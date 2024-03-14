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
  res.render("admin/dashboard", {
    layout: "adminLayout",
    title: "Sidra Admin | Dashboard",
  });
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

    res.status(200).render("admin/usersList", {
      users,
      layout: "adminLayout",
      title: "Sidra Admin | Users",
    });
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
    res.status(200).render("admin/productAdd", {
      layout: "adminLayout",
      title: "Sidra Admin | Add Product",
      pageHeader: "Add New Products",
    });
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
        layout: "adminLayout",
        title: "Sidra Admin | Add Product",
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
      layout: "adminLayout",
      title: "Sidra Admin | Add Product",
      productAddError: "Error submitting the Product",
    });
  }
};

let productListPage = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).render("admin/productList", {
      layout: "adminLayout",
      title: "Sidra Admin | Product List",
      products,
    });
  } catch (error) {
    console.error("Error rendering the Product listing page: ", error);
    res.status(500).render("error", {
      errorMessage: "Error rendering the Product listing page",
    });
  }
};

let deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    // Your code to delete the product from the database
    await Product.findByIdAndDelete(productId);
    // Respond with success message or appropriate response
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .render("error", { errorMessage: "Error deleting product:", error });
  }
};

let editProductPage = async (req, res) => {
  try {
    const productId = req.params.id;
    let product = await Product.findById(productId);

    if (product) {
      res.status(200).render("admin/productEdit", {
        layout: "adminLayout",
        title: "Sidra Admin | Edit Product",
        pageHeader: "Edit The Product",
        productId: product._id,
        productName: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        image1: product.images[0],
        image2: product.images[1],
        image3: product.images[2],
        mainCategory: product.category,
        subCategory: product.sub_category,
      });
    } else {
      res.render("admin/productAdd", {
        layout: "adminLayout",
        title: "Sidra Admin | Edit Product",
        pageHeader: "Edit The Product",
        productAddError: "Product Doesn't exist",
      });
    }
  } catch (error) {
    console.error("Error while rendering the product editing page: ", error);
    res.status(500).render("error", {
      errorMessage: "Error while rendering the product editing page: ",
      error,
    });
  }
};

let editProductPost = async (req, res) => {
  try {
    let productId = req.params.id
    let updated = await helper.editProductHelper(req.body, req.files, productId);
        
  } catch (error) {
    console.error("Error submitting the Product: ", error);
    res.status(500).render("admin/productEdit", {
      layout: "adminLayout",
      title: "Sidra Admin | Edit Product",
      productAddError: "Error submitting the Product",
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
  deleteProduct,
  editProductPage,
  editProductPost,
};
