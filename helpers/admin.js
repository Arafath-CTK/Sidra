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

module.exports = { addProductHelper };

// try {
//   let existingProduct = await Product.findOne({
//     name: ProductName,
//     description: Description,
//     price: Price,
//   });

//   if (!existingProduct) {
//     const uploadedImages = [];

//     for (const imageField of [image1, image2, image3]) {
//       if (imageField) {
//         // Check if the image field is not empty
//         const image = imageData[imageField]; // Access the image file using the destructured field name
//         if (image) {
//           const result = await cloudinary.uploader.upload(image.path);
//           uploadedImages.push(result.secure_url);
//         }
//       }
//     }

//     // for (const imageField in images) {
//     //   const image = imageData?.[imageField];
//     //   if (image) {
//     //     const result = await cloudinary.uploader.upload(image.path);
//     //     console.log(result);
//     //     uploadedImages.push(result.secure_url);
//     //   }
//     // }

//     const product = new Product({
//       name: ProductName,
//       description: Description,
//       price: Price,
//       category: mainCategory,
//       sub_category: subCategory,
//       stock: Stock,
//       images: uploadedImages,
//     });

//     await product.save();

//     resolve({ success: true, product });
//   } else {
//     resolve({ productExist: true });
//   }
// } catch (error) {
//   reject(error);
// }
