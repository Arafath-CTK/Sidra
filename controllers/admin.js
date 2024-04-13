const helper = require("../helpers/admin");
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const JWT = require("../middlewares/jwt");
const bcrypt = require("bcrypt");

// Admin signup page
let signInPage = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyUser(req.cookies.adminToken);
      if (tokenExtracted.role === "admin") {
        return res.redirect("/admin");
      }
    }
    res.render("admin/signIn", { layout: false });
  } catch (error) {
    console.log("Error while rendering the signin page");
    res.status(404).render("error", { layout: false, errorMessage: error });
  }
};

let signOut = async (req, res) => {
  try {
    res.clearCookie("adminToken");
    console.log("Cookies are cleared and admin logged out");
    return res.redirect("/admin");
  } catch (error) {
    console.log("Error while rendering the signing out");
    res.status(404).render("error", { layout: false, errorMessage: error });
  }
};

let adminHome = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      if (tokenExtracted.role === "admin") {
        return res.render("admin/dashboard", {
          layout: "adminLayout",
          title: "Sidra Admin | Dashboard",
          adminName: tokenExtracted.adminName,
          adminMail: tokenExtracted.adminEmail,
        });
      }
    }
    return res.redirect("/admin/signIn");
  } catch (error) {
    res.render("error", { layout: false, errorMessage: error });
  }
};

let signInPost = async (req, res) => {
  try {
    const { signInEmail, signInPassword } = req.body;
    const adminData = await Admin.findOne({ email: signInEmail });

    if (adminData === null) {
      return res.status(401).render("admin/signin", {
        layout: false,
        replaceMail: "Wrong email id",
        enteredMail: signInEmail,
        enteredPassword: signInPassword,
      });
    }

    const passwordMatch = await bcrypt.compare(
      signInPassword,
      adminData.password
    );
    if (!passwordMatch) {
      return res.status(401).render("admin/signin", {
        layout: false,
        replacePassword: "Wrong Password",
        enteredMail: signInEmail,
      });
    } else {
      console.log("Admin verified and signed in successfully");
      const token = await JWT.signAdmin(adminData);
      res.cookie("adminToken", token, { htttpOnly: true, maxAge: 7200000 });
      res.redirect("/admin/");
    }
  } catch (error) {
    console.error("Error while logging in ", error);
    res.render("error", { layout: false, errorMessage: error });
  }
};

let usersListPage = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      if (tokenExtracted.role === "admin") {
        const users = await User.find();
        users.forEach((user) => {
          user.isActive = user.status === "Active";
        });

        res.status(200).render("admin/usersList", {
          users,
          layout: "adminLayout",
          title: "Sidra Admin | Users",
          adminName: tokenExtracted.adminName,
          adminMail: tokenExtracted.adminEmail,
        });
      }
    }
  } catch (error) {
    console.error("Error rendering the users list page", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering the users list",
    });
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
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      if (tokenExtracted.role === "admin") {
        res.status(200).render("admin/productAdd", {
          layout: "adminLayout",
          title: "Sidra Admin | Add Product",
          pageHeader: "Add New Products",
          adminName: tokenExtracted.adminName,
          adminMail: tokenExtracted.adminEmail,
        });
      }
    }
  } catch (error) {
    console.error("Error rendering the Product adding page: ", error);
    res.status(500).render("error", {
      errorMessage: "Error rendering the Product adding page",
    });
  }
};

let addProductPost = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      if (tokenExtracted.role === "admin") {
        let uploaded = await helper.addProductHelper(req.body, req.files);
        if (uploaded.productExist) {
          console.log("Product already exists");
          return res.render("admin/productAdd", {
            layout: "adminLayout",
            title: "Sidra Admin | Add Product",
            adminName: tokenExtracted.adminName,
            adminMail: tokenExtracted.adminEmail,
            productAddError: "Product already exists",
          });
        } else if (uploaded.success) {
          console.log("Product added successfully");
          res.status(200).json({ success: true });
        }
      }
    }
  } catch (error) {
    console.error("Error submitting the Product: ", error);
    res.status(500).render("admin/productAdd", {
      layout: "adminLayout",
      title: "Sidra Admin | Add Product",
      adminName: tokenExtracted.adminName,
      adminMail: tokenExtracted.adminEmail,
      productAddError: "Error submitting the Product",
    });
  }
};

