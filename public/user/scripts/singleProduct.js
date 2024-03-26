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

window.onload = async function () {
  let productId = document.getElementById("productId").value;
  try {
    let wishlisted = await axios.get(`/checkwishlist/${productId}`);
    const data = wishlisted.data;
    if (data.wishlisted) {
      document.getElementById("addWishlist").style.display = "none";
      document.getElementById("removeWishlist").style.display = "block";
    } else {
      document.getElementById("addWishlist").style.display = "block";
      document.getElementById("removeWishlist").style.display = "none";
    }
  } catch (error) {
    console.error("Error checking wishlist status:", error);
  }
};

async function addToWishlist(productId) {
  try {
    const response = await axios.post(`/addtowishlist/${productId}`);
    if (response.status === 200) {
      const data = response.data;

      if (data.success) {
        // Product added to wishlist successfully
        document.getElementById("addWishlist").style.display = "none";
        document.getElementById("removeWishlist").style.display = "block";
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

async function removeFromWishlist(productId) {
  try {
    const response = await axios.delete(`/removeFromWishlist/${productId}`);
    if (response.status === 200) {
      const data = response.data;

      if (data.userNotExist) {
        // Product already exists in wishlist
        showToast("Can't find the user");
      } else if (data.success) {
        // Product added to wishlist successfully
        document.getElementById("addWishlist").style.display = "block";
        document.getElementById("removeWishlist").style.display = "none";
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

async function addToCart(productId) {
  try {
    let productId = document.getElementById("productId").value;
    let quantity = document.getElementById("qty").value;

    const response = await axios.post("/addtocart/", {
      productId,
      quantity,
    });
    if (response.status === 200) {
      const data = response.data;

      if (data.productExist) {
        showToast("Product exists in the Cart");
      } else if (data.success) {
        showToast("Product added to the Cart");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.href = "/cart";
      } else {
        console.error("Unexpected response:", response);
      }
    } else {
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
