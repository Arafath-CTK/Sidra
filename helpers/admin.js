const Product = require("../models/product"); 
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
  return new Promise((resolve, reject) => {
    try {
       
    } catch (error) {
      rejrct(error)
    }
  })
}

module.exports = { addProductHelper, editProductHelper };
