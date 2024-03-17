function selectCategory(main, sub) {
  document.getElementById("mainCategory").value = main;
  document.getElementById("subCategory").value = sub;

  // Remove 'active' class from all sub-category links
  var allSubLinks = document.querySelectorAll(".category-list .sub-category a");
  allSubLinks.forEach(function (link) {
    link.classList.remove("active");
  });

  // Add 'active' class to the clicked sub-category link
  var clickedLink = document.querySelector(
    '.category-list li[value="' + main + '"] ul li[value="' + sub + '"] a'
  );
  clickedLink.classList.add("active");
}

// Function to update the value of the hidden input based on the image input
function updateImageIndex(input) {
  const container = input.parentElement;
  const hiddenInput = container.querySelector('input[name="imageIndexes[]"]');
  if (hiddenInput) {
    // Get the index of the image input relative to its container
    const index = Array.from(container.parentNode.children).indexOf(container);
    hiddenInput.value = index;
  }
}

function validateForm() {
  let productName = document.getElementById("productName").value.trim();
  let price = document.getElementById("price").value.trim();
  let stockQuantity = document.getElementById("stockQuantity").value.trim();
  let description = document.getElementById("description").value.trim();
  let mainCategory = document.getElementById("mainCategory").value.trim();
  let subCategory = document.getElementById("subCategory").value.trim();

  if (
    productName === "" ||
    price === "" ||
    stockQuantity === "" ||
    mainCategory === "" ||
    subCategory === "" ||
    description === ""
  ) {
    document.getElementById("Errormessage").textContent =
      "Please fill all Input-fields";
    return false;
  } else {
    document.getElementById("Errormessage").textContent = "";

    const formData = new FormData($("#editProduct")[0]);
    const productId = $("#editProduct").data("product-id");

    fetch(`/admin/editProduct/${productId}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Product updated successfully");
          // Redirect to the specified URL
          window.location.href = "/admin/listProduct";
        } else {
          console.error("Failed to update product:", data.message);
          document.getElementById("Errormessage").textContent =
            "Failed to update product. Please try again later.";
        }
      })
      .catch((error) => {
        console.error("Error submitting the Product: ", error);
        document.getElementById("Errormessage").textContent =
          "Failed to update product. Please try again later.";
      });
  }
}
