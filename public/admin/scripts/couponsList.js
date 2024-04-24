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
    document.querySelector('input[name="couponCode"]').value = coupon.code;
    document.querySelector('input[name="startDate"]').value = new Date(coupon.start_date).toISOString().split("T")[0];
    document.querySelector('input[name="endDate"]').value = new Date(coupon.end_date).toISOString().split("T")[0];
    document.querySelector('input[name="cartValue"]').value = coupon.min_cart_value;
    document.querySelector('input[name="couponType"][value="' + coupon.type + '"]').checked = true;
    document.querySelector('input[name="discountValue"]').value = coupon.discount;
    document.querySelector('input[name="couponLimit"]').value = coupon.max_usage;
    //   document.querySelector('input[name="couponStatus"][value="' + (coupon.isActive ? 'active' : 'inactive') + '"]').checked = true;

    // Open the modal
    $("#editCouponModal").modal("show");
  } catch (error) {
    console.error("Error fetching coupon:", error);
    showToast("Error getting the coupon data");
  }
}
