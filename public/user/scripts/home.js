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

async function addToWishlist(icon, productId) {
  try {
    const response = await axios.post(`/addtowishlist/${productId}`);

    if (response.status === 200) {
      const data = response.data;

      if (data.success) {
        // Product added to wishlist successfully
        icon.style.display = "none";
        const wishlistIcons =
          icon.parentElement.parentElement.querySelectorAll(".wishlist");
        wishlistIcons.forEach((wishlistIcon) => {
          if (wishlistIcon !== icon) {
            wishlistIcon.style.display = "inline-block";
          }
        });
        showToast("Product added to the wishlist");
      } else {
        // Unexpected response from server
        console.error("Unexpected response:", response);
      }
    } else {
      console.error("Failed to add product to wishlist");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function removeFromWishlist(icon, productId) {
  try {
    const response = await axios.delete(`/removeFromWishlist/${productId}`);

    if (response.status === 200) {
      const data = response.data;

      if (data.userNotExist) {
        // Product already exists in wishlist
        showToast("Can't find the user");
      } else if (data.success) {
        // Product added to wishlist successfully
        icon.style.display = "none";
        const wishlistIcons =
          icon.parentElement.parentElement.querySelectorAll(".wishlist");
        wishlistIcons.forEach((wishlistIcon) => {
          if (wishlistIcon !== icon) {
            wishlistIcon.style.display = "block";
          }
        });
        showToast("Product removed from the wishlist");
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
