import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAcIX5XXvSQnCro67KK9_jF0AOGg2mDxVc",
  authDomain: "savitri-jewellers-76184.firebaseapp.com",
  projectId: "savitri-jewellers-76184",
  storageBucket: "savitri-jewellers-76184.appspot.com",
  messagingSenderId: "914460735352",
  appId: "1:914460735352:web:d60778c5486d29db983a8d",
  databaseURL: "https://savitri-jewellers-76184-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const productContainer = document.getElementById("productDetail");

if (!productId) {
  productContainer.innerHTML = "<p>Product not found.</p>";
} else {
  const dbRef = ref(db, "products/" + productId);
  onValue(dbRef, (snapshot) => {
    const product = snapshot.val();
    if (!product) {
      productContainer.innerHTML = "<p>Product not found.</p>";
      return;
    }

    productContainer.innerHTML = `
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="product-info">
        <h1>${product.name}</h1>
        <div class="price">₹${product.price.toLocaleString()}</div>
        <p class="description">${product.description}</p>
        <div class="product-buttons">
          <button class="buy-now" 
        onclick="window.open('https://wa.me/917518401808?text=Hello%2C%20I%20want%20to%20place%20an%20order','_blank')">
        Buy Now
        </button>
          <button class="add-to-cart">Add to Cart</button>
        </div>
      </div>
      <div id="cart-popup" class="popup">✔ Added to cart</div>
    `;

    document.querySelector(".add-to-cart").addEventListener("click", () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          const cartRef = ref(db, `carts/${user.uid}/${productId}`);
          const productData = {
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image
          };
          set(cartRef, productData)
            .then(() => {
              showPopup();
            })
            .catch((error) => {
              alert("Failed to add to cart: " + error.message);
            });
        } else {
          window.location.href = "login.html";
        }
      });
    });
  });
}

// Show popup
function showPopup() {
  const popup = document.getElementById("cart-popup");
  popup.style.display = "block";
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
    popup.style.display = "none";
  }, 2000);
}
