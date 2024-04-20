function showToast(message) {
  Toastify({
    text: message,
    duration: 3000, // Duration in milliseconds
    gravity: "bottom", // Position of the toast message
    position: "center",
    backgroundColor: "black", // Background color of the toast
  }).showToast();
}

async function updateStatus(orderId, newStatus, reason) {
  try {
    let response = await axios.put("/admin/changeStatus", {
      status: newStatus,
      orderId: orderId,
      reason: reason,
    });

    if (response.data.notLoggedIn) {
      window.location.href = "/admin/signIn";
    }
    if (response.data.success) {
      showToast("Order status updated");
    }
  } catch (error) {
    console.error("Error updating the status ", error);
    showToast("Status updation failed");
  }
}

// Event listener for modal close button
document.getElementById("cancelReasonModal").addEventListener("hide.bs.modal", function (event) {
  window.location.reload();
});

document.addEventListener("DOMContentLoaded", function () {
  const statusSelects = document.querySelectorAll(".form-select");

  statusSelects.forEach((select) => {
    const status = select.parentElement.querySelector(".orderStatus").value;
    const option = select.querySelector(`option[value="${status}"]`);
    if (option) {
      option.selected = true;
    }

    select.addEventListener("change", function (event) {
      const orderId = this.closest("tr")
        .querySelector("td:first-child")
        .textContent.trim();
      const newStatus = this.value;
      if (newStatus === "Cancelled") {
        $("#cancelReasonModal").modal("show");
      } else {
        updateStatus(orderId, newStatus);
      }
    });
  });
});

// Event listener for custom reason selection
document.getElementById("cancellationReason").addEventListener("change", function () {
  const customReasonInput = document.getElementById("customReasonInput");
  customReasonInput.style.display = this.value === "Custom" ? "block" : "none";
});

// Event listener for custom reason selection
document.getElementById("saveReasonBtn").addEventListener("click", function (event) {
  event.preventDefault();

  const selectedReason = document.getElementById("cancellationReason").value;
  const customReason = document.getElementById("customReasonInput").value.trim();
  const customReasonError = document.getElementById("customReasonError");

  // Reset error messages
  customReasonError.textContent = "";
  customReasonError.style.display = "none";

  let isValid = true;

  // Check if a reason is selected
  if (selectedReason === "") {
    customReasonError.textContent = "Please select a valid reason for cancellation";
    customReasonError.style.display = "block";
    isValid = false;
  }

  // Check if "Custom" reason is selected and if custom reason input is provided and meets the word count requirement
  if (selectedReason === "Custom") {
    if (customReason === "") {
      customReasonError.textContent = "Please provide a custom reason for cancellation";
      customReasonError.style.display = "block";
      isValid = false;
    } else if (customReason.split(/\s+/).filter(word => word.length > 0).length < 2) {
      customReasonError.textContent = "Please provide a custom reason with at least 2 words";
      customReasonError.style.display = "block";
      isValid = false;
    }
  }

  // If all validations pass, proceed with updating the status
  if (isValid) {
    const orderId = document.querySelector("#myDataTable .form-select").closest("tr").querySelector("td:first-child").textContent.trim();
    const reason = selectedReason === "Custom" ? customReason : selectedReason;

    // Update status with reason
    updateStatus(orderId, "Cancelled", reason)
      .then(() => {
        // Close the modal once the status update is complete
        $('#cancelReasonModal').modal('hide');
      })
      .catch((error) => {
        console.error("Error updating status:", error);
        // Handle error
      });
  }
});
