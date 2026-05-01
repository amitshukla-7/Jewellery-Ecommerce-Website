import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
  update,
  get
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ================= FIREBASE INIT ================= */
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

/* ================= ADMIN POPUP ================= */
function showAdminPopup(message) {
  let popup = document.getElementById("admin-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "admin-popup";
    popup.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #222;
      color: #fff;
      padding: 12px 18px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 9999;
    `;
    document.body.appendChild(popup);
  }
  popup.textContent = message;
  popup.style.display = "block";
  setTimeout(() => popup.style.display = "none", 2000);
}

/* ================= INPUT REFERENCES ================= */
const nameInput = document.getElementById("name");
const imageInput = document.getElementById("image");
const imageFileInput = document.getElementById("imageFile");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");

const metalTypeInput = document.getElementById("metalType");
const weightInput = document.getElementById("weight");
const makingChargeInput = document.getElementById("makingCharge");

/* ================= AUTH ================= */
const adminContent = document.querySelector("main");
if (adminContent) adminContent.style.display = "none";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "/login.html";
    return;
  }

  const roleSnap = await get(ref(db, `users/${user.uid}/role`));
  if (roleSnap.val() !== "admin") {
    alert("Access denied");
    location.href = "/";
    return;
  }

  adminContent.style.display = "block";
  loadProducts();
  loadUsers();
  loadInvestments();
  loadRates();
});

window.logout = () => signOut(auth).then(() => location.href = "/login.html");

/* ================= METAL RATES ================= */
const goldRateInput = document.getElementById("goldRate");
const silverRateInput = document.getElementById("silverRate");
const saveRatesBtn = document.getElementById("saveRates");

function loadRates() {
  onValue(ref(db, "metalRates/current"), (snap) => {
    const r = snap.val();
    if (!r) return;
    goldRateInput.value = r.goldRate || "";
    silverRateInput.value = r.silverRate || "";
  });
}

/* ===== 🔥 AUTO UPDATE PRODUCT PRICES (ADDED SAFELY) ===== */
async function updateAllProductPrices(rates) {
  const snap = await get(ref(db, "products"));
  if (!snap.exists()) return;

  const products = snap.val();
  Object.entries(products).forEach(([id, p]) => {
    if (p.metalType && p.weight) {
      const rate = p.metalType === "gold"
        ? rates.goldRate
        : rates.silverRate;

      if (!rate) return;

      const newPrice = rate * p.weight + (p.makingCharge || 0);
      update(ref(db, "products/" + id), { price: newPrice });
    }
  });
}

/* ================= SAVE RATES ================= */
if (saveRatesBtn) {
  saveRatesBtn.onclick = async () => {
    const goldRate = parseFloat(goldRateInput.value);
    const silverRate = parseFloat(silverRateInput.value);

    if (isNaN(goldRate) || isNaN(silverRate)) {
      alert("Enter valid rates");
      return;
    }

    await set(ref(db, "metalRates/current"), {
      goldRate,
      silverRate,
      updatedAt: Date.now()
    });

    await updateAllProductPrices({ goldRate, silverRate });

    showAdminPopup("Rates & product prices updated");
  };
}

/* ================= PRODUCTS ================= */
const productList = document.getElementById("productList");
const form = document.getElementById("addProductForm");
let editingProductId = null;

function calculatePrice(metalType, weight, makingCharge, rates) {
  if (!metalType || !weight || !rates) return null;
  const rate = metalType === "gold" ? rates.goldRate : rates.silverRate;
  return rate ? rate * weight + (makingCharge || 0) : null;
}

function loadProducts() {
  onValue(ref(db, "products"), (snap) => {
    productList.innerHTML = "";
    const products = snap.val();
    if (!products) return;

    Object.entries(products).forEach(([id, p]) => {
      productList.innerHTML += `
        <div class="product-card">
          <img src="${p.image}" width="100">
          <h3>${p.name}</h3>
          <p>₹${p.price}</p>
          <p>${p.description}</p>
          <button onclick="editProduct('${id}')">Edit</button>
          <button onclick="deleteProduct('${id}')">Delete</button>
        </div>
      `;
    });
  });
}

/* ===== ADD / EDIT PRODUCT (UNCHANGED LOGIC) ===== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ratesSnap = await get(ref(db, "metalRates/current"));
  const rates = ratesSnap.val();

  const calculated = calculatePrice(
    metalTypeInput.value,
    parseFloat(weightInput.value),
    parseFloat(makingChargeInput.value),
    rates
  );

  const finalPrice = calculated ?? parseFloat(priceInput.value);
  if (isNaN(finalPrice)) return alert("Price missing");

  const saveProduct = (imageData) => {
    const data = {
      name: nameInput.value.trim(),
      image: imageData,
      description: descriptionInput.value.trim(),
      category: categoryInput.value,
      price: finalPrice,
      metalType: metalTypeInput.value || null,
      weight: parseFloat(weightInput.value) || null,
      makingCharge: parseFloat(makingChargeInput.value) || null
    };

    if (editingProductId) {
      update(ref(db, "products/" + editingProductId), data);
      showAdminPopup("Product updated");
      editingProductId = null;
    } else {
      set(push(ref(db, "products")), data);
      showAdminPopup("Product added");
    }

    form.reset();
  };

  const file = imageFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => saveProduct(e.target.result);
    reader.readAsDataURL(file);
  } else if (imageInput.value.trim()) {
    saveProduct(imageInput.value.trim());
  } else {
    alert("Image required");
  }
});

/* ================= EDIT ================= */
window.editProduct = async (id) => {
  const snap = await get(ref(db, "products/" + id));
  const p = snap.val();
  if (!p) return;

  nameInput.value = p.name;
  imageInput.value = p.image.startsWith("data:") ? "" : p.image;
  descriptionInput.value = p.description;
  categoryInput.value = p.category;
  priceInput.value = p.price;
  metalTypeInput.value = p.metalType || "";
  weightInput.value = p.weight || "";
  makingChargeInput.value = p.makingCharge || "";

  editingProductId = id;
};

/* ================= DELETE ================= */
window.deleteProduct = (id) =>
  confirm("Delete this product?") &&
  remove(ref(db, "products/" + id)) &&
  showAdminPopup("Product deleted");

/* ================= USERS, INVESTMENTS, TABS ================= */
/* 🔒 EXACTLY SAME AS YOUR OLD CODE — NOT TOUCHED */


/* ================= User Section ================= */
const userList = document.getElementById("userList");
function loadUsers() {
  if (!userList) return;

  const usersRef = ref(db, "users/");
  onValue(usersRef, (snapshot) => {
    userList.innerHTML = "";
    const users = snapshot.val();

    if (users) {
      Object.keys(users).forEach((uid) => {
        const u = users[uid];
        const name = u.name || "N/A";
        const email = u.email || "N/A";
        const signupTime = u.signupTime
          ? new Date(u.signupTime).toLocaleString()
          : "N/A";
        const role = u.role || "user";

        let profileImage = u.profileImage;
        if (!profileImage || profileImage.trim() === "") {
          profileImage =
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
        }

        const div = document.createElement("div");
        div.classList.add("user-card");

        const img = document.createElement("img");
        img.src = profileImage;
        img.alt = "Profile Picture";
        img.width = 60;
        img.height = 60;
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";

        img.onerror = () => {
          img.src =
            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
        };

        div.appendChild(img);

        const info = document.createElement("div");
        info.innerHTML = `
          <h4>${name} ${role === "admin" ? "(Admin)" : ""}</h4>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Signup:</strong> ${signupTime}</p>
        `;
        div.appendChild(info);

        userList.appendChild(div);
      });
    } else {
      userList.innerHTML = "<p>No users found.</p>";
    }
  }, (error) => {
    console.error("Failed to load users:", error);
    userList.innerHTML = "<p>Unable to fetch users. Check DB rules.</p>";
  });
}

/* ================= Investments Section ================= */
const investmentForm = document.getElementById("addInvestmentForm");
const investmentList = document.getElementById("investmentList");
let editingInvestmentId = null;

if (investmentForm) {
  investmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const investorName = document.getElementById("investorName").value;
    const investmentAmount = parseFloat(document.getElementById("investmentAmount").value);
    const investmentDate = document.getElementById("investmentDate").value;

    if (!investorName || isNaN(investmentAmount) || !investmentDate) {
      alert("Please fill in all fields correctly.");
      return;
    }

    const investmentData = { name: investorName, amount: investmentAmount, date: investmentDate };

    if (editingInvestmentId) {
      update(ref(db, "investments/" + editingInvestmentId), investmentData).then(() => {
        investmentForm.reset();
        editingInvestmentId = null;
        alert("Investment updated successfully!");
      });
    } else {
      const newRef = push(ref(db, "investments"));
      set(newRef, investmentData).then(() => {
        investmentForm.reset();
        alert("Investment record added successfully!");
      });
    }
  });
}

function loadInvestments() {
  if (!investmentList) return;
  const investmentsRef = ref(db, "investments/");
  onValue(investmentsRef, (snapshot) => {
    investmentList.innerHTML = "";
    const table = document.createElement("table");
    table.id = "investmentTable";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector("tbody");
    const investments = snapshot.val();

    if (investments) {
      Object.keys(investments).forEach((id) => {
        const inv = investments[id];
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${inv.name}</td>
          <td>₹${inv.amount}</td>
          <td>${inv.date}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editInvestment('${id}')">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteInvestment('${id}')">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" style="text-align:center;">No investments recorded.</td>`;
      tbody.appendChild(tr);
    }

    investmentList.appendChild(table);
  });
}

window.editInvestment = (id) => {
  const investmentRef = ref(db, "investments/" + id);
  onValue(investmentRef, (snapshot) => {
    const inv = snapshot.val();
    if (inv) {
      document.getElementById("investorName").value = inv.name;
      document.getElementById("investmentAmount").value = inv.amount;
      document.getElementById("investmentDate").value = inv.date;
      editingInvestmentId = id;
    }
  }, { onlyOnce: true });
};

window.deleteInvestment = (id) => {
  if (confirm("Are you sure you want to delete this investment?")) {
    remove(ref(db, "investments/" + id));
  }
};

/* ================= Tab Switching ================= */
window.showTab = (id) => {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  const tab = document.getElementById(id);
  if (tab) tab.classList.add("active");

  if (id === "users") loadUsers();
  if (id === "investments") loadInvestments();
  if (id === "products") loadProducts();
};
