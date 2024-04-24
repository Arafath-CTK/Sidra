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

document.addEventListener("DOMContentLoaded", function () {
  const statusSelects = document.querySelectorAll(".form-select");

  // Add event listener for each form-select
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
        const modal = new bootstrap.Modal(
          document.getElementById("cancelReasonModal")
        );
        modal.show();

        // Event listener for save reason button click
        document
          .getElementById("saveReasonBtn")
          .addEventListener("click", function (event) {
            event.preventDefault();

            // Get the selected cancellation reason
            const selectedReason =
              document.getElementById("cancellationReason").value;
            const customReason = document
              .getElementById("customReasonInput")
              .value.trim();

            // Close the modal
            modal.hide();

            // Update status with reason
            updateStatus(
              orderId,
              newStatus,
              selectedReason === "Custom" ? customReason : selectedReason
            ).then(() => {
              window.location.reload();
            });
          });
      } else {
        // If the new status is not 'Cancelled', directly update the status
        updateStatus(orderId, newStatus).then(() => {
          window.location.reload();
        });
      }
    });
  });

  // Event listener for custom reason selection
  document
    .getElementById("cancellationReason")
    .addEventListener("change", function () {
      const customReasonInput = document.getElementById("customReasonInput");
      customReasonInput.style.display =
        this.value === "Custom" ? "block" : "none";
    });
});

// Event listener for modal close button
document
  .getElementById("cancelReasonModal")
  .addEventListener("hide.bs.modal", function (event) {
    // Reload the page when the modal is closed
    window.location.reload();
  });
