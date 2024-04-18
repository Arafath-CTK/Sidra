// Function to show the spinner and overlay
function showSpinner() {
  document.getElementById("spinner").style.display = "block";
  document.getElementById("spinnerOverlay").style.display = "block";
}

// Function to hide the spinner and overlay
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.getElementById("spinnerOverlay").style.display = "none";
}

async function addAddress() {
  try {
    const name = document.getElementById("name").value;
    const house = document.getElementById("house").value;
    const street = document.getElementById("street").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const pin = document.getElementById("pin").value;
    const phone = document.getElementById("phone").value;
    const addressType = document.getElementById("addressType").value;
    const isPrimary = document.getElementById("primaryAddress").checked;

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
      document.getElementById("pinError").innerHTML = "Enter a valid PIN code";
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

    if (!/^[A-Za-z\s]{3,}$/.test(addressType)) {
      document.getElementById("addressTypeError").innerHTML =
        "Select an address type";
      errorCount++;
    } else {
      document.getElementById("addressTypeError").innerHTML = "";
    }

    if (errorCount > 0) {
      // Find the first input field with an error
      const errorFields = document.querySelectorAll(".error");
      if (errorFields.length > 0) {
        // Focus on the first input field with an error
        errorFields[0].focus();
      }
    } else {
      showSpinner();
      try {
        let response = await axios.post("/address", {
          name,
          house,
          street,
          city,
          state,
          pin,
          phone,
          addressType,
          isPrimary,
        });
        if (response.data.addressExist) {
          hideSpinner();
          console.log("address already exists");
          document.getElementById("addressTypeError").innerHTML =
            "address already exists";
        } else if (response.data.success) {
          hideSpinner();
          console.log("address added successfully");

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Address added successfully!",
          }).then(() => {
            window.location.href = window.location.pathname + "#address";
            window.location.reload();
          });
        }
      } catch (error) {
        hideSpinner();
        console.error("An error occurred:", error);
        // Show error message using Sweet Alert
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while adding the address.",
        });
      }
    }
  } catch (error) {
    console.error(error);
    document.getElementById("addressTypeError").innerText =
      "Unexpected error occured while adding address";
  }
}

