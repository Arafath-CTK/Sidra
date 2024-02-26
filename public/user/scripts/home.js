document.addEventListener("DOMContentLoaded", function () {
  let accountButton = document.getElementById("accountButton");
  accountButton.addEventListener("click", function (event) {
    event.preventDefault();

    fetch("/checkAuthentication")
      .then((response) => {
        if (response.ok) {
          window.location.href = "/myAccount";
        } else {
          window.location.href = "/signIn";
        }
      })
      .catch((error) =>
        console.error("Error checking authentication: ", error)
      );
  });
});
