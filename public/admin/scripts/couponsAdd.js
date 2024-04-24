function showToast(message) {
  Toastify({
    text: message,
    duration: 3000, // Duration in milliseconds
    gravity: "bottom", // Position of the toast message
    position: "center",
    backgroundColor: "black", // Background color of the toast
  }).showToast();
}

function validateCouponForm() {
  let isValid = true;

  // Validate coupon code
  const couponCodeInput = document.querySelector(".coupon-code");
  if (!couponCodeInput.value.trim()) {
    couponCodeInput.classList.add("is-invalid");
    isValid = false;
  } else {
    couponCodeInput.classList.remove("is-invalid");
  }

  // Validate min cart value
  const minCartValueInput = document.querySelector(".min-cart-value");
  const minCartValue = parseFloat(minCartValueInput.value.trim());
  if (!minCartValue || minCartValue < 0 || isNaN(minCartValue)) {
    minCartValueInput.classList.add("is-invalid");
    isValid = false;
  } else {
    minCartValueInput.classList.remove("is-invalid");
  }

  // Validate discount value
  const discountValueInput = document.querySelector(".discount-value");
  const discountValue = parseFloat(discountValueInput.value.trim());
  if (!discountValue || discountValue < 0 || isNaN(discountValue)) {
    discountValueInput.classList.add("is-invalid");
    isValid = false;
  } else {
    discountValueInput.classList.remove("is-invalid");
  }

  // Validate coupon limit
  const couponLimitInput = document.querySelector(".coupon-limit");
  const couponLimit = parseFloat(couponLimitInput.value.trim());
  if (!couponLimit || couponLimit < 0 || isNaN(couponLimit)) {
    couponLimitInput.classList.add("is-invalid");
    isValid = false;
  } else {
    couponLimitInput.classList.remove("is-invalid");
  }

  // Validate start date
  // Validate start date
  const startDateInput = document.querySelector(".start-date");
  const startDateValue = startDateInput.value.trim();
  let startDate;

  if (!startDateValue) {
    startDateInput.classList.add("is-invalid");
    isValid = false;
  } else {
    startDate = new Date(startDateValue);
    const currentDate = new Date();
    if (startDate < currentDate) {
      startDateInput.classList.add("is-invalid");
      isValid = false;
    } else {
      startDateInput.classList.remove("is-invalid");
    }
  }

  // Validate end date
  const endDateInput = document.querySelector(".end-date");
  const endDateValue = endDateInput.value.trim();
  if (!endDateValue) {
    endDateInput.classList.add("is-invalid");
    isValid = false;
  } else {
    const endDate = new Date(endDateValue);
    if (endDate <= startDate) {
      endDateInput.classList.add("is-invalid");
      isValid = false;
    } else {
      endDateInput.classList.remove("is-invalid");
    }
  }

  // Validate discount value limit for percentage type
  const percentageTypeInput = document.querySelector(
    'input[name="couponType"]:checked'
  );
  if (
    percentageTypeInput &&
    percentageTypeInput.value === "Percentage" &&
    discountValue > 100
  ) {
    discountValueInput.classList.add("is-invalid");
    isValid = false;
  }

  return isValid;
}

document
  .getElementById("coupon-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (validateCouponForm()) {
      // Form is valid, create FormData object
      const formData = {
        couponStatus: document.querySelector(
          'input[name="couponStatus"]:checked'
        ).value,
        startDate: document.querySelector('input[name="startDate"]').value,
        endDate: document.querySelector('input[name="endDate"]').value,
        couponCode: document.querySelector('input[name="couponCode"]').value,
        cartValue: document.querySelector('input[name="cartValue"]').value,
        couponType: document.querySelector('input[name="couponType"]:checked')
          .value,
        discountValue: document.querySelector('input[name="discountValue"]')
          .value,
        couponLimit: document.querySelector('input[name="couponLimit"]').value,
      };

      try {
        // Submit data to server using Axios
        const response = await axios.post("/admin/addCoupon", formData);

        if (response.data.couponExist) {
          showToast("Coupon Code already exists");
        } else if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Coupon added successfully",
          }).then(() => {
            window.location.href = "/admin/couponsList";
          });
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      // Form is not valid
      console.log("Form is not valid. Please correct the errors.");
    }
  });