async function deleteAddress(addressId) {
  showSpinner();
  fetch(`/address/${addressId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        console.log("Address removed successfully");
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Address removed successfully!",
        }).then(() => {
          location.reload();
        });
      } else {
        console.error("Address removal failed");
      }
      hideSpinner();
    })
    .catch((error) => {
      console.error("There was a problem with your fetch operation: ", error);
    });
}

async function editAddressPage(addressId) {
  try {
    // Fetch the address data
    const response = await axios.get(`/address/${addressId}`);
    const data = response.data;

    // Set the input field values
    document.getElementById("editName").value = data.name;
    document.getElementById("editHouse").value = data.house_name;
    document.getElementById("editStreet").value = data.street;
    document.getElementById("editCity").value = data.city;
    document.getElementById("editState").value = data.state;
    document.getElementById("editPin").value = data.pin_code;
    document.getElementById("editPhone").value = data.phone_number;
    document.getElementById("editAddressType").value = data.address_type;
    document.getElementById("addressId").value = data._id;

    // Find the button corresponding to the address type
    const buttons = document.querySelectorAll(".editAddress-button");
    buttons.forEach((button) => {
      if (button.textContent.trim() == data.address_type) {
        // Remove active class from all buttons
        buttons.forEach((btn) => {
          btn.classList.remove("active");
          btn.style.backgroundColor = "#f2f2f2";
          btn.style.borderColor = "#ccc";
          btn.style.color = "#000";
        });

        // Add active class to the matching button
        button.classList.add("active");
        button.style.backgroundColor = "#79a206";
        button.style.borderColor = "#79a206";
        button.style.color = "#fff";
      }
    });

    // Set the checkbox state for primary address
    document.getElementById("editPrimaryAddress").checked = data.isPrimary;

    // Update primary address indicator based on checkbox state
    const primaryAddressIndicator = document.getElementById(
      "editPrimaryAddressIndicator"
    );
    if (data.isPrimary) {
      primaryAddressIndicator.style.backgroundColor = "#79a206";
    } else {
      primaryAddressIndicator.style.backgroundColor = "#ffffff";
    }

    // Show the modal
    document.getElementById("addressEditModal").style.display = "block";
  } catch (error) {
    console.error("Error fetching address: ", error);
  }
}

async function editAddress() {
  try {
    const name = document.getElementById("editName").value;
    const house = document.getElementById("editHouse").value;
    const street = document.getElementById("editStreet").value;
    const city = document.getElementById("editCity").value;
    const state = document.getElementById("editState").value;
    const pin = document.getElementById("editPin").value;
    const phone = document.getElementById("editPhone").value;
    const addressType = document.getElementById("editAddressType").value;
    let addressId = document.getElementById("addressId").value;
    const isPrimary = document.getElementById("editPrimaryAddress").checked;

    let errorCount = 0;

    if (!/^[A-Za-z\s]{3,}$/.test(name)) {
      document.getElementById("editNameError").innerHTML = "Enter a valid name";
      errorCount++;
    } else {
      document.getElementById("editNameError").innerHTML = "";
    }

    if (!/^[A-Za-z\s]{3,}$/.test(house)) {
      document.getElementById("editHouseError").innerHTML =
        "Enter a valid House/Building name";
      errorCount++;
    } else {
      document.getElementById("editHouseError").innerHTML = "";
    }

    if (!/^[A-Za-z,\s]{3,}$/.test(street)) {
      document.getElementById("editStreetError").innerHTML =
        "Enter a valid street name";
      errorCount++;
    } else {
      document.getElementById("editStreetError").innerHTML = "";
    }

    if (!/^[A-Za-z\s]{3,}$/.test(city)) {
      document.getElementById("editCityError").innerHTML = "Enter a valid city";
      errorCount++;
    } else {
      document.getElementById("editCityError").innerHTML = "";
    }

    if (!/^[A-Za-z\s]{3,}$/.test(state)) {
      document.getElementById("editStateError").innerHTML =
        "Enter a valid state";
      errorCount++;
    } else {
      document.getElementById("editStateError").innerHTML = "";
    }

    if (!/^\d{6}$/.test(pin)) {
      document.getElementById("editPinError").innerHTML =
        "Enter a valid PIN code";
      errorCount++;
    } else {
      document.getElementById("editPinError").innerHTML = "";
    }

    if (!/^\d{10}$/.test(phone)) {
      document.getElementById("editPhoneError").innerHTML =
        "Enter a valid phone number";
      errorCount++;
    } else {
      document.getElementById("editPhoneError").innerHTML = "";
    }

    if (!/^[A-Za-z\s]{3,}$/.test(addressType)) {
      document.getElementById("editAddressTypeError").innerHTML =
        "Select an address type";
      errorCount++;
    } else {
      document.getElementById("editAddressTypeError").innerHTML = "";
    }

    if (errorCount > 0) {
      // Find the first input field with an error
      const errorFields = document.querySelectorAll(".error");
      if (errorFields.length > 0) {
        // Focus on the first input field with an error
        errorFields[0].focus();
      }
    } else {
      showSpinner();
      try {
        let response = await axios.put(`/address/${addressId}`, {
          name,
          house,
          street,
          city,
          state,
          pin,
          phone,
          addressType,
          isPrimary,
        });
        if (response.data.addressExist) {
          hideSpinner();
          console.log("address already exists");
          document.getElementById("editAddressTypeError").innerHTML =
            "address already exists";
        } else if (response.data.success) {
          hideSpinner();
          console.log("address updated successfully");

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Address updated successfully!",
          }).then(() => {
            window.location.href = window.location.pathname + "#address";
            window.location.reload();
          });
        }
      } catch (error) {
        hideSpinner();
        console.error("An error occurred:", error);
        // Show error message using Sweet Alert
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while updating the address.",
        });
      }
    }
  } catch (error) {
    console.error(error);
    document.getElementById("editAddressTypeError").innerText =
      "Unexpected error occured while adding address";
  }
}

async function editUserData(params) {
  
}