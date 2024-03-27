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

document.addEventListener("DOMContentLoaded", () => {
  const minusButtons = document.querySelectorAll(".quantity-minus");
  const plusButtons = document.querySelectorAll(".quantity-plus");

  minusButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const inputField = button.parentElement.querySelector(
        'input[type="number"]'
      );
      const cartId = button
        .closest(".product_quantity")
        .querySelector(".cartId").value;
      const newQuantity = Math.max(parseInt(inputField.value) - 1, 1);
      if (newQuantity < inputField.value) {
        await updateQuantity(cartId, newQuantity);
        inputField.value = newQuantity;
      } else {
        showToast("Minimum quantity reached");
      }
      inputField.value = newQuantity;
    });
  });

  plusButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const inputField = button.parentElement.querySelector(
        'input[type="number"]'
      );
      const cartId = button
        .closest(".product_quantity")
        .querySelector(".cartId").value;
      const newQuantity = parseInt(inputField.value) + 1;
      await updateQuantity(cartId, newQuantity);
      inputField.value = newQuantity;
    });
  });

  async function updateQuantity(cartId, newQuantity) {
    try {
      const response = await axios.post("/cart/updateQuantity", {
        cartId: cartId,
        newQuantity: newQuantity,
      });

      if (response.status === 200) {
        const data = response.data;

        if (data.productNotExist) {
          showToast("Product not exist");
        } else if (data.failed) {
          showToast("Failed to update the quantity");
        } else if (data.success) {
          showToast("Quantity updated");
        }
      } else {
        console.error("Unexpected response from the server: ", response);
      }
    } catch (error) {
      console.error("Error updating quantity: ", error);
    }
  }
});
