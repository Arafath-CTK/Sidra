const { response } = require("express");

function deleteProduct(productId) {
  fetch(`/admin/products/${productId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      } // Handle success const
      console.log("product deleted successfully");
      location.reload();
    })
    .catch((error) => {
      console.error("There was a problem with your fetch operation: ", error);
    });
}

function editProduct(productId) {
  location.href = `/admin/editProduct/${productId}`;
}

const table = document.getElementById('myDataTable');
const tbody = table.querySelector('tbody');
const rowsPerPage = 10; // Adjust this for the number of rows per page

let totalItems = tbody.querySelectorAll('tr').length;
let currentPage = 1;

function generatePaginationLinks() {
  const ul = document.querySelector('nav ul');
  ul.innerHTML = ''; // Clear previous links

  const numPages = Math.ceil(totalItems / rowsPerPage);

  for (let i = 1; i <= numPages; i++) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    const link = document.createElement('a');
    link.classList.add('page-link');
    link.innerText = i;
    if (i === currentPage) {
      link.classList.add('active');
    }
    link.addEventListener('click', () => {
      currentPage = i;
      displayPage();
    });
    li.appendChild(link);
    ul.appendChild(li);
  }
}

function displayPage() {
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  tbody.querySelectorAll('tr').forEach((row, index) => {
    if (index >= startIndex && index < endIndex) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

generatePaginationLinks();
displayPage();
