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
  const productCheckboxes = document.querySelectorAll(".product_checkbox");
  const quantityInputs = document.querySelectorAll(
    '.product_quantity input[type="text"]'
  );
  calculateCartTotals();

  minusButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const inputField =
        button.parentElement.querySelector('input[type="text"]');
      const cartId = button
        .closest(".product_quantity")
        .querySelector(".cartId").value;
      const newQuantity = Math.max(parseInt(inputField.value) - 1, 1);
      if (newQuantity < inputField.value) {
        await updateQuantity(cartId, newQuantity);
        inputField.value = newQuantity;
        updateTotalPrice(button.closest("tr"), newQuantity);
        calculateCartTotals();
      } else {
        showToast("Minimum quantity reached");
      }
    });
  });

  plusButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const inputField =
        button.parentElement.querySelector('input[type="text"]');
      const cartId = button
        .closest(".product_quantity")
        .querySelector(".cartId").value;
      const newQuantity = parseInt(inputField.value) + 1;
      await updateQuantity(cartId, newQuantity);
      inputField.value = newQuantity;
      updateTotalPrice(button.closest("tr"), newQuantity);
      calculateCartTotals();
    });
  });

  productCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", async () => {
      const cartId = checkbox.closest("tr").querySelector(".cartId").value;
      const isSelected = checkbox.checked;

      try {
        const response = await axios.put(`/cart/updateSelected/${cartId}`, {
          isSelected,
        });

        if (response.status === 200) {
          const data = response.data;

          if (data.productNotExist) {
            showToast("Product not exist");
          } else if (data.failed) {
            showToast("Failed to select the product");
          } else if (data.success) {
            showToast("Product selected");
            calculateCartTotals();
          }
        } else {
          console.error("Unexpected response from the server: ", response);
        }
      } catch (error) {
        console.error("Error updating isSelected:", error);
      }
    });
  });

  quantityInputs.forEach((quantityInput) => {
    quantityInput.addEventListener("change", () => {
      const rowElement = quantityInput.closest("tr");
      const newQuantity = parseInt(quantityInput.value);
      updateTotalPrice(rowElement, newQuantity);
      calculateCartTotals();
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

  function updateTotalPrice(rowElement, newQuantity) {
    const priceElement = rowElement.querySelector(".product-price");
    const totalPriceElement = rowElement.querySelector(".product_total");
    const price = parseFloat(priceElement.textContent); // Get the product price
    const totalPrice = price * newQuantity; // Calculate new total price
    totalPriceElement.textContent = totalPrice; // Update the total price in the HTML
  }

  function calculateCartTotals() {
    let subtotal = 0;
    // let shippingCharge = 50;

    productCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const productPriceElement = checkbox
          .closest("tr")
          .querySelector(".product-price"); // Assuming price is within the same row as checkbox
        if (productPriceElement) {
          // Check if the element exists
          const productPrice = parseFloat(productPriceElement.textContent);
          const productQuantity = parseInt(
            checkbox
              .closest("tr")
              .querySelector('.product_quantity input[type="text"]').value
          );
          subtotal += productPrice * productQuantity;
        } else {
          console.error(
            "Product price element not found for selected checkbox!"
          ); // Handle missing element
        }
      }
    });

    // if (subtotal > 500) {
    //   shippingCharge = 0;
    // }

    const total = subtotal;

    document.getElementById("subTotal").textContent = subtotal;
    // document.getElementById("shipping").textContent = shippingCharge;
    document.getElementById("total").textContent = total;
  }
});
