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

    if (!/^[A-Za-z\s]{3,}$/.test(street)) {
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
      let response = await axios.post("/addAddress", {
        name,
        house,
        street,
        city,
        state,
        pin,
        phone,
        addressType,
      });
      if (response.data.addressExist) {
        console.log("address already exists");
        document.getElementById("addressTypeError").innerHTML =
          "address already exists";
      } else if (response.data.success) {
        console.log("address added successfully");
        window.location.href = window.location.pathname + "#address";
        window.location.reload();
      }
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText =
      "Unexpected error occured while adding address";
  }
}
