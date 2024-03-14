const { response } = require("express");

function deleteProduct(productId) {
  fetch(`/admin/products/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      } // Handle success const
      console.log("product deleted successfully");
      location.reload();
    })
    .catch((error) => {
      console.error("There was a problem with your fetch operation: ", error);
    });
}

function editProduct(productId) {
  location.href = `/admin/editProduct/${productId}`
}

// function editProduct(productId) {
//   fetch(`/admin/products/${productId}`, {
//     method: "PUT",
//   })
//     .then((response) => {
//       if (!response) {
//         throw new Error("Network response was not ok");
//       }
//       console.log("poduct edited successfully");
//       location.redirect("/admin/listProduct");
//     })
//     .catch((error) => {
//       console.error("There was a problem with your fetch operation: ", error);
//     });
// }
