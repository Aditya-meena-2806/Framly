const API_URL = "http://localhost:5000/api/admin";

// --- Profile & Auth logic ---
const adminId = localStorage.getItem("adminId");
const adminNameElement = document.getElementById("admin-name");
const authButtonContainer = document.getElementById("authButton");

function updateAdminUI() {
    if (adminId) {
        adminNameElement.textContent = localStorage.getItem("adminName") || "Admin";
        authButtonContainer.innerHTML = `<button class="logout-btn" id="adminLogout">Logout</button>`;
        
        document.getElementById("adminLogout").onclick = () => {
            localStorage.removeItem("adminId");
            localStorage.removeItem("adminName");
            window.location.reload();
        };
        syncAdminProfile();
    } else {
        adminNameElement.textContent = "N/A";
        authButtonContainer.innerHTML = `<a href="login.html" class="login-link">Login</a>`;
    }
}

async function syncAdminProfile() {
    if (!adminId) return;
    try {
        const response = await fetch(`${API_URL}/profile/${adminId}`);
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("adminName", data.username);
            adminNameElement.textContent = data.username;
        }
    } catch (err) {
        console.error("Profile sync failed", err);
    }
}

// --- Dashboard Features ---

// Load Pending Products
async function loadPendingProducts() {
    try {
        const response = await fetch(`${API_URL}/pending-products`);
        const products = await response.json();

        const list = document.getElementById("pendingList");
        const noMsg = document.getElementById("noPendingMsg");
        const table = document.getElementById("pendingTable");

        list.innerHTML = "";

        if (products.length === 0) {
            table.closest('.card').style.display = "block"; // Keep card but hide table/show msg
            table.style.display = "none";
            noMsg.style.display = "block";
            return;
        }

        table.style.display = "table";
        noMsg.style.display = "none";

        products.forEach(p => {
            const imageUrl = p.image ? `http://localhost:5000${p.image}` : 'placeholder.jpg';
            list.innerHTML += `
                <tr>
                    <td><img src="${imageUrl}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"></td>
                    <td style="font-weight: 600;">${p.name}</td>
                    <td><span style="color: #666;"><i class="fa-solid fa-user-tag" style="font-size: 0.8rem;"></i> ${p.farmerId ? p.farmerId.name : 'Unknown'}</span></td>
                    <td><span style="font-weight: 600; color: #34495e;">₹${p.price}</span></td>
                    <td><span class="status-badge" style="background: #eef2f7; color: #5d6d7e;">${p.category}</span></td>
                    <td>
                        <button class="action-btn approve-btn" onclick="approveProduct('${p._id}')"><i class="fa-solid fa-check"></i> Approve</button>
                        <button class="action-btn reject-btn" onclick="rejectProduct('${p._id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading products:", err);
    }
}

async function approveProduct(id) {
    if (!confirm("Approve this product for sale?")) return;
    try {
        const res = await fetch(`${API_URL}/approve-product/${id}`, { method: "PUT" });
        if(res.ok) loadPendingProducts();
    } catch (err) { console.error(err); }
}

async function rejectProduct(id) {
    if (!confirm("Reject and delete this product listing?")) return;
    try {
        const res = await fetch(`${API_URL}/reject-product/${id}`, { method: "DELETE" });
        if(res.ok) loadPendingProducts();
    } catch (err) { console.error(err); }
}

// Load Farmers
async function loadFarmers() {
    try {
        const response = await fetch(`${API_URL}/farmers`);
        const farmers = await response.json();
        const list = document.getElementById("farmerList");
        list.innerHTML = "";

        farmers.forEach(f => {
            const statusStyle = f.approved ? "color: #27ae60; background: #e8f8f0;" : "color: #f39c12; background: #fef5e7;";
            const statusText = f.approved ? "Verified" : "Pending";
            const actionBtn = f.approved ? 
                `<span style="color: #bdc3c7; font-size: 0.85rem;"><i class="fa-solid fa-circle-check"></i> Already Verified</span>` : 
                `<button class="action-btn approve-btn" onclick="approveFarmer('${f._id}')"><i class="fa-solid fa-user-plus"></i> Approve Farmer</button>`;

            list.innerHTML += `
                <tr>
                    <td style="font-weight: 600;">${f.name}</td>
                    <td>${f.email}</td>
                    <td><span class="status-badge" style="${statusStyle}">${statusText}</span></td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        });
    } catch (err) { console.error(err); }
}

async function approveFarmer(id) {
    if (!confirm("Verify this farmer account?")) return;
    try {
        const res = await fetch(`${API_URL}/approve-farmer/${id}`, { method: "PUT" });
        if(res.ok) loadFarmers();
    } catch (err) { console.error(err); }
}

// Load Customers
async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}/customers`);
        const users = await response.json();
        const list = document.getElementById("userList");
        list.innerHTML = "";

        users.forEach(u => {
            const isBlocked = u.isBlocked;
            const statusStyle = isBlocked ? "color: #e74c3c; background: #fff0f0;" : "color: #27ae60; background: #e8f8f0;";
            const statusText = isBlocked ? "Blocked" : "Active";
            
            const btnClass = isBlocked ? 'approve-btn' : 'reject-btn';
            const btnIcon = isBlocked ? '<i class="fa-solid fa-user-check"></i>' : '<i class="fa-solid fa-user-slash"></i>';
            const btnText = isBlocked ? 'Unblock' : 'Block';

            list.innerHTML += `
                <tr>
                    <td style="font-weight: 600;">${u.name}</td>
                    <td>${u.email}</td>
                    <td><span class="status-badge" style="background: #eef2f7; color: #5d6d7e;">Customer</span></td>
                    <td><span class="status-badge" style="${statusStyle}">${statusText}</span></td>
                    <td>
                        <button class="action-btn ${btnClass}" onclick="toggleBlockUser('${u._id}')">${btnIcon} ${btnText}</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) { console.error(err); }
}

async function toggleBlockUser(id) {
    try {
        const res = await fetch(`${API_URL}/block-user/${id}`, { method: "PUT" });
        if(res.ok) loadCustomers();
    } catch (err) { console.error(err); }
}

// Initial Load
updateAdminUI();
loadPendingProducts();
loadFarmers();
loadCustomers();
