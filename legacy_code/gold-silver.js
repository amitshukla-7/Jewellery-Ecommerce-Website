import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

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

/* ================= DOM ELEMENTS ================= */
const goldEl = document.getElementById("gold-rate");
const silverEl = document.getElementById("silver-rate");
const updatedEl = document.getElementById("last-updated");
const productList = document.getElementById("product-list");
const searchInput = document.getElementById("searchInput");

/* Chart DOM */
const chartCanvas = document.getElementById("priceChart");
const chartFilter = document.getElementById("chartFilter");
let chart;

let allProducts = [];
let currentRates = { goldRate: 0, silverRate: 0 };
let goldHistory = {};
let silverHistory = {};
let currentFilter = "both";

/* ================= HELPER FUNCTIONS ================= */
function getProductPrice(product) {
  if (product.metalType && product.weight) {
    const rate = product.metalType === "gold" ? currentRates.goldRate : currentRates.silverRate;
    return rate * product.weight + (product.makingCharge || 0);
  }
  return product.price || 0;
}

function renderProducts(products) {
  productList.innerHTML = "";
  if (!products.length) {
    productList.innerHTML = "<p style='text-align:center'>No products found.</p>";
    return;
  }

  products.forEach(p => {
    const price = getProductPrice(p);
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <a href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}">
        <h3 style="color:#222222">${p.name}</h3>
        <p style="
        color:#b68C3A;
        font-weight:bold;
        font-family:playfair display serif;
        font-size: 20px;
                        ">₹${Number(price).toLocaleString("en-IN")}</p>
      </a>
    `;
    productList.appendChild(div);
  });
}

// Format date as DD MMM YYYY
function formatDateDMY(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("default", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function renderChart(labels, goldData = [], silverData = []) {
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext("2d");
  if (chart) chart.destroy();

  const datasets = [];
  if (currentFilter === "gold" || currentFilter === "both") {
    datasets.push({
      label: "Gold Price (₹/g)",
      data: goldData,
      borderColor: "gold",
      backgroundColor: "rgba(255,215,0,0.1)",
      tension: 0.3,
      fill: true
    });
  }
  if (currentFilter === "silver" || currentFilter === "both") {
    datasets.push({
      label: "Silver Price (₹/g)",
      data: silverData,
      borderColor: "silver",
      backgroundColor: "rgba(192,192,192,0.1)",
      tension: 0.3,
      fill: true
    });
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels.map(formatDateDMY),
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: false } }
    }
  });
}

/* ================= LOAD METAL RATES ================= */
function loadRates() {
  onValue(ref(db, "metalRates/current"), snap => {
    if (!snap.exists()) return;

    const { goldRate = 0, silverRate = 0, updatedAt } = snap.val();
    currentRates = { goldRate, silverRate };

    goldEl.innerText = `₹${Number(goldRate).toLocaleString("en-IN")} `;
    silverEl.innerText = `₹${Number(silverRate).toLocaleString("en-IN")} `;

    if (updatedAt) updatedEl.innerText = "Last updated: " + new Date(updatedAt).toLocaleString();

    renderProducts(allProducts);
    updateChart();
  });
}

/* ================= LOAD PRODUCTS ================= */
function loadProducts() {
  onValue(ref(db, "products"), snap => {
    const data = snap.val();
    allProducts = [];

    if (!data) {
      renderProducts([]);
      return;
    }

    Object.entries(data).forEach(([id, p]) => {
      if (p.category?.toLowerCase() === "gold-silver") {
        allProducts.push({ ...p, id });
      }
    });

    renderProducts(allProducts);
  });
}

/* ================= LOAD CHART HISTORY ================= */
function loadHistory() {
  const goldRef = ref(db, "metalRates/history/gold");
  const silverRef = ref(db, "metalRates/history/silver");

  onValue(goldRef, snap => {
    if (!snap.exists()) return;
    goldHistory = {};
    Object.entries(snap.val()).forEach(([key, val]) => {
      const rate = typeof val === "object" && val.rate !== undefined ? val.rate : val;
      goldHistory[key] = rate; // use the key directly
    });
    updateChart();
  });

  onValue(silverRef, snap => {
    if (!snap.exists()) return;
    silverHistory = {};
    Object.entries(snap.val()).forEach(([key, val]) => {
      const rate = typeof val === "object" && val.rate !== undefined ? val.rate : val;
      silverHistory[key] = rate; // use the key directly
    });
    updateChart();
  });
}

/* ================= UPDATE CHART BASED ON FILTER ================= */
function updateChart() {
  const allDates = Array.from(new Set([...Object.keys(goldHistory), ...Object.keys(silverHistory)]))
    .sort()
    .slice(-7);

  const goldValues = allDates.map(d => goldHistory[d] || null);
  const silverValues = allDates.map(d => silverHistory[d] || null);

  renderChart(allDates, goldValues, silverValues);
}

/* ================= SEARCH FUNCTION ================= */
if (searchInput) {
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const q = searchInput.value.toLowerCase();
      renderProducts(
        allProducts.filter(p =>
          p.name.toLowerCase().includes(q) ||
          getProductPrice(p).toString().includes(q)
        )
      );
    }
  });
}

/* ================= CHART FILTER ================= */
if (chartFilter) {
  chartFilter.addEventListener("change", e => {
    currentFilter = e.target.value;
    updateChart();
  });
}

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", () => {
  loadRates();
  loadProducts();
  loadHistory();
});
