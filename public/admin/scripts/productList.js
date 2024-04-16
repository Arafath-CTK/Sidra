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

function disableProduct(productId, action) {
  showSpinner();
  let message = action === "disable" ? "Product disabled successfully!" : "Product enabled successfully!";
  fetch(`/admin/products/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: message,
        }).then(() => {
          location.reload();
        });
      } else {
        console.error("Product action failed");
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
