function validateForm() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
   
    let errorCount = 0;
  
    if (!/^[A-Za-z\s]{3,}$/.test(name)) {
      document.getElementById("nameError").innerHTML = "*Enter a valid name";
      errorCount++;
    } else {
      document.getElementById("nameError").innerHTML = "";
    }
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      document.getElementById("emailError").innerHTML = "*Enter a valid email id";
      errorCount++;
    } else {
      document.getElementById("emailError").innerHTML = "";
    }
  
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/.test(password)) {
      document.getElementById("passwordError").innerHTML =
        "*Password must be 6-20 long<br>contain at least one digit<br>one lowercase letter<br>and one uppercase letter";
      errorCount++;
    } else {
      document.getElementById("passwordError").innerHTML = "";
    }
  
    if (errorCount > 0) {
      return false;
    } else {
      return true;
    }
  }
  