const API_URL = "http://localhost:5000/api/farmer";

// Helper to convert file to Base64
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

document.getElementById("addProductForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const farmerId = localStorage.getItem("farmerId");
    if (!farmerId) {
        alert("Please login first!");
        // window.location.href = "login.html"; // Uncomment if login page exists
        return;
    }

    const fileInput = document.getElementById("productImage");
    const file = fileInput.files[0];
    let base64Image = "";

    if (file) {
        base64Image = await convertToBase64(file);
    }

    const productData = {
        farmerId,
        name: document.getElementById("productName").value,
        price: document.getElementById("price").value,
        quantity: document.getElementById("quantity").value,
        unit: document.getElementById("unit").value,
        category: document.getElementById("category").value,
        image: base64Image
    };

    try {
        const response = await fetch(`${API_URL}/add-product`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            document.getElementById("addProductForm").reset();
            loadProducts();
        } else {
            alert(data.error || "Failed to add product");
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to server");
    }
});

async function loadProducts() {
    const farmerId = localStorage.getItem("farmerId");
    if (!farmerId) {
        document.getElementById("productList").innerHTML = "<tr><td colspan='6'>Please login to see your products</td></tr>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${farmerId}`);
        const products = await response.json();

        // --- Calculate Inventory Summary ---
        const total = products.length;
        const available = products.filter(p => p.quantity > 0).length;
        const outOfStock = products.filter(p => p.quantity <= 0).length;

        document.getElementById("total-count").textContent = total;
        document.getElementById("available-count").textContent = available;
        document.getElementById("out-of-stock-count").textContent = outOfStock;

        const list = document.getElementById("productList");
        list.innerHTML = "";

        products.forEach(p => {
            const statusClass = p.isApproved ? "status-approved" : "status-pending";
            const statusText = p.isApproved ? "Approved" : "Pending";
            const statusStyle = p.isApproved ? "color: #27ae60; background: #e8f8f0;" : "color: #f39c12; background: #fef5e7;";
            const imageUrl = p.image ? `http://localhost:5000${p.image}` : 'placeholder.jpg';
            
            const isOutOfStock = p.quantity <= 0;
            const stockBadge = isOutOfStock ? 
                `<br><span style="color:white; background:#d32f2f; padding:2px 8px; border-radius:10px; font-size:0.7rem;">Out of Stock</span>` : 
                '';

            list.innerHTML += `
                <tr>
                    <td><img src="${imageUrl}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"></td>
                    <td style="font-weight: 600;">${p.name}</td>
                    <td>₹${p.price}</td>
                    <td>
                        <span id="qty-${p._id}">${p.quantity}</span> 
                        <span style="color: #7f8c8d; font-size: 0.85rem;">${p.unit}</span>
                        ${stockBadge}
                    </td>
                    <td>
                        <span class="status-badge" style="${statusStyle}">${statusText}</span>
                    </td>
                    <td>
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <button class="restock-btn" style="background:#2e7d32; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;" onclick="openRestockModal('${p._id}', '${p.name}')"><i class="fa-solid fa-plus"></i> Restock</button>
                            <button class="out-stock-btn" style="background:#f39c12; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;" onclick="markOutOfStock('${p._id}')"><i class="fa-solid fa-ban"></i> Set Out of Stock</button>
                            <button class="delete-btn" onclick="deleteProduct('${p._id}')"><i class="fa-solid fa-trash-can"></i> Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
    }
}

async function deleteProduct(id) {
    if (!confirm("Are you sure?")) return;
    try {
        await fetch(`${API_URL}/delete-product/${id}`, { method: "DELETE" });
        loadProducts();
    } catch (err) { console.error(err); }
}

// --- Stock Management Actions ---
async function markOutOfStock(id) {
    if (!confirm("Mark this product as out of stock permanently? (Until restocked)")) return;
    try {
        const res = await fetch(`${API_URL}/mark-out-of-stock/${id}`, { 
            method: "PATCH",
            headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            loadProducts();
            loadNotifications();
        }
    } catch (err) { console.error(err); }
}

let activeRestockId = null;
window.openRestockModal = (id, name) => {
    activeRestockId = id;
    const currentQty = document.getElementById(`qty-${id}`).textContent;
    document.getElementById("restockProductName").textContent = name;
    document.getElementById("currentStockDisplay").textContent = `Current Stock: ${currentQty}`;
    document.getElementById("newQuantity").value = ''; // Reset input
    document.getElementById("restockModal").style.display = "block";
};

document.getElementById("cancelRestock").onclick = () => {
    document.getElementById("restockModal").style.display = "none";
};

document.getElementById("confirmRestock").onclick = async () => {
    const qty = document.getElementById("newQuantity").value;
    if (!qty || qty <= 0) return alert("Please enter a valid positive quantity to add");

    try {
        const res = await fetch(`${API_URL}/update-product-stock/${activeRestockId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: Number(qty) })
        });
        if (res.ok) {
            const data = await res.json();
            document.getElementById("restockModal").style.display = "none";
            loadProducts();
            alert(`Restock successful!\nUpdated total for ${data.product.name} is now ${data.product.quantity} ${data.product.unit}`);
        }
    } catch (err) { console.error(err); }
};

