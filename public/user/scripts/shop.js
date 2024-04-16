// Function to check wishlist status for each product and initialize on page load
async function initializeWishlistStatus() {
  try {
    const wishlistAddElements = document.querySelectorAll(".wishlistAdd");
    const wishlistRemoveElements = document.querySelectorAll(".wishlistRemove");

    for (let index = 0; index < wishlistAddElements.length; index++) {
      const wishlistAddElement = wishlistAddElements[index];
      const wishlistRemoveElement = wishlistRemoveElements[index];
      const productId = wishlistAddElement
        .closest(".single_product")
        .querySelector("#productId").value;

      const response = await fetch(`/checkwishlist/${productId}`);
      const data = await response.json();

      if (data.wishlisted) {
        wishlistAddElement.classList.add("d-none");
        wishlistRemoveElement.classList.remove("d-none");
      } else {
        wishlistAddElement.classList.remove("d-none");
        wishlistRemoveElement.classList.add("d-none");
      }
    }
  } catch (error) {
    console.error("Error occurred while initializing wishlist status:", error);
  }
}

// Call the initialization function on page load
document.addEventListener("DOMContentLoaded", initializeWishlistStatus);

async function addToWishlist(icon, productId) {
  try {
    const response = await axios.post(`/addtowishlist/${productId}`);

    if (response.status === 200) {
      const data = response.data;

      if (data.success) {
        // Product added to wishlist successfully
        icon
          .closest(".single_product")
          .querySelector(".wishlistAdd")
          .classList.add("d-none");
        icon
          .closest(".single_product")
          .querySelector(".wishlistRemove")
          .classList.remove("d-none");
        showToast("Product added to the wishlist");
      } else {
        // Unexpected response from server
        console.error("Unexpected response:", response);
      }
    } else if (response.status === 302) {
      window.location.href = response.headers.location;
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
        icon
          .closest(".single_product")
          .querySelector(".wishlistAdd")
          .classList.remove("d-none");
        icon
          .closest(".single_product")
          .querySelector(".wishlistRemove")
          .classList.add("d-none");
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

// Get all category and subcategory links
const categoryLinks = document.querySelectorAll(".widget_categories a");

// Add click event listeners to category and subcategory links
categoryLinks.forEach((link) => {
  link.addEventListener("click", function (event) {
    // Prevent the default action of the link
    event.preventDefault();

    // Remove the 'active' class from all category and subcategory links
    categoryLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // Add the 'active' class to the clicked link and its parent category link
    this.classList.add("active");
    const parentCategoryLink = this.closest(
      ".widget_sub_categories"
    ).querySelector("a");
    if (parentCategoryLink) {
      parentCategoryLink.classList.add("active");
    }
  });
});

document
  .getElementById("applyFilterBtn")
  .addEventListener("click", function () {
    const activeLink = document.querySelector(".widget_categories .active a");
    const selectedCategory = activeLink ? activeLink.dataset.category : null;

    const activeSubcategoryLink = document.querySelector(
      ".widget_dropdown_categories .active a"
    );
    const selectedSubcategory = activeSubcategoryLink
      ? activeSubcategoryLink.dataset.subcategory
      : null;

    const priceRange = document.getElementById("amount").value;

    console.log(selectedCategory);

    // Construct the URL with selected filters
    let url = `/shop/filter?`;
    if (selectedCategory) url += `category=${selectedCategory}&`;
    if (selectedSubcategory) url += `subcategory=${selectedSubcategory}&`;
    if (priceRange) url += `price=${priceRange}`;

    window.location.href = url;
  });
