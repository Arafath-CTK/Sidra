const { response } = require("express");

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

function deleteProduct(productId) {
  showSpinner();
  fetch(`/admin/products/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        console.log("Product deleted successfully");
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product deleted successfully!",
        }).then(() => {
          location.reload();
        });
      } else {
        console.error("Product deletion failed");
      }
      hideSpinner()
    })
    .catch((error) => {
      console.error("There was a problem with your fetch operation: ", error);
    });
}

function editProduct(productId) {
  location.href = `/admin/editProduct/${productId}`;
}
