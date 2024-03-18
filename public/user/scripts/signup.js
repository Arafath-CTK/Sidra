async function sendOTP() {
  try {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let errorCount = 0;

    if (!/^[A-Za-z\s]{3,}$/.test(name)) {
      document.getElementById("nameError").innerHTML = "Enter a valid name";
      errorCount++;
    } else {
      document.getElementById("nameError").innerHTML = "";
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      document.getElementById("emailError").innerHTML =
        "Enter a valid email id";
      errorCount++;
    } else {
      document.getElementById("emailError").innerHTML = "";
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      document.getElementById("phoneNumberError").innerHTML =
        "Enter a valid phone number";
      errorCount++;
    } else {
      document.getElementById("phoneNumberError").innerHTML = "";
    }
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
    }

    if (errorCount > 0) {
      document.getElementById("message").innerText =
        "Fill the input fields correctly";
    } else {
      let response = await axios.post("/signUpVerification", { email });
      if (response.data.success) {
        document.getElementById("input-section").style.display = "none";
        document.getElementById("otp-section").style.display = "block";
        document.getElementById("message").innerText = "OTP sent to your email";
      }
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText =
      "Unexpected error occured while sending otp";
  }
}

async function verifyOTP() {
  try {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;

    let response = await axios.post("/signUpVerifyOTP", { email, otp });

    if (response.data.invalidOTP) {
      console.log("Invalid or expired otp");
      document.getElementById("message").innerText = "Invalid or expired OTP";
    } else if (response.data.otpVerified) {
      console.log("OTP verification success");
      document.getElementById("otp-section").style.display = "none";
      document.getElementById("message").innerText = "OTP verified";

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phoneNumber = document.getElementById("phoneNumber").value;
      const password = document.getElementById("password").value;

      let userRegistered = await axios.post("signUp", {
        name,
        email,
        phoneNumber,
        password,
      });
      
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText =
      "Unexpected error occured while verifying otp";
  }
}
