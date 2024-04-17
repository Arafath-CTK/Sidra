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
      } else if (data.notLogged) {
        showToast("You are not logged in");
        setTimeout(function () {
          window.location.href = "/signIn";
        }, 1500);
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

document
  .getElementById("applyFilterBtn")
  .addEventListener("click", async () => {
    try {
      const selectedSubcategories = [];
      const subcategoryCheckboxes = document.querySelectorAll(
        ".sub_categories input[type='checkbox']"
      );
      subcategoryCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          selectedSubcategories.push(checkbox.value);
        }
      });
      if (selectedSubcategories.length === 0) {
        selectedSubcategories.push("");
      }

      const selectedCategories = [];
      const categoryCheckboxes = document.querySelectorAll(
        ".main_categories input[type='checkbox']"
      );
      categoryCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          selectedCategories.push(checkbox.value);
        }
      });
      if (selectedCategories.length === 0) {
        selectedCategories.push("");
      }

      // Get the selected price range
      const priceRange = document.getElementById("amount").value;

      // Extracting price range in the format required by the backend
      const [minPrice, maxPrice] = priceRange.split(" - ");
      const formattedPriceRange = `${minPrice.replace(
        "₹",
        ""
      )}-${maxPrice.replace("₹", "")}`;

      // Construct the URL with query parameters
      const filteredURL = `/shop/filter?categories=${selectedCategories.join(
        ","
      )}&subcategories=${selectedSubcategories.join(
        ","
      )}&price=${formattedPriceRange}`;

      // Navigate to the filtered page
      window.location.href = filteredURL;
    } catch (error) {
      console.error("Error applying filter: ", error);
      // Handle error as needed
    }
  });

// Function to handle category and subcategory selection
function handleCategorySelection(categoryName, subcategoryNames) {
  const categoryCheckbox = document.querySelector(
    `input[name="${categoryName}"]`
  );
  const subcategoryCheckboxes = document.querySelectorAll(
    `input[name="${subcategoryNames}"]`
  );

  categoryCheckbox.addEventListener("change", function () {
    if (this.checked) {
      subcategoryCheckboxes.forEach((subcategoryCheckbox) => {
        subcategoryCheckbox.checked = true;
      });
    } else {
      subcategoryCheckboxes.forEach((subcategoryCheckbox) => {
        subcategoryCheckbox.checked = false;
      });
    }
  });

  subcategoryCheckboxes.forEach((subcategoryCheckbox) => {
    subcategoryCheckbox.addEventListener("change", function () {
      if (this.checked) {
        categoryCheckbox.checked = true;
      } else {
        // If all subcategories of this category are unchecked, uncheck the category
        if (
          !Array.from(subcategoryCheckboxes).some(
            (checkbox) => checkbox.checked
          )
        ) {
          categoryCheckbox.checked = false;
        }
      }
    });
  });
}
handleCategorySelection("category_plants", "subcategory_plants");
handleCategorySelection("category_pots", "subcategory_pots");
handleCategorySelection("category_supplies", "subcategory_supplies");

// Function to prefill selected filters
function prefillFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const categories = urlParams.get("categories");
  const subcategories = urlParams.get("subcategories");
  const priceRange = urlParams.get("price");

  if (categories) {
    const categoryArray = categories.split(",");
    categoryArray.forEach((category) => {
      const checkbox = document.querySelector(`input[value="${category}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  if (subcategories) {
    const subcategoryArray = subcategories.split(",");
    subcategoryArray.forEach((subcategory) => {
      const checkbox = document.querySelector(`input[value="${subcategory}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  }

  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split("-");
    document.getElementById("amount").value = `₹${minPrice}-${maxPrice}`;

    // Update the slider range values
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 5000,
      values: [parseInt(minPrice), parseInt(maxPrice)],
      slide: function (event, ui) {
        $("#amount").val("\u20B9" + ui.values[0] + " - \u20B9" + ui.values[1]);
      },
    });
  }
}
window.addEventListener("DOMContentLoaded", prefillFilters);
