const helper = require("../helpers/admin");
const Admin = require("../models/admin");
const User = require("../models/user");
const Product = require("../models/product");
const JWT = require("../middlewares/jwt");
const bcrypt = require("bcrypt");
const moment = require("moment");
const puppeteer = require("puppeteer");
const { createObjectCsvWriter } = require("csv-writer");

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

      // Get today's date
      const today = new Date();
      // Set hours, minutes, seconds, and milliseconds to 0
      today.setHours(0, 0, 0, 0);

      // Get the start of the week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - today.getDay());

      // Get the start of the month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Query for today's data
      const todayData = await helper.getSummaryData(today, new Date());

      // Query for this week's data
      const weekData = await helper.getSummaryData(startOfWeek, new Date());

      // Query for this month's data
      const monthData = await helper.getSummaryData(startOfMonth, new Date());

      return res.render("admin/dashboard", {
        layout: "adminLayout",
        title: "Sidra Admin | Dashboard",
        adminName: tokenExtracted.adminName,
        adminMail: tokenExtracted.adminEmail,
        todayData: {
          customersCount: helper.formatNumber(todayData.customersCount),
          ordersCount: helper.formatNumber(todayData.ordersCount),
          totalSales: helper.formatNumber(todayData.totalSales),
          averageSale: helper.formatNumber(todayData.averageSale),
        },
        weekData: {
          customersCount: helper.formatNumber(weekData.customersCount),
          ordersCount: helper.formatNumber(weekData.ordersCount),
          totalSales: helper.formatNumber(weekData.totalSales),
          averageSale: helper.formatNumber(weekData.averageSale),
        },
        monthData: {
          customersCount: helper.formatNumber(monthData.customersCount),
          ordersCount: helper.formatNumber(monthData.ordersCount),
          totalSales: helper.formatNumber(monthData.totalSales),
          averageSale: helper.formatNumber(monthData.averageSale),
        },
      });
    }
    return res.redirect("/admin/signIn");
  } catch (error) {
    res.render("error", { layout: false, errorMessage: error });
  }
};

let dashboardData = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      const startDate = moment()
        .subtract(11, "months")
        .startOf("month")
        .toDate();

      const ordersData = await User.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders.created_at": { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $month: "$orders.created_at" },
            count: { $sum: 1 },
          },
        },
      ]);

      const months = [];
      const ordersCount = [];
      const currentMonth = moment().month();
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentMonth + i - 11) % 12;
        const monthName = moment().month(monthIndex).format("MMM"); // Get abbreviated month name
        const monthData = ordersData.find(
          (data) => data._id === monthIndex + 1
        ); // Find data for the current month
        months.push(monthName);
        ordersCount.push(monthData ? monthData.count : 0); // Push orders count for the current month or 0 if no data found
      }

      const categoryOrders = await User.aggregate([
        { $unwind: "$orders" },
        {
          $lookup: {
            from: "product",
            localField: "orders.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            count: { $sum: 1 },
          },
        },
      ]);

      // Prepare data for the donut chart
      const categories = categoryOrders.map((category) => category._id);
      const categoryCount = categoryOrders.map((category) => category.count);

      // Send the data to the client
      res.json({ months, ordersCount, categories, categoryCount });
    } else {
      return res.redirect("/admin/signIn");
    }
  } catch (error) {
    res.render("error", { layout: false, errorMessage: error });
  }
};

