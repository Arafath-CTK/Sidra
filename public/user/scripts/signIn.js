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
