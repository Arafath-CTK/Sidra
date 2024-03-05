function validateForm() {
  let productName = document.getElementById("productName").value.trim();
  let price = document.getElementById("price").value.trim();
  let stockQuantity = document.getElementById("stockQuantity").value.trim();
  let description = document.getElementById("description").value.trin();
  let mainCategory = document.getElementById("mainCategory").value.trim();
  let subCategory = document.getElementById("subCategory").value.trim();

  if (
    productName === "" ||
    price === "" ||
    stockQuantity === "" ||
    mainCategory === "" ||
    subCategory === "" ||
    description === ""
  ) {
    document.getElementById("Errormessage").textContent =
      "Please fill all Input-fields";
    return false;
  } else {
    document.getElementById("Errormessage").textContent = "";
    return true;
  }
}

function selectCategory(main, sub) {
  document.getElementById("mainCategory").value = main;
  document.getElementById("subCategory").value = sub;

  // Remove 'active' class from all sub-category links
  var allSubLinks = document.querySelectorAll(".category-list .sub-category a");
  allSubLinks.forEach(function (link) {
    link.classList.remove("active");
  });

  // Add 'active' class to the clicked sub-category link
  var clickedLink = document.querySelector(
    '.category-list li[value="' + main + '"] ul li[value="' + sub + '"] a'
  );
  clickedLink.classList.add("active");
}