let generateReport = async (req, res) => {
  try {
    const { fromDate, toDate, format } = req.body;
    console.log(fromDate, toDate, format);

    // Fetch orders within the selected date range
    const orders = await User.aggregate([
      {
        $match: {
          "orders.created_at": {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          },
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $match: {
          "orders.created_at": {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          },
        },
      },
      {
        $lookup: {
          from: "product",
          localField: "orders.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: 0,
          "User Name": "$name",
          Email: "$email",
          "Order Name": "$orders.name",
          "Product Name": "$product.name",
          Quantity: "$orders.quantity",
          Price: "$orders.price",
          "Total Price": "$orders.total_price",
          Address: "$orders.address",
          "Payment Status": "$orders.payment_status",
          "Order Status": "$orders.status",
          "Created At": "$orders.created_at",
        },
      },
    ]);

    if (format === "csv") {
      // Write data to CSV file
      const csvWriter = createObjectCsvWriter({
        path: "sales_report.csv",
        header: [
          { id: "User Name", title: "User Name" },
          { id: "Email", title: "Email" },
          { id: "Order Name", title: "Order Name" },
          { id: "Product Name", title: "Product Name" },
          { id: "Quantity", title: "Quantity" },
          { id: "Price", title: "Price" },
          { id: "Total Price", title: "Total Price" },
          { id: "Address", title: "Address" },
          { id: "Payment Status", title: "Payment Status" },
          { id: "Order Status", title: "Order Status" },
          { id: "Created At", title: "Created At" },
        ],
      });
      await csvWriter.writeRecords(orders);
      res.download("sales_report.csv");
    } else if (format === "pdf") {
      // Generate PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const content = `
        <html>
          <head><title>Sales Report</title></head>
          <body>
            <h1>Sales Report</h1>
            <table border="1">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Order Name</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Price</th>
                  <th>Address</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${orders
                  .map(
                    (order) => `
                  <tr>
                    <td>${order["User Name"]}</td>
                    <td>${order["Email"]}</td>
                    <td>${order["Order Name"]}</td>
                    <td>${order["Product Name"]}</td>
                    <td>${order["Quantity"]}</td>
                    <td>${order["Price"]}</td>
                    <td>${order["Total Price"]}</td>
                    <td>${order["Address"]}</td>
                    <td>${order["Payment Status"]}</td>
                    <td>${order["Order Status"]}</td>
                    <td>${order["Created At"]}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;
      await page.setContent(content);
      const pdfBuffer = await page.pdf();
      await browser.close();
      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": `attachment; filename="sales_report.pdf"`,
      });
      res.send(pdfBuffer);
    } else {
      res.status(400).send("Invalid format specified.");
    }
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
        const product = await Product.findById(order.product);

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }

        // Increment the product quantity
        await Product.findByIdAndUpdate(order.product, {
          $inc: { stock: order.quantity },
        });

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

let couponAddPost = async (req, res) => {
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

let couponEditPost = async (req, res) => {
  try {
    if (req.cookies.adminToken) {
      let tokenExtracted = await JWT.verifyAdmin(req.cookies.adminToken);
      let adminId = tokenExtracted.adminId;

      const {
        couponId,
        couponCode,
        cartValue,
        couponType,
        discountValue,
        couponLimit,
        startDate,
        endDate,
        couponStatus,
      } = req.body;

      const couponExists = await Admin.exists({
        "coupons.code": couponCode,
        _id: { $ne: adminId },
      });

      if (couponExists) {
        return res.status(400).json({ couponExists: true });
      }

      let admin = await Admin.findById(adminId);

      const couponIndex = admin.coupons.findIndex(
        (coupon) => coupon._id.toString() === couponId
      );

      if (couponIndex !== -1) {
        admin.coupons[couponIndex].code = couponCode;
        admin.coupons[couponIndex].coupon_type = couponType;
        admin.coupons[couponIndex].discount = discountValue;
        admin.coupons[couponIndex].start_date = startDate;
        admin.coupons[couponIndex].end_date = endDate;
        admin.coupons[couponIndex].isActive = couponStatus === "active";
        admin.coupons[couponIndex].max_usage = couponLimit;
        admin.coupons[couponIndex].min_cart_value = cartValue;

        await admin.save();

        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ couponNotExist: true });
      }
    } else {
      res.render("admin/signIn", { layout: false });
    }
  } catch (error) {
    console.error("Error while editing the coupon: ", error);
    res.status(500).render("error", {
      layout: false,
      errorMessage: "Error while editing the coupon: ",
      error,
    });
  }
};

module.exports = {
  signInPage,
  signOut,
  adminHome,
  dashboardData,
  generateReport,
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
  couponAddPost,
  deleteCoupon,
  couponEditModal,
  couponEditPost,
};