let productListPage = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      if (tokenExtracted.role === "admin") {
        const products = await Product.find();
        res.status(200).render("admin/productList", {
          layout: "adminLayout",
          title: "Sidra Admin | Product List",
          adminName: tokenExtracted.adminName,
          adminMail: tokenExtracted.adminEmail,
          products,
        });
      }
    }
  } catch (error) {
    console.error("Error rendering the Product listing page: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error rendering the Product listing page",
    });
  }
};

let deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deleted = await helper.deleteProductHelper(productId);
    if (deleted.productNotExist) {
      console.log("Product not found in the database");
      res.status(404).send();
    } else {
      console.log("Product deleted successfully");
      res.status(204).send();
    }
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
      if (req.cookies.adminToken) {
        let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
        if (tokenExtracted.role === "admin") {
          res.status(200).render("admin/productEdit", {
            layout: "adminLayout",
            title: "Sidra Admin | Edit Product",
            adminName: tokenExtracted.adminName,
            adminMail: tokenExtracted.adminEmail,
            pageHeader: "Edit The Product",
            productId: product._id,
            productName: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description,
            images: product.images,
            mainCategory: product.category,
            subCategory: product.sub_category,
          });
        } else {
          res.render("admin/productEdit", {
            layout: "adminLayout",
            title: "Sidra Admin | Edit Product",
            pageHeader: "Edit The Product",
            productAddError: "Product Doesn't exist",
          });
        }
      }
    }
  } catch (error) {
    console.error("Error while rendering the product editing page: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error while rendering the product editing page: ",
      error,
    });
  }
};

let editProductPut = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      if (tokenExtracted.role === "admin") {
        let productId = req.params.id;

        let updated = await helper.editProductHelper(
          req.body,
          req.files,
          productId
        );

        if (updated.productNotExist) {
          console.log("Product Not exists for updating the data");
          return res.render("admin/productEdit", {
            layout: "adminLayout",
            title: "Sidra Admin | Edit Product",
            productAddError: "Product not exists for editing",
          });
        } else if (updated.success) {
          console.log("Product updated successfully");
          res.status(200).json({ success: true });
        }
      }
    }
  } catch (error) {
    console.error("Error submitting the Product: ", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
};

let orderListPage = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      const usersWithOrders = await User.find({}).populate({
        path: "orders.products.product_id",
        model: "product",
      });

      // Extract orders from each user
      const allOrders = usersWithOrders.reduce((accumulator, currentUser) => {
        accumulator.push(...currentUser.orders);
        return accumulator;
      }, []);

      res.status(200).render("admin/orderList", {
        layout: "adminLayout",
        title: "Sidra Admin | Order List",
        orders: allOrders,
      });
    } else {
      res.render("admin/signIn", { layout: false });
    }
  } catch (error) {
    console.error("Error while rendering the order list page: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error while rendering the order list page: ",
      error,
    });
  }
};

let changeStatus = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      const { orderId } = req.params;
      const { status } = req.body;

      const user = await User.findOne({ "orders._id": orderId });
      console.log(user, "hot itt");
      const order = user.orders.find(
        (order) => order._id.toString() === orderId
      );
      console.log("adad", order);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update the status of the order
      order.status = status;

      // Save the updated user
      await user.save();

      res.json({ message: `Status for order ${orderId} updated successfully` });
    } else {
      res.render("admin/signIn", { layout: false });
    }
  } catch (error) {
    console.error("Error while changing the order status: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error while changing the order status: ",
      error,
    });
  }
};

module.exports = {
  signInPage,
  signOut,
  adminHome,
  signInPost,
  usersListPage,
  userAction,
  addProductPage,
  addProductPost,
  productListPage,
  deleteProduct,
  editProductPage,
  editProductPut,
  orderListPage,
  changeStatus,
};
