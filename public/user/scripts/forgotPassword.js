function validateForm() {
  const email = document.getElementById("email").value;

  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
    document.getElementById("emailError").innerHTML = "Enter a valid email id";
    return false;
  } else {
    document.getElementById("emailError").innerHTML = "";
    return true;
  } 
}
