const API_URL = "http://localhost:5000/api/admin";

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    if (path.includes("admin-orders.html")) {
        loadOrderHistory(urlParams.get("userId"));
    } else if (path.includes("admin-products.html")) {
        loadProductHistory(urlParams.get("farmerId"));
    } else if (path.includes("admin-product-status.html")) {
        loadProductStatus();
    }
});

async function loadOrderHistory(userId = null) {
    try {
        const query = userId ? `?userId=${userId}` : "";
        const response = await fetch(`${API_URL}/orders${query}`);
        const orders = await response.json();
        const list = document.getElementById("historyList");
        const noMsg = document.getElementById("noDataMsg");
        const table = document.getElementById("historyTable");

        if (userId && orders.length > 0) {
            document.getElementById("historyTitle").innerHTML = `${orders[0].userId.name}'s <span>Order History</span>`;
            document.getElementById("historySub").textContent = `Viewing transactions for ${orders[0].userId.email}`;
        }

        list.innerHTML = "";
        if (!orders || orders.length === 0) {
            table.style.display = "none";
            noMsg.style.display = "block";
            return;
        }

        table.style.display = "table";
        noMsg.style.display = "none";

        orders.forEach(o => {
            const items = o.items.map(i => `${i.name} (${i.quantity})`).join(", ");
            list.innerHTML += `
                <tr>
                    <td style="font-family: monospace; font-size: 0.85rem;">#${o._id.slice(-6).toUpperCase()}</td>
                    <td>
                        <div style="font-weight:600;">${o.userId ? o.userId.name : 'Unknown'}</div>
                        <div style="font-size:0.75rem; color:#888;">${o.userId ? o.userId.email : ''}</div>
                    </td>
                    <td style="font-weight:600; color:#2e7d32;">₹${o.totalAmount}</td>
                    <td style="font-size:0.85rem; color:#666;">${new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style="font-size:0.85rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${items}">${items}</td>
                </tr>
            `;
        });
    } catch (err) { console.error(err); }
}

async function loadProductHistory(farmerId = null) {
    try {
        const query = farmerId ? `?farmerId=${farmerId}` : "";
        const response = await fetch(`${API_URL}/products${query}`);
        const products = await response.json();
        const list = document.getElementById("historyList");
        const noMsg = document.getElementById("noDataMsg");
        const table = document.getElementById("historyTable");

        if (farmerId && products.length > 0) {
            document.getElementById("historyTitle").innerHTML = `${products[0].farmerId.name}'s <span>Product History</span>`;
            document.getElementById("historySub").textContent = `Viewing catalog for ${products[0].farmerId.email}`;
        }

        list.innerHTML = "";
        if (!products || products.length === 0) {
            table.style.display = "none";
            noMsg.style.display = "block";
            return;
        }

        table.style.display = "table";
        noMsg.style.display = "none";

        products.forEach(p => {
            const statusStyle = p.isApproved ? "color:#27ae60; background:#e8f8f0;" : "color:#f39c12; background:#fef5e7;";
            const statusText = p.isApproved ? "Approved" : "Pending Approval";
            
            list.innerHTML += `
                <tr>
                    <td>
                        <div style="font-weight:600;">${p.name}</div>
                        <div style="font-size:0.75rem; color:#888;">${p.unit}</div>
                    </td>
                    <td>
                        <div style="font-weight:600;">${p.farmerId ? p.farmerId.name : 'Unknown'}</div>
                        <div style="font-size:0.75rem; color:#888;">${p.farmerId ? p.farmerId.email : ''}</div>
                    </td>
                    <td>₹${p.price}</td>
                    <td>${p.quantity}</td>
                    <td><span class="status-badge" style="background:#f1f5f3;">${p.category}</span></td>
                    <td><span class="status-badge" style="${statusStyle}">${statusText}</span></td>
                </tr>
            `;
        });
    } catch (err) { console.error(err); }
}

async function loadProductStatus() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const list = document.getElementById("statusList");
        const noMsg = document.getElementById("noDataMsg");
        const table = document.getElementById("statusTable");

        // Stat targets
        const totalCountEl = document.getElementById("totalCount");
        const approvedCountEl = document.getElementById("approvedCount");
        const pendingCountEl = document.getElementById("pendingCount");
        const outOfStockCountEl = document.getElementById("outOfStockCount");

        if (!products || products.length === 0) {
            table.style.display = "none";
            noMsg.style.display = "block";
            return;
        }

        table.style.display = "table";
        noMsg.style.display = "none";

        let totals = { all: 0, approved: 0, pending: 0, out: 0 };
        list.innerHTML = "";

        products.forEach(p => {
            totals.all++;
            if (p.isApproved) totals.approved++;
            else totals.pending++;
            if (p.quantity <= 0) totals.out++;

            const appStyle = p.isApproved ? "color:#27ae60; background:#e8f8f0;" : "color:#f39c12; background:#fef5e7;";
            const appText = p.isApproved ? "Approved" : "Pending";
            
            let stockStyle, stockIcon, stockLabel;
            if (p.quantity <= 0) {
                stockStyle = "color:#e74c3c; background:#fff0f0;";
                stockIcon = "stock-out";
                stockLabel = "Out of Stock";
            } else if (p.quantity < 5) {
                stockStyle = "color:#f39c12; background:#fef5e7;";
                stockIcon = "stock-low";
                stockLabel = "Low Stock";
            } else {
                stockStyle = "color:#27ae60; background:#e8f8f0;";
                stockIcon = "stock-instock";
                stockLabel = "In Stock";
            }

            list.innerHTML += `
                <tr>
                    <td>
                        <div style="font-weight:600;">${p.name}</div>
                        <div style="font-size:0.75rem; color:#888;">₹${p.price} / ${p.unit}</div>
                    </td>
                    <td>
                        <div style="font-weight:600;">${p.farmerId ? p.farmerId.name : 'Unknown'}</div>
                        <div style="font-size:0.75rem; color:#888;">${p.farmerId ? p.farmerId.email : ''}</div>
                    </td>
                    <td>
                        <span class="status-badge" style="${stockStyle}">
                            <span class="stock-indicator ${stockIcon}"></span>${stockLabel} (${p.quantity})
                        </span>
                    </td>
                    <td><span class="status-badge" style="${appStyle}">${appText}</span></td>
                    <td><span class="status-badge" style="background:#f8f9fa;">${p.category}</span></td>
                </tr>
            `;
        });

        // Update stats
        totalCountEl.textContent = totals.all;
        approvedCountEl.textContent = totals.approved;
        pendingCountEl.textContent = totals.pending;
        outOfStockCountEl.textContent = totals.out;

    } catch (err) { console.error(err); }
}
