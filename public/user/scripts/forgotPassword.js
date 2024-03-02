async function sendOTP() {
  try {
    const email = document.getElementById("email").value;
    

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      document.getElementById("emailError").innerHTML =
        "Enter a valid email id";
    } else {
      document.getElementById("emailError").innerHTML = "";

      let response = await axios.post("/forgotPassword", { email });
      if (response.data.userNotFound) {
        document.getElementById("emailError").innerHTML = "User doesn't exist";
      } else if (response.data.success) {
        document.getElementById("email-section").style.display = "none";
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

    let response = await axios.post("/verifyOTP", { email, otp });

    if (response.data.userNotFound) {
      console.log("User not found");
      document.getElementById("message").innerText = "User doesn't exist";
    } else if (response.data.invalidOTP) {
      console.log("Invalid or expired otp");
      document.getElementById("message").innerText = "Invalid or expired OTP";
    } else if (response.data.otpVerified) {
      console.log("OTP verification success");
      document.getElementById("otp-section").style.display = "none";
      document.getElementById("reset-password-section").style.display = "block";
      document.getElementById("message").innerText =
        "OTP verified, proceed to reset password";
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText =
      "Unexpected error occured while verifying otp";
  }
}

async function resetPassword() {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

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

      let response = await axios.post("/resetPassword", {
        email,
        confirmPassword,
      });
      if (response.data.userNotFound) {
        console.log("User not found");
        document.getElementById("message").innerText = "User doesn't exist";
      } else if (response.data.samePassword) {
        console.log("The previous and new password matches");
        document.getElementById("message").innerText =
          "The previous password matches the new password";
      } else if (response.data.success) {
        document.getElementById("message").innerText =
          "Password reset successfully";
        window.location.href = "/signIn";
      }
    }
  } catch (error) {
    console.error(error);
    document.getElementById("message").innerText =
      "Unexpected error occured while resetting the password";
  }
}
