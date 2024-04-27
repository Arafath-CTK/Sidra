function showToast(message) {
  Toastify({
    text: message,
    duration: 3000, // Duration in milliseconds
    gravity: "bottom", // Position of the toast message
    position: "center",
    backgroundColor: "black", // Background color of the toast
  }).showToast();
}

document.addEventListener("DOMContentLoaded", function () {
  function toggleCollapsetwo() {
    const newAddress = document.getElementById("newAddress");
    const collapsetwo = document.getElementById("addressForm");

    if (newAddress.checked) {
      collapsetwo.style.display = "block";
    } else {
      collapsetwo.style.display = "none";
    }
  }

  toggleCollapsetwo();

  document
    .getElementById("newAddress")
    .addEventListener("change", toggleCollapsetwo);
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
        const errorFields = document.querySelectorAll(".error");
        if (errorFields.length > 0) {
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

    // Get the applied coupon ID from the hidden input field
    const appliedCouponId = document.getElementById("appliedCoupon").value;

    // Prepare the data payload
    const data = {
      addressId: selectedAddressId,
      totalPrice: totalPrice,
      paymentStatus: "COD",
    };

    // Include the applied coupon ID if it's valid
    if (appliedCouponId) {
      data.appliedCoupon = appliedCouponId;
    }

    // Send the data to the server
    axios
      .post("/placeOrder", data)
      .then((response) => {
        console.log("Order placed successfully:", response.data);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Order placed successfully",
        }).then(() => {
          window.location.href = "/myAccount?section=orders";
        });
      })
      .catch((error) => {
        console.error("Error placing order:", error);
      });
  }

  // Function to handle "Proceed to Payment" button click
  async function proceedToPayment() {
    try {
      const isNewAddressSelected =
        document.getElementById("newAddress").checked;
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

      // Get the applied coupon ID from the hidden input field
      const appliedCouponId = document.getElementById("appliedCoupon").value;

      const response = await axios.post("/payment/create-order", {
        amount: totalPrice,
      });

      const order = response.data;

      const razorpay = new Razorpay({
        key: order.apiKey,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Sidra",
        description: "Complete the payment for order placement",
        handler: function () {
          // Prepare the data payload
          const data = {
            addressId: selectedAddressId,
            totalPrice: totalPrice,
            paymentStatus: "Pre Paid",
          };

          // Include the applied coupon ID if it's valid
          if (appliedCouponId) {
            data.appliedCoupon = appliedCouponId;
          }

          axios
            .post("/placeOrder", data)
            .then((response) => {
              console.log("Order placed successfully:", response.data);
              Swal.fire({
                icon: "success",
                title: "Success",
                text: "Order placed successfully",
              }).then(() => {
                window.location.href = "/myAccount?section=orders";
              });
            })
            .catch((error) => {
              console.error("Error placing order:", error);
            });
        },
      });

      razorpay.open();
    } catch (error) {
      console.error(error);
    }
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

  if (cashOnDeliveryRadio.checked) {
    orderButton.innerText = "Place Order";
    orderButton.onclick = placeOrder;
  } else if (prepaidRadio.checked) {
    orderButton.innerText = "Proceed to Payment";
    orderButton.onclick = proceedToPayment;
  }
});

// Initialize a boolean variable to track whether a coupon has been applied
let couponApplied = false;
document
  .getElementById("couponSubmit")
  .addEventListener("click", async function () {
    try {
      const couponCode = document.getElementById("couponCodeInput").value;
      const cartSubtotal = parseFloat(
        document
          .getElementById("cartSubtotal")
          .textContent.replace(/[^\d.]/g, "")
      );

      // Check if a coupon has already been applied
      if (couponApplied) {
        // Display error message indicating that a coupon has already been applied
        document.getElementById("inValidCouponFeedback").innerHTML =
          "You can apply only one coupon per checkout";
        document.getElementById("couponCodeInput").classList.remove("is-valid");
        document.getElementById("couponCodeInput").classList.add("is-invalid");
        return; // Exit the function without proceeding further
      }

      // Send coupon code and cart subtotal to the server
      const response = await axios.post("/coupon", {
        couponCode,
        cartSubtotal,
      });

      if (response.data.notExist || response.data.inactive) {
        // Display error message if the coupon does not exist or is inactive
        document.getElementById("inValidCouponFeedback").innerHTML =
          "Coupon does not exist or is inactive";
        document.getElementById("couponCodeInput").classList.add("is-invalid");
      } else if (response.data.alreadyUsed) {
        document.getElementById("inValidCouponFeedback").innerHTML =
          "You have already used this coupon once";
        document.getElementById("couponCodeInput").classList.add("is-invalid");
      } else if (response.data.notApplicable) {
        document.getElementById("inValidCouponFeedback").innerHTML =
          "Coupon is not applicable";
        document.getElementById("couponCodeInput").classList.add("is-invalid");
      } else if (response.data.success) {
        document.getElementById("validCouponFeedback").innerHTML =
          "Coupon Applied";
        document.getElementById("inValidCouponFeedback").innerHTML = ""; // Clear any previous invalid coupon feedback
        document
          .getElementById("couponCodeInput")
          .classList.remove("is-invalid");
        document.getElementById("couponCodeInput").classList.add("is-valid");

        // Update UI with discount amount and new total price
        const discount = response.data.discount;
        const newTotalPrice =
          document.getElementById("totalPrice").textContent - discount;

        document.getElementById("discountAmount").textContent = "₹ " + discount;
        document.getElementById("appliedCoupon").value = response.data.couponId;
        document.getElementById("totalPrice").textContent = newTotalPrice;

        // Set the boolean variable to true to indicate that a coupon has been applied
        couponApplied = true;
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      // Display generic error message
      document.getElementById("inValidCouponFeedback").innerHTML =
        "Error applying coupon. Please try again later.";
      document.getElementById("couponCodeInput").classList.add("is-invalid");
    }
  });
