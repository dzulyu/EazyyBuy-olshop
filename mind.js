// =======================
// DATA PRODUK (MASTER)
// =======================
const initialProducts = [
    {id: 1, name:"Tang Krimping Pro", price:54000, img:"tangkrimping.jpeg", rating: 4.8, ratingCount: 12, sold: 145, desc: "Alat press konektor RJ45 berkualitas industri, tajam dan awet."},
    {id: 2, name:"Digital LAN Tester", price:85000, img:"lantester.jpeg", rating: 4.5, ratingCount: 8, sold: 92, desc: "Cek koneksi kabel LAN dengan cepat dan akurat. Dilengkapi indikator LED."},
    {id: 3, name:"Kabel LAN Cat6 30m", price:120000, img:"kabel.jpeg", rating: 4.9, ratingCount: 25, sold: 310, desc: "Kabel UTP Cat6 high speed, cocok untuk gaming dan kantor tanpa lag."},
    {id: 4, name:"RJ-45 Gold Connector", price:45000, img:"rj45.jpeg", rating: 4.7, ratingCount: 56, sold: 850, desc: "Isi 50 pcs konektor lapis emas untuk transmisi data terbaik."}
];

// =======================
// WHATSAPP CONFIG
// =======================
const phoneWA = "6288210149167";

function sendToWhatsApp(message){
    const url = `https://wa.me/${phoneWA}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

// =======================
// INIT STORAGE & STATE
// =======================
let products = JSON.parse(localStorage.getItem('eazyybuy_products')) || initialProducts;
let cart = JSON.parse(localStorage.getItem('eazyybuy_cart')) || [];

cart.forEach(item => {
    if(item.checked === undefined) item.checked = true;
});

// =======================
// CORE FUNCTIONS
// =======================
function syncPrices(){
    products.forEach(p => {
        let updated = initialProducts.find(i => i.id === p.id);
        if(updated){
            p.price = updated.price;
            p.img = updated.img; 
        }
    });
    cart.forEach(item => {
        let updated = initialProducts.find(i => i.id === item.id);
        if(updated) item.price = updated.price;
    });
    saveData();
}

function saveData() {
    localStorage.setItem('eazyybuy_products', JSON.stringify(products));
    localStorage.setItem('eazyybuy_cart', JSON.stringify(cart));
}

function saveAndRefresh() {
    saveData();
    renderProducts();
}

// =======================
// RATING SYSTEM
// =======================
function setRating(productIdx, stars) {
    stars = parseInt(stars);
    let p = products[productIdx];

    let total = (p.rating * p.ratingCount) + stars;
    p.ratingCount += 1;
    p.rating = total / p.ratingCount;

    alert(`Terima kasih! Anda memberikan rating ${stars} bintang untuk ${p.name}`);
    saveAndRefresh();
}

// =======================
// UI RENDERING
// =======================
function renderProducts() {
    const list = document.getElementById("productList");
    if(!list) return;
    list.innerHTML = "";

    products.forEach((p, idx) => {
        list.innerHTML += `
        <div class="card">
            <img src="${p.img}" alt="${p.name}">
            <h4>${p.name}</h4>

            <div class="rating-info">⭐ ${p.rating.toFixed(1)} 
                <span class="rating-count">(${p.ratingCount}) | Terjual ${p.sold}</span>
            </div>

            <div class="stars">
                <label><input type="radio" name="star-${idx}" value="5" onclick="setRating(${idx}, this.value)">★</label>
                <label><input type="radio" name="star-${idx}" value="4" onclick="setRating(${idx}, this.value)">★</label>
                <label><input type="radio" name="star-${idx}" value="3" onclick="setRating(${idx}, this.value)">★</label>
                <label><input type="radio" name="star-${idx}" value="2" onclick="setRating(${idx}, this.value)">★</label>
                <label><input type="radio" name="star-${idx}" value="1" onclick="setRating(${idx}, this.value)">★</label>
            </div>

            <p>${p.desc}</p>
            <div class="price">Rp${p.price.toLocaleString()}</div>

            <div class="quantity">
                <button onclick="updateQtyUI('${idx}', -1)">-</button>
                <input id="ui-qty-${idx}" value="1" readonly>
                <button onclick="updateQtyUI('${idx}', 1)">+</button>
            </div>

            <!-- FIX TOMBOL -->
            <button class="buy" onclick="buyDirect(${idx})">Beli Sekarang</button>
            <button class="buy secondary" onclick="addToCart(${idx})">Tambah Keranjang</button>
        </div>`;
    });

    document.getElementById("cartCount").innerText = cart.reduce((a,b)=>a+b.qty,0);
}

function updateQtyUI(idx, delta) {
    let el = document.getElementById(`ui-qty-${idx}`);
    let val = parseInt(el.value) + delta;
    if (val >= 1) el.value = val;
}

// =======================
// CART
// =======================
function addToCart(idx) {
    let qty = parseInt(document.getElementById(`ui-qty-${idx}`).value);
    let p = products[idx];

    let exist = cart.find(item => item.id === p.id);
    if(exist) exist.qty += qty;
    else cart.push({...p, qty, checked:true});

    saveAndRefresh();
    alert("Masuk keranjang");
}

function toggleItem(i){
    cart[i].checked = !cart[i].checked;
    saveData();
}

function openCart() {
    let html = "";
    cart.forEach((item, i) => {
        html += `
        <div>
            <input type="checkbox" ${item.checked ? "checked":""} onchange="toggleItem(${i})">
            ${item.name} (${item.qty}x)
            <button onclick="removeItem(${i})">Hapus</button>
        </div>`;
    });

    document.getElementById("cartItems").innerHTML = html || "Kosong";
    document.getElementById("cartModal").style.display = "flex";
}

function removeItem(i){
    cart.splice(i,1);
    saveAndRefresh();
    openCart();
}

function closeCart(){
    document.getElementById("cartModal").style.display = "none";
}

// =======================
// CHECKOUT WA
// =======================
function openCheckout() {
    let selected = cart.filter(item => item.checked);
    if(selected.length === 0) return alert("Pilih produk dulu!");

    let message = `*--- PESANAN BARU ---*\n\n`;
    let total = 0;

    selected.forEach(item => {
        let sub = item.price * item.qty;
        total += sub;

        message += `🛒 ${item.name}\n📦 ${item.qty}x\n💰 Rp${sub.toLocaleString()}\n\n`;
    });

    message += `💰 Total: Rp${total.toLocaleString()}\n\n`;
    message += `👤 Nama:\n📍 Alamat:\n\nTerima kasih 🙏`;

    sendToWhatsApp(message);

    cart = cart.filter(item => !item.checked);
    saveAndRefresh();
    closeCart();
}

// =======================
// BELI LANGSUNG
// =======================
function buyDirect(idx) {
    let qty = parseInt(document.getElementById(`ui-qty-${idx}`).value);
    let p = products[idx];

    let total = p.price * qty;

    let message = `*--- PESANAN BARU ---*\n\n`;
    message += `🛒 ${p.name}\n📦 ${qty}\n💰 Rp${total.toLocaleString()}\n\n`;
    message += `👤 Nama:\n📍 Alamat:\n\nTerima kasih 🙏`;

    sendToWhatsApp(message);
}

// =======================
// INIT
// =======================
syncPrices();
renderProducts();