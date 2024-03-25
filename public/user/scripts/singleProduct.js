// async function addToWishlist(productId) {
//   try {
//     const response = await axios.post(`/addtowishlist/${productId}`);
//     if (response.status === 200) {
//       const data = response.data;
//       console.log(data);
//       if (data.productExist) {
//         // Product already exists in wishlist
//         showToast("Product already exists in wishlist");
//       } else if (data.success) {
//         // Product added to wishlist successfully
//         showToast("Product added to wishlist successfully");
//       } else {
//         // Unexpected response from server
//         console.error("Unexpected response:", response);
//       }
//     } else {
//       console.error("Failed to add product to wishlist");
//     }
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// }

// function showToast(message) {
//   // Display toast message using Toastify library
//   Toastify({
//     text: message,
//     duration: 3000, // Duration in milliseconds
//     gravity: "bottom", // Position of the toast message
//     position: "center",
//     backgroundColor: "black", // Background color of the toast
//   }).showToast();
// }
