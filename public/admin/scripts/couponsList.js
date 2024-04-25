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
  const orderDateCells = document.querySelectorAll(".order-date");
  orderDateCells.forEach(function (cell) {
    const dateString = cell.textContent;
    const formattedDate = formatDate(new Date(dateString));
    cell.textContent = formattedDate;
  });

  const rows = document.querySelectorAll("tr");
  rows.forEach(function (row) {
    const couponTypeCell = row.querySelector(".coupon-type");
    const discountCell = row.querySelector(".discount-value");

    if (couponTypeCell && discountCell) {
      const couponType = couponTypeCell.textContent.trim();
      const discountValue = parseFloat(discountCell.textContent);

      if (couponType === "Fixed Amount") {
        discountCell.innerHTML = "₹" + discountValue;
      } else if (couponType === "Percentage") {
        discountCell.innerHTML = discountValue + "%";
      }
    }
  });

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
});

async function removeCoupon(couponId) {
  try {
    const response = await axios.delete(`/admin/coupon/${couponId}`);
    if (response.data.success) {
      showToast("Coupon removed successfully");
    } else {
      showToast("Failed to remove coupon");
    }
  } catch (error) {
    console.error("Error deleting coupon:", error.message);
  }
}

async function openEditCouponModal(couponId) {
  try {
    const response = await axios.get(`/admin/coupon/${couponId}`);
    const coupon = response.data;

    // Populate the form fields with the coupon data
    document.getElementById("couponId").value = coupon._id;
    document.querySelector('input[name="couponCode"]').value = coupon.code;
    document.querySelector('input[name="startDate"]').value = new Date(
      coupon.start_date
    )
      .toISOString()
      .split("T")[0];
    document.querySelector('input[name="endDate"]').value = new Date(
      coupon.end_date
    )
      .toISOString()
      .split("T")[0];
    document.querySelector('input[name="cartValue"]').value =
      coupon.min_cart_value;
    document.querySelector('input[name="discountValue"]').value =
      coupon.discount;
    document.querySelector('input[name="couponLimit"]').value =
      coupon.max_usage;

    const couponStatusRadio = document.querySelector(
      'input[name="couponStatus"][value="' +
        (coupon.isActive ? "active" : "inactive") +
        '"]'
    );
    if (couponStatusRadio) {
      couponStatusRadio.checked = true;
    }

    const couponTypeRadios = document.querySelectorAll(
      'input[name="couponType"]'
    );
    for (const radio of couponTypeRadios) {
      if (radio.value === coupon.coupon_type) {
        radio.checked = true;
        break;
      }
    }

    // Open the modal
    $("#editCouponModal").modal("show");
  } catch (error) {
    console.error("Error fetching coupon:", error);
    showToast("Error getting the coupon data");
  }
}

function validateCouponForm() {
  let isValid = true;

  const couponId = document.getElementById("couponId").value;
  if (!couponId) {
    isValid = false;
  }

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
  const discountValueInput = document.querySelector(".discount_value");
  const discountValue = parseFloat(discountValueInput.value.trim());
  if (discountValueInput) {
    if (!discountValue || discountValue < 0 || isNaN(discountValue)) {
      discountValueInput.classList.add("is-invalid");
      isValid = false;
    } else {
      discountValueInput.classList.remove("is-invalid");
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
  const startDateInput = document.querySelector(".start-date");
  const startDateValue = startDateInput.value.trim();
  let startDate;

  if (!startDateValue) {
    startDateInput.classList.add("is-invalid");
    isValid = false;
  // } else {
  //   startDate = new Date(startDateValue);
  //   const currentDate = new Date();
  //   if (startDate < currentDate) {
  //     startDateInput.classList.add("is-invalid");
  //     isValid = false;
  //   } else {
  //     startDateInput.classList.remove("is-invalid");
  //   }
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

  return isValid;
}

document
  .getElementById("coupon-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (validateCouponForm()) {
      // Form is valid, create FormData object
      const formData = {
        couponId: document.getElementById("couponId").value,
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
        const response = await axios.put("/admin/editCoupon", formData);
        $("#editCouponModal").modal("hide");

        if (response.data.couponExist) {
          showToast("Coupon Code already exists");
        } else if (response.data.success) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Coupon updated successfully",
          }).then(() => {
            window.location.href = "/admin/couponsList";
          });
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.log("Form is not valid. Please correct the errors.");
    }
  });
