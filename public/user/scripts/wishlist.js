function showToast(message) {
  // Display toast message using Toastify library
  Toastify({
    text: message,
    duration: 3000, // Duration in milliseconds
    gravity: "bottom", // Position of the toast message
    position: "center",
    backgroundColor: "black", // Background color of the toast
  }).showToast();
}

async function removeFromWishlist(productId) {
  try {
    const response = await axios.delete(`/removeFromWishlist/${productId}`);
    if (response.status === 200) {
      const data = response.data;
      console.log(data);
      if (data.userNotExist) {
        // Product already exists in wishlist
        showToast("Can't find the user");
      } else if (data.success) {
        showToast("Product removed from wishlist successfully");
        await new Promise((resolve) => setTimeout(resolve, 1200));
        window.location.reload();
      } else {
        // Unexpected response from server
        console.error("Unexpected response:", response);
      }
    } else {
      console.error("Failed to remove product from wishlist");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
