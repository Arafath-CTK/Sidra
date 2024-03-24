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

function submitForm() {
  let productName = document.getElementById("productName").value.trim();
  let price = document.getElementById("price").value.trim();
  let stockQuantity = document.getElementById("stockQuantity").value.trim();
  let description = document.getElementById("description").value.trim();
  let mainCategory = document.getElementById("categorySelect").value.trim();
  let subCategory = document.getElementById("subCategorySelect").value.trim();
  let images = document.getElementById("images").files;

  if (
    productName === "" ||
    price === "" ||
    stockQuantity === "" ||
    description === "" ||
    mainCategory === "" ||
    subCategory === "" ||
    images.length !== 3 // Check if exactly 3 images are uploaded
  ) {
    document.getElementById("Errormessage").textContent =
      "Please fill all input fields and upload exactly three images";
    return false;
  } else {
    // Check image file types
    const allowedExtensions = ["jpg", "jpeg", "png"];
    for (let i = 0; i < images.length; i++) {
      let extension = images[i].name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        document.getElementById("Errormessage").textContent =
          "Please upload images only (jpg, jpeg, png)";
        return false;
      }
    }

    document.getElementById("Errormessage").textContent = "";
    showSpinner();

    // Get form data
    const formData = new FormData(document.getElementById("addProduct"));

    // Make fetch request
    fetch("/admin/addProduct", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Form submitted successfully");
          // Show SweetAlert notification after successful form submission
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Product added successfully!",
          }).then(() => {
            // Redirect to product list page after closing the SweetAlert notification
            window.location.href = "/admin/listproduct";
          });
        } else {
          console.error("Form submission failed");
        }
        hideSpinner();
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        hideSpinner();
      });
  }
}
