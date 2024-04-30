const Product = require("../models/product");
const Admin = require("../models/admin");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const cloudinary = require("../config/cloudinary");

//Product adding helper
let addProductHelper = (productData, imageData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        ProductName,
        Price,
        Stock,
        Description,
        mainCategory,
        subCategory,
      } = productData;

      let existingProduct = await Product.findOne({
        name: ProductName,
        description: Description,
        price: Price,
      });

      if (!existingProduct) {
        const imageUrls = [];
        for (const file of imageData) {
          const result = await cloudinary.uploader.upload(file.path);
          imageUrls.push(result.secure_url);
        }
        console.log(imageUrls);

        const product = new Product({
          name: ProductName,
          description: Description,
          price: Price,
          category: mainCategory,
          sub_category: subCategory,
          stock: Stock,
          images: imageUrls,
        });
        await product.save();

        resolve({ success: true, product });
      } else {
        resolve({ productExist: true });
      }
    } catch (error) {
      reject(error);
    }
  });
};

function editProductHelper(productData, imageData, productId) {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        ProductName,
        Price,
        Stock,
        Description,
        mainCategory,
        subCategory,
      } = productData;

      const existingProduct = await Product.findById(productId);

      if (!existingProduct) {
        resolve({ productNotExist: true });
        return;
      }

      if (existingProduct) {
        existingProduct.name = ProductName;
        existingProduct.price = Price;
        existingProduct.stock = Stock;
        existingProduct.description = Description;
        existingProduct.category = mainCategory;
        existingProduct.sub_category = subCategory;

        if (imageData && imageData.length > 0) {
          for (let i = 0; i < imageData.length; i++) {
            const newImage = imageData[i];
            const oldImage = existingProduct.images[i];

            if (newImage) {
              const publicId = oldImage.split("/").pop().split(".")[0];
              await cloudinary.uploader.destroy(publicId);
              const result = await cloudinary.uploader.upload(newImage.path);
              existingProduct.images[i] = result.secure_url;
            }
          }
        }

        await existingProduct.save();
        resolve({ success: true });
      }
    } catch (error) {
      reject(error);
    }
  });
}

function deleteProductHelper(productId) {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return resolve({ productNotExist: true });
      }

      const updatedIsActive = !product.isActive;

      await Product.findByIdAndUpdate(productId, { isActive: updatedIsActive });

      return resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
}

async function getSummaryData(startDate, endDate) {
  // Query to get summary data based on the startDate and endDate
  const customersCount = await User.countDocuments();
  const ordersCount = await User.aggregate([
    {
      $unwind: "$orders",
    },
    {
      $match: {
        "orders.created_at": { $gte: startDate, $lt: endDate },
      },
    },
    {
      $count: "totalOrders",
    },
  ]);
  const totalSales = await User.aggregate([
    {
      $unwind: "$orders",
    },
    {
      $match: {
        "orders.created_at": { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$orders.total_price" },
      },
    },
  ]);
  const averageSale =
    totalSales.length > 0
      ? totalSales[0].total / ordersCount[0].totalOrders
      : 0;

  return {
    customersCount,
    ordersCount: ordersCount.length > 0 ? ordersCount[0].totalOrders : 0,
    totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
    averageSale,
  };
}

function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num;
}



module.exports = {
  addProductHelper,
  editProductHelper,
  deleteProductHelper,
  getSummaryData,
  formatNumber,
};
