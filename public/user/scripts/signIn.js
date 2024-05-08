function validateForm() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let errorCount = 0;

  if (email === "") {
    document.getElementById("emailError").innerHTML =
      "Please enter your email address.";
    errorCount++;
  } else {
    document.getElementById("emailError").innerHTML = "";
  }

  if (password === "") {
    document.getElementById("passwordError").innerHTML =
      "Please enter your password";
    errorCount++;
  } else {
    document.getElementById("passwordError").innerHTML = "";
  }

  return errorCount > 0 ? false : true;
}

document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    var passwordInput = document.getElementById("password");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
    }
  });
