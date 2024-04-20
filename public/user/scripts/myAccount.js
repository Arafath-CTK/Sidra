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

function showToast(message) {
  Toastify({
    text: message,
    duration: 3000, // Duration in milliseconds
    gravity: "bottom", // Position of the toast message
    position: "center",
    backgroundColor: "black", // Background color of the toast
  }).showToast();
}

window.addEventListener('DOMContentLoaded', (event) => {
  const urlParams = new URLSearchParams(window.location.search);
  const section = urlParams.get('section');

  if (section === 'orders') {
    document.querySelector('a[href="#orders"]').click();
  }
});

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

async function editUserData() {
  try {
    const existingName = document.getElementById("existingName").value;
    const existingEmail = document.getElementById("existingEmail").value;
    const existingPhone = document.getElementById("existingPhone").value;

    const name = document.getElementById("nameEdit").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let errorCount = 0;
    let changeCount = 0;
    let emailChanged = false;

    if (existingName !== name) {
      if (!/^[A-Za-z\s]{3,}$/.test(name)) {
        document.getElementById("nameError").innerHTML = "Enter a valid name";
        errorCount++;
      } else {
        document.getElementById("nameError").innerHTML = "";
        changeCount++;
      }
    }

    if (existingEmail !== email) {
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
        document.getElementById("emailError").innerHTML =
          "Enter a valid email id";
        errorCount++;
      } else {
        document.getElementById("emailError").innerHTML = "";
        emailChanged = true;
      }
    }

    if (existingPhone !== phoneNumber) {
      if (!/^\d{10}$/.test(phoneNumber)) {
        document.getElementById("phoneNumberError").innerHTML =
          "Enter a valid phone number";
        errorCount++;
      } else {
        document.getElementById("phoneNumberError").innerHTML = "";
        changeCount++;
      }
    }

    if (password !== "" && confirmPassword !== "") {
      if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/.test(password)) {
        document.getElementById("passwordError").innerHTML =
          "Password must contain atleast 6 characters";
        errorCount++;
      } else {
        document.getElementById("passwordError").innerHTML = "";
      }

      if (password !== confirmPassword) {
        document.getElementById("confirmPasswordError").innerHTML =
          "Password confirmation does not match the original password";
        errorCount++;
      } else {
        document.getElementById("confirmPasswordError").innerHTML = "";
        changeCount++;
      }
    }

    if (errorCount > 0) {
      document.getElementById("message").innerText =
        "Fill the input fields correctly";
    } else if (emailChanged) {
      showSpinner();
      let response = await axios.post("/myAccount/newEmailVerification", {
        email,
      });
      hideSpinner();
      if (response.data.emailExist) {
        document.getElementById("message").innerText = "Email already exist";
      }
      if (response.data.success) {
        document.getElementById("input-section").style.display = "none";
        document.getElementById("otp-section").style.display = "block";
        document.getElementById("message").innerText =
          "Otp sent to your new email for verification";
      }
    } else if (changeCount > 0) {
      showSpinner();
      let response = await axios.post("/myAccount/editUserData", {
        name,
        phoneNumber,
        password,
      });
      hideSpinner();
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully updated your datas",
        }).then(() => {
          window.location.href = "/myAccount";
        });
      }
      if (response.data.userNotExist || response.data.notLogged) {
        showToast("You are not logged in");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.href = "/signin";
      }
    } else {
      document.getElementById("message").innerText =
        "You have not updated any data";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText =
      "Unexpected error occured while editing the user data";
  }
}

async function verifyOTP() {
  try {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;

    showSpinner();
    let response = await axios.post("/verifyOTP", { email, otp });

    if (response.data.invalidOTP) {
      console.log("Invalid or expired otp");
      document.getElementById("message").innerText = "Invalid or expired OTP";
    } else if (response.data.otpVerified) {
      console.log("OTP verification success");
      document.getElementById("otp-section").style.display = "none";
      showToast("Otp verified");

      const name = document.getElementById("nameEdit").value;
      const email = document.getElementById("email").value;
      const phoneNumber = document.getElementById("phoneNumber").value;
      const password = document.getElementById("password").value;

      let response = await axios.post("/myAccount/editUserData", {
        name,
        email,
        phoneNumber,
        password,
      });
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Successfully updated your datas",
        }).then(() => {
          window.location.href = "/myAccount";
        });
      }
      if (response.data.userNotExist || response.data.notLogged) {
        showToast("You are not logged in");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        window.location.href = "/signin";
      }
    }
    hideSpinner();
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText =
      "Unexpected error occured while verifying otp";
  }
}
