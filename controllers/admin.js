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

        // Separate enabled and disabled products
        const enabledProducts = products.filter((product) => product.isActive);
        const disabledProducts = products.filter(
          (product) => !product.isActive
        );

        // Sort enabled products alphabetically by name
        enabledProducts.sort((a, b) => a.name.localeCompare(b.name));
        // Sort disabled products alphabetically by name
        disabledProducts.sort((a, b) => a.name.localeCompare(b.name));

        // Concatenate enabled and disabled products
        const sortedProducts = [...enabledProducts, ...disabledProducts];

        res.status(200).render("admin/productList", {
          layout: "adminLayout",
          title: "Sidra Admin | Product List",
          adminName: tokenExtracted.adminName,
          adminMail: tokenExtracted.adminEmail,
          sortedProducts,
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
      console.log("Product disabled successfully");
      res.status(204).send();
    }
  } catch (error) {
    console.error("Error disabling product:", error);
    res
      .status(500)
      .render("error", { errorMessage: "Error disabling product:", error });
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
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      const usersWithOrders = await User.find({}).populate({
        path: "orders.product",
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
        adminName: tokenExtracted.adminName,
        adminMail: tokenExtracted.adminEmail,
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
      const { status, orderId, reason } = req.body;

      const user = await User.findOne({ "orders._id": orderId });
      const order = user.orders.find(
        (order) => order._id.toString() === orderId
      );
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      order.status = status;

      if (status === "Cancelled" && reason) {
        order.reason = reason;
      }

      await user.save();

      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ notLoggedIn: true });
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

let couponsListPage = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      let adminId = tokenExtracted.adminId;

      let admin = await Admin.findById(adminId);

      let coupons = admin.coupons;

      res.status(200).render("admin/couponsList", {
        layout: "adminLayout",
        title: "Sidra Admin | Coupons List",
        adminName: tokenExtracted.adminName,
        adminMail: tokenExtracted.adminEmail,
        coupons,
      });
    } else {
      res.render("admin/signIn", { layout: false });
    }
  } catch (error) {
    console.error("Error while rendering the coupons list page: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error while rendering the coupons list page: ",
      error,
    });
  }
};

let couponsAddPage = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);

      res.status(200).render("admin/couponsAdd", {
        layout: "adminLayout",
        title: "Sidra Admin | Coupons Add",
        adminName: tokenExtracted.adminName,
        adminMail: tokenExtracted.adminEmail,
      });
    } else {
      res.render("admin/signIn", { layout: false });
    }
  } catch (error) {
    console.error("Error while rendering the coupons add page: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error while rendering the coupons add page: ",
      error,
    });
  }
};

let addCouponPost = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      let adminId = tokenExtracted.adminId;

      const {
        couponCode,
        cartValue,
        couponType,
        discountValue,
        couponLimit,
        startDate,
        endDate,
        couponStatus,
      } = req.body;

      // Check if the coupon code already exists
      const existingCoupon = await Admin.findOne({
        "coupons.code": couponCode,
      });
      if (existingCoupon) {
        return res.status(400).json({ couponExist: true });
      }

      // Find the admin and push the new coupon
      const admin = await Admin.findById(adminId);

      const newCoupon = {
        code: String(couponCode).toUpperCase(),
        coupon_type: String(couponType),
        discount: parseFloat(discountValue),
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        isActive: couponStatus === "active",
        max_usage: parseInt(couponLimit),
        min_cart_value: parseFloat(cartValue),
      };

      admin.coupons.push(newCoupon);
      await admin.save();

      res.status(200).json({ success: true });
    } else {
      res.render("admin/signIn", { layout: false });
    }
  } catch (error) {
    console.error("Error while submitting the coupon: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error while submitting the coupon: ",
      error,
    });
  }
};

let deleteCoupon = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      let adminId = tokenExtracted.adminId;

      let couponId = req.params.id;

      const admin = await Admin.findByIdAndUpdate(
        adminId,
        { $pull: { coupons: { _id: couponId } } },
        { new: true }
      );

      if (!admin) {
        return res.status(404).json({ success: false });
      }

      res.status(200).json({ success: true });
    } else {
      res.render("admin/signIn", { layout: false });
    }
  } catch (error) {
    console.error("Error removing the coupon: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error removing the coupon: ",
      error,
    });
  }
};

let couponEditModal = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      let adminId = tokenExtracted.adminId;

      const { id } = req.params;

      const admin = await Admin.findById(adminId);

      if (!admin) {
        return res.status(404).json({ adminNotExist: true });
      }

      const coupon = admin.coupons.id(id);

      if (!coupon) {
        return res.status(404).json({ couponNotExist: true });
      }

      res.status(200).json(coupon);
    } else {
      res.render("admin/signIn", { layout: false });
    }
  } catch (error) {
    console.error("Error opening the coupon edit modal: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error opening the coupon edit modal: ",
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
  couponsListPage,
  couponsAddPage,
  addCouponPost,
  deleteCoupon,
  couponEditModal,
};
