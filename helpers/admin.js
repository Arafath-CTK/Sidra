const Product = require("../models/product");
const Admin = require("../models/admin");
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
        resolve({ success: true});
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

      for (const image of product.images) {
        const publicId = image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      await Product.findByIdAndDelete(productId);
      return resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { addProductHelper, editProductHelper, deleteProductHelper };
