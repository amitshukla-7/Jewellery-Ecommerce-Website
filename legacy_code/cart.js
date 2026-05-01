import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove
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

const cartContainer = document.getElementById("cart-items");
const totalElement = document.getElementById("cart-total");
const totalPayableElement = document.getElementById("cart-total-payable");

function renderCart(cartItems) {
  cartContainer.innerHTML = "";
  let total = 0;

  Object.entries(cartItems).forEach(([id, item]) => {
    total += item.price;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="item-details">
        <h4>${item.name}</h4>
        <p>₹${item.price.toLocaleString()}</p>
      </div>
      <div class="cart-actions">
        <button class="remove-btn" data-id="${id}">Remove</button>
      </div>
    `;

    cartContainer.appendChild(cartItem);
  });

  totalElement.textContent = total.toLocaleString();
  totalPayableElement.textContent = total.toLocaleString();

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const productId = btn.getAttribute("data-id");
      removeItemFromCart(productId);
    });
  });
}

function removeItemFromCart(productId) {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const cartRef = ref(db, `carts/${user.uid}/${productId}`);
    remove(cartRef).then(() => {
      loadCartItems();
    });
  });
}

function loadCartItems() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // ✅ Fix here
    const userCartRef = ref(db, `carts/${user.uid}`);
    onValue(userCartRef, (snapshot) => {
      const cartData = snapshot.val();
      if (cartData) {
        renderCart(cartData);
      } else {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        totalElement.textContent = "0";
        totalPayableElement.textContent = "0";
      }
    });
  });
}

loadCartItems();
