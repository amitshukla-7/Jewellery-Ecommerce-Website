import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAcIX5XXvSQnCro67KK9_jF0AOGg2mDxVc",
  authDomain: "savitri-jewellers-76184.firebaseapp.com",
  projectId: "savitri-jewellers-76184",
  storageBucket: "savitri-jewellers-76184.appspot.com",
  messagingSenderId: "914460735352",
  appId: "1:914460735352:web:d60778c5486d29db983a8d",
  databaseURL: "https://savitri-jewellers-76184-default-rtdb.firebaseio.com"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 📦 DOM Elements
const productList = document.getElementById("product-list");
const searchInput = document.getElementById("searchInput");
let earringProducts = [];

// 🎨 Display Products
function displayProducts(products) {
  productList.innerHTML = "";

  if (products.length === 0) {
    productList.innerHTML = `<p style="text-align:center;">No products found.</p>`;
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    // ✅ Use product.image directly (works with Firebase URLs, Base64, or plain filenames)
    const imageSrc = product.image || "images/placeholder.jpg";

    card.innerHTML = `
      <a href="product.html?id=${product.id}" class="product-link">
        <img src="${imageSrc}" alt="${product.name}" />
        <h3 class="product-name">${product.name}</h3>
        <p class="price">₹${product.price.toLocaleString()}</p>
      </a>
    `;

    productList.appendChild(card);
  });
}
// 🔄 Fetch Earring Products
function fetchEarringProducts() {
  const dbRef = ref(db, "products");

  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    earringProducts = [];

    for (let key in data) {
      const item = data[key];
      const category = item.category?.toLowerCase().replace(/\s+/g, "-");
      if (category === "earrings") {
        item.id = key; // Add product ID for linking
        earringProducts.push(item);
      }
    }

    displayProducts(earringProducts);
  });
}

// 🔍 Search Support
if (searchInput) {
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const query = searchInput.value.trim().toLowerCase();
      const filtered = earringProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.price.toString().includes(query)
      );
      displayProducts(filtered);
    }
  });
}

// 🚀 Load on Page Ready
window.addEventListener("DOMContentLoaded", fetchEarringProducts);