// --- Notification Logic ---
async function loadNotifications() {
    const farmerId = localStorage.getItem("farmerId");
    if (!farmerId) return;

    try {
        const res = await fetch(`http://localhost:5000/api/notifications/farmer/${farmerId}`);
        const notifications = await res.json();
        
        const card = document.getElementById("notificationsCard");
        const list = document.getElementById("notificationsList");
        
        if (notifications.length > 0) {
            card.style.display = "block";
            list.innerHTML = notifications.map(n => `
                <div style="padding:10px; border-bottom:1px solid #eee; background:${n.isRead ? 'white' : '#fff5f5'}">
                    <p style="margin:0; font-size:0.9rem;">${n.message}</p>
                    <span style="font-size:0.75rem; color:#888;">${new Date(n.createdAt).toLocaleString()}</span>
                    ${!n.isRead ? `<button onclick="markAsRead('${n._id}')" style="margin-left:10px; font-size:0.7rem; cursor:pointer; background:none; border:1px solid #ccc; border-radius:3px;">Mark as Read</button>` : ''}
                </div>
            `).join('');
        } else {
            card.style.display = "none";
        }
    } catch (err) { console.error(err); }
}

async function markAsRead(id) {
    try {
        await fetch(`http://localhost:5000/api/notifications/read/${id}`, { method: 'PATCH' });
        loadNotifications();
    } catch (err) { console.error(err); }
}

// --- Profile Sync Logic ---
const farmerId = localStorage.getItem("farmerId");
const farmerNameElement = document.getElementById("farmer-name");
const farmerEmailElement = document.getElementById("farmer-email");
const farmerPhoneElement = document.getElementById("farmer-phone");
const farmerLocationElement = document.getElementById("farmer-location");
const authButtonContainer = document.getElementById("authButton");

function getCleanValue(val) {
    return (val && val !== 'undefined' && val !== 'null') ? val : 'N/A';
}

function updateProfileUI() {
    if (farmerId) {
        farmerNameElement.textContent = getCleanValue(localStorage.getItem("farmerName"));
        farmerEmailElement.textContent = getCleanValue(localStorage.getItem("farmerEmail"));
        farmerPhoneElement.textContent = getCleanValue(localStorage.getItem("farmerPhone"));
        if (farmerLocationElement) farmerLocationElement.textContent = getCleanValue(localStorage.getItem("farmerLocation"));
        authButtonContainer.innerHTML = `<button class="logout-btn" id="farmerLogout">Logout</button>`;
        
        document.getElementById("farmerLogout").onclick = () => {
            localStorage.clear();
            window.location.reload();
        };
        syncFarmerProfile();
    } else {
        // Logged out state
        farmerNameElement.textContent = "N/A";
        farmerEmailElement.textContent = "N/A";
        farmerPhoneElement.textContent = "N/A";
        if (farmerLocationElement) farmerLocationElement.textContent = "N/A";
        authButtonContainer.innerHTML = `<a href="farmerLogin.html" class="login-link">Login</a>`;
    }
}

async function syncFarmerProfile() {
    if (!farmerId) return;
    try {
        const response = await fetch(`${API_URL}/profile/${farmerId}`);
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("farmerName", data.name);
            localStorage.setItem("farmerEmail", data.email);
        localStorage.setItem("farmerPhone", data.phone);
            localStorage.setItem("farmerLocation", data.location || "N/A");
            
            farmerNameElement.textContent = data.name;
            farmerEmailElement.textContent = getCleanValue(data.email);
            farmerPhoneElement.textContent = getCleanValue(data.phone);
            if (farmerLocationElement) farmerLocationElement.textContent = getCleanValue(data.location);
            loadNotifications();
        }
    } catch (err) {
        console.error("Profile Sync Error:", err);
    }
}

// Update UI and start intervals
updateProfileUI();
loadProducts();
loadNotifications();
setInterval(loadNotifications, 30000); // Refresh notifications every 30s
