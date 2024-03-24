// Function to show the spinner and overlay
function showSpinner() {
  document.getElementById("spinner").style.display = "block";
  document.getElementById("spinnerOverlay").style.display = "block";
}

// Function to hide the spinner and overlay
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.getElementById("spinnerOverlay").style.display = "none";
}

function selectCategory(category) {
  var subCategoryDiv = document.getElementById("subCategoryDiv");
  var subCategorySelect = document.getElementById("subCategorySelect");
  subCategorySelect.innerHTML = ""; // Clearing previous options

  if (category === "") {
    subCategoryDiv.style.display = "none";
    return;
  }

  subCategoryDiv.style.display = "block";

  // Add a placeholder option for "Select Subcategory"
  addOption(subCategorySelect, "", "Select Subcategory");
  subCategorySelect.selectedIndex = 0; // Select the placeholder option

  switch (category) {
    case "plants":
      addOption(subCategorySelect, "indoor", "Indoor");
      addOption(subCategorySelect, "outdoor", "Outdoor");
      addOption(subCategorySelect, "flowering", "Flowering");
      break;
    case "pots":
      addOption(subCategorySelect, "clay", "Clay");
      addOption(subCategorySelect, "plastic", "Plastic");
      addOption(subCategorySelect, "ceramic", "Ceramic");
      break;
    case "supplies":
      addOption(subCategorySelect, "fertilizers", "Fertilizers And Pesticides");
      addOption(subCategorySelect, "tools", "Planting Tools");
      addOption(subCategorySelect, "accessories", "Accessories");
      break;
    default:
      subCategoryDiv.style.display = "none";
  }
}

function addOption(select, value, text) {
  var option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  select.appendChild(option);
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
  let mainCategory = document.getElementById("categorySelect").value.trim();
  let subCategory = document.getElementById("subCategorySelect").value.trim();

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
    showSpinner();

    const formData = new FormData($("#editProduct")[0]);
    const productId = $("#editProduct").data("product-id");

    fetch(`/admin/editProduct/${productId}`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Product updated successfully");
          // Show SweetAlert notification after successful form submission
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Product updated successfully!",
          }).then(() => {
            // Redirect to product list page after closing the SweetAlert notification
            window.location.href = "/admin/listproduct";
          });
        } else {
          console.error("Failed to update product:", data.message);
          document.getElementById("Errormessage").textContent =
            "Failed to update product. Please try again later.";
        }
        hideSpinner();
      })
      .catch((error) => {
        console.error("Error submitting the Product: ", error);
        document.getElementById("Errormessage").textContent =
          "Failed to update product. Please try again later.";
        hideSpinner();
      });
  }
}
