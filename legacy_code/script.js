// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAcIX5XXvSQnCro67KK9_jF0AOGg2mDxVc",
  authDomain: "savitri-jewellers-76184.firebaseapp.com",
  projectId: "savitri-jewellers-76184",
  storageBucket: "savitri-jewellers-76184.appspot.com",
  messagingSenderId: "914460735352",
  appId: "1:914460735352:web:d60778c5486d29db983a8d",
  databaseURL: "https://savitri-jewellers-76184-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM references
const searchInput = document.getElementById("searchInput");
const searchBarContainer = document.querySelector('.search-icon-input');
const productList = document.getElementById("product-list");

// Focus input when clicking anywhere in the search bar container
if (searchBarContainer && searchInput) {
  searchBarContainer.addEventListener("click", () => {
    searchInput.focus();
  });
}

// Firebase-powered search
if (searchInput && productList) {
  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    if (query === "") {
      productList.innerHTML = ""; // Clear results
      return;
    }

    const productsRef = ref(db, "products/");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const matched = [];

      for (const key in data) {
        const product = data[key];
        if (product.name && product.name.toLowerCase().includes(query)) {
          matched.push({ id: key, ...product });
        }
      }

      displayProducts(matched);
    });
  });
}

// Render matching products
function displayProducts(products) {
  if (products.length === 0) {
    productList.innerHTML = "<p>No matching products found.</p>";
    return;
  }

  productList.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>₹${product.price.toLocaleString()}</p>
    </div>
  `).join("");
}

// Handle product card click using event delegation
if (productList) {
  productList.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;

    const productId = card.getAttribute("data-id");
    if (productId) {
      window.location.href = `product.html?id=${productId}`;
    }
  });
}


/*hamburger menu*/

document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger");
  const sideMenu = document.querySelector(".side-menu");
  const closeBtn = document.querySelector(".close-btn");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      sideMenu.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      sideMenu.classList.remove("active");
    });
  }

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    if (
      sideMenu.classList.contains("active") &&
      !sideMenu.contains(event.target) &&
      !hamburger.contains(event.target)
    ) {
      sideMenu.classList.remove("active");
    }
  });
});

const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const hamburger = document.getElementById("hamburgerMenu");
const closeMenu = document.getElementById("closeMenu");

hamburger.addEventListener("click", () => {
  sideMenu.classList.add("open");
  overlay.classList.add("active");
});

closeMenu.addEventListener("click", () => {
  sideMenu.classList.remove("open");
  overlay.classList.remove("active");
});

overlay.addEventListener("click", () => {
  sideMenu.classList.remove("open");
  overlay.classList.remove("active");
});
