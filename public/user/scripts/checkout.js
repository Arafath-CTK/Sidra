document.addEventListener("DOMContentLoaded", function () {
  const cashOnDeliveryRadio = document.getElementById("cashOnDelivery");
  const prepaidRadio = document.getElementById("prepaid");
  const orderButton = document.getElementById("orderButton");

  // Function to handle "Place Order" button click
  function placeOrder() {
    // Get the selected address from the dropdown
    const addressDropdown = document.getElementById("addressDropdown");
    const selectedAddressId = addressDropdown.value;

    // Get the total price from the checkout summary
    const totalPrice = parseFloat(
      document.getElementById("totalPrice").textContent
    );

    // Send the data to the server
    axios
      .post("/placeOrder", {
        addressId: selectedAddressId,
        totalPrice: totalPrice,
      })
      .then((response) => {
        console.log("Order placed successfully:", response.data);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Order placed successfully",
        }).then(() => {
          window.location.href = "/myAccount/#orders";
        });
        // Optionally, redirect to a success page or show a success message
      })
      .catch((error) => {
        console.error("Error placing order:", error);
        // Handle the error, show an error message to the user, etc.
      });
  }

  // Function to handle "Proceed to Payment" button click
  function proceedToPayment() {
    // Add your logic for "Proceed to Payment" here
    console.log("Proceed to Payment logic executed");
  }

  // Add event listener to the "Cash on Delivery" radio button
  cashOnDeliveryRadio.addEventListener("change", function () {
    if (this.checked) {
      orderButton.innerText = "Place Order";
      orderButton.onclick = placeOrder; // Assign "Place Order" function
    }
  });

  // Add event listener to the "Prepaid" radio button
  prepaidRadio.addEventListener("change", function () {
    if (this.checked) {
      orderButton.innerText = "Proceed to Payment";
      orderButton.onclick = proceedToPayment; // Assign "Proceed to Payment" function
    }
  });
});
