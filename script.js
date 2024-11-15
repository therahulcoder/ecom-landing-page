const apiUrl = "https://fakestoreapi.com/products";
let products = [];
let displayedProducts = 0;
let productsPerLoad = 10;
let filteredProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  addEventListeners();
  window.addEventListener("resize", handleResize); // Adjust layout on window resize
});

const loadProducts = async () => {
  showLoading();
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch products");
    products = await response.json();
    filteredProducts = [...products]; // Initialize filtered list with all products
    hideLoading();
    displayProducts();
  } catch (error) {
    showError(error.message);
  }
};

const updateLoadMoreButton = () => {
  const loadMoreButton = document.getElementById("load-more");
  loadMoreButton.style.display =
    displayedProducts < filteredProducts.length ? "block" : "none";
};

const displayProducts = () => {
  const productGrid = document.getElementById("product-grid");
  const productsToShow = filteredProducts.slice(
    displayedProducts,
    displayedProducts + productsPerLoad
  );

  productsToShow.forEach((product) => {
    const productItem = createProductItem(product);
    productGrid.appendChild(productItem);
  });

  displayedProducts += productsPerLoad;

  updateLoadMoreButton();
};

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const addEventListeners = () => {
  document
    .getElementById("load-more")
    .addEventListener("click", loadMoreProducts);
  document
    .getElementById("filter-section")
    .addEventListener("click", applyFilters);
  document
    .getElementById("sort-filter")
    .addEventListener("change", applyFilters);
  document
    .getElementById("search")
    .addEventListener("input", debounce(searchProducts, 300));
};

const applyFilters = () => {
  // Select all checkboxes with the name 'option' that are checked
  const selectedCheckboxes = document.querySelectorAll(
    'input[name="category"]:checked'
  );

  // Get the values of the selected checkboxes
  const category = Array.from(selectedCheckboxes).map(
    (checkbox) => checkbox.value
  );

  const sortOrder = document.getElementById("sort-filter").value;

  if (category.length > 0) {
    filteredProducts = products.filter(
      (product) => category.indexOf(product.category) != -1
    );
  } else {
    filteredProducts = products;
  }

  if (sortOrder) {
    filteredProducts.sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );
  }

  displayedProducts = 0;
  document.getElementById("product-grid").innerHTML = "";
  displayProducts();
};

const searchProducts = () => {
  const query = document.getElementById("search").value.toLowerCase();
  filteredProducts = products.filter(({ title }) =>
    title.toLowerCase().includes(query)
  );
  displayedProducts = 0;
  document.getElementById("product-grid").innerHTML = "";
  displayProducts();
};

const createProductItem = ({ image, title, description, price }) => {
  const productItem = document.createElement("div");
  productItem.className = "product-item";
  productItem.innerHTML = `
    <img src="${image}" alt="${title}">
    <h2>${title}</h2>
    <p>${description.substring(0, 50)}...</p>
    <p class="price">$${price}</p>
  `;
  return productItem;
};

const loadMoreProducts = () => {
  if (displayedProducts < filteredProducts.length) {
    displayProducts();
  } else {
    const loadMoreButton = document.getElementById("load-more");
    loadMoreButton.disabled = true;
    loadMoreButton.innerText = "No More Products";
  }
};

const showLoading = () => {
  const productGrid = document.getElementById("product-grid");
  for (let i = 0; i < productsPerLoad; i++) {
    const shimmer = document.createElement("div");
    shimmer.className = "product-item shimmer";
    productGrid.appendChild(shimmer);
  }
};

const hideLoading = () => {
  document.querySelectorAll(".shimmer").forEach((shimmer) => shimmer.remove());
};

const showError = (message) => {
  const productGrid = document.getElementById("product-grid");
  productGrid.innerHTML = `<p style="color:red;">${message}</p>`;
};

// Handle resizing events to adjust products per load for mobile view

const handleResize = () => {
  productsPerLoad = window.innerWidth <= 768 ? 5 : 10; // Adjust number of products to show per load

  displayedProducts = 0;

  document.getElementById("product-grid").innerHTML = "";

  displayProducts();
};
