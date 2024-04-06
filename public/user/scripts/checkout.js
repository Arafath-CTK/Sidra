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

document.getElementById("addressLabel").addEventListener("click", function (e) {
  document.getElementById("newAddress").checked = true;
  e.preventDefault();
});

document.addEventListener("DOMContentLoaded", function () {
  const showAllAddressesBtn = document.getElementById("showAllAddressesBtn");
  const addressListCollapse = document.getElementById("addressListCollapse");

  showAllAddressesBtn.addEventListener("click", function () {
    const isCollapsed =
      addressListCollapse.getAttribute("aria-expanded") === "false";

    if (!isCollapsed) {
      showAllAddressesBtn.textContent =
        showAllAddressesBtn.textContent === "Hide Addresses"
          ? "Show All Addresses"
          : "Hide Addresses";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const cashOnDeliveryRadio = document.getElementById("cashOnDelivery");
  const prepaidRadio = document.getElementById("prepaid");
  const orderButton = document.getElementById("orderButton");

  async function addAddress() {
    try {
      const name = document.getElementById("name").value;
      const house = document.getElementById("house").value;
      const street = document.getElementById("street").value;
      const city = document.getElementById("city").value;
      const state = document.getElementById("state").value;
      const pin = document.getElementById("pin").value;
      const phone = document.getElementById("phone").value;

      let errorCount = 0;

      if (!/^[A-Za-z\s]{3,}$/.test(name)) {
        document.getElementById("nameError").innerHTML = "Enter a valid name";
        errorCount++;
      } else {
        document.getElementById("nameError").innerHTML = "";
      }

      if (!/^[A-Za-z\s]{3,}$/.test(house)) {
        document.getElementById("houseError").innerHTML =
          "Enter a valid House/Building name";
        errorCount++;
      } else {
        document.getElementById("houseError").innerHTML = "";
      }

      if (!/^[A-Za-z,\s]{3,}$/.test(street)) {
        document.getElementById("streetError").innerHTML =
          "Enter a valid street name";
        errorCount++;
      } else {
        document.getElementById("streetError").innerHTML = "";
      }

      if (!/^[A-Za-z\s]{3,}$/.test(city)) {
        document.getElementById("cityError").innerHTML = "Enter a valid city";
        errorCount++;
      } else {
        document.getElementById("cityError").innerHTML = "";
      }

      if (!/^[A-Za-z\s]{3,}$/.test(state)) {
        document.getElementById("stateError").innerHTML = "Enter a valid state";
        errorCount++;
      } else {
        document.getElementById("stateError").innerHTML = "";
      }

      if (!/^\d{6}$/.test(pin)) {
        document.getElementById("pinError").innerHTML =
          "Enter a valid PIN code";
        errorCount++;
      } else {
        document.getElementById("pinError").innerHTML = "";
      }

      if (!/^\d{10}$/.test(phone)) {
        document.getElementById("phoneError").innerHTML =
          "Enter a valid phone number";
        errorCount++;
      } else {
        document.getElementById("phoneError").innerHTML = "";
      }

      if (errorCount > 0) {
        // Find the first input field with an error
        const errorFields = document.querySelectorAll(".error");
        if (errorFields.length > 0) {
          // Focus on the first input field with an error
          errorFields[0].focus();
        }
        return { success: false };
      } else {
        try {
          let response = await axios.post("/address", {
            name,
            house,
            street,
            city,
            state,
            pin,
            phone,
          });
          if (response.data.addressExist) {
            showToast("address already exists");
            document.getElementById("pinError").innerHTML =
              "address already exists";
            return { success: false };
          } else if (response.data.success) {
            showToast("address selected successfully");
            const addressId = response.data.addressId;
            return { success: true, addressId: addressId };
          }
        } catch (error) {
          console.error("An error occurred:", error);
          return { success: false };
        }
      }
    } catch (error) {
      console.error(error);
      document.getElementById("pinError").innerText =
        "Unexpected error occured while adding address";
      return { success: false };
    }
  }

  // Function to handle "Place Order" button click
  async function placeOrder() {
    const isNewAddressSelected = document.getElementById("newAddress").checked;
    let selectedAddressId;

    if (isNewAddressSelected) {
      const response = await addAddress();

      if (response.success) {
        selectedAddressId = response.addressId;
      } else {
        showToast("Error adding new address");
        return;
      }
    } else {
      selectedAddressId = document.querySelector(
        'input[name="address"]:checked'
      ).value;
    }

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
      })
      .catch((error) => {
        console.error("Error placing order:", error);
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
