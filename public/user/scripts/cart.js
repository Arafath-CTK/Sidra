// const { default: axios } = require("axios");

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

async function removeProduct(id) {
  try {
    const response = await axios.delete(`/cart/remove/${id}`);
    if (response.status === 200) {
      const data = response.data;
      console.log(data);

      if (data.userNotExist) {
        showToast("Can't find the user");
      } else if (data.notLogged) {
        showToast("You are not logged in");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.href = "/signin";
      } else if (data.success) {
        showToast("Product removed from the Cart");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.reload();
      }
    } else {
      console.error("Unexpected response from the server: ", response);
    }
  } catch (error) {
    console.error("Error: ", error.message);
  }
}
