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

        const list = document.getElementById("productList");
        list.innerHTML = "";

        products.forEach(p => {
            const statusClass = p.isApproved ? "status-approved" : "status-pending";
            const statusText = p.isApproved ? "Approved" : "Pending";
            const statusStyle = p.isApproved ? "color: #27ae60; background: #e8f8f0;" : "color: #f39c12; background: #fef5e7;";
            const imageUrl = p.image ? `http://localhost:5000${p.image}` : 'placeholder.jpg';

            list.innerHTML += `
                <tr>
                    <td><img src="${imageUrl}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"></td>
                    <td style="font-weight: 600;">${p.name}</td>
                    <td>₹${p.price}</td>
                    <td>${p.quantity} <span style="color: #7f8c8d; font-size: 0.85rem;">${p.unit}</span></td>
                    <td><span class="status-badge" style="${statusStyle}">${statusText}</span></td>
                    <td>
                        <button class="delete-btn" onclick="deleteProduct('${p._id}')"><i class="fa-solid fa-trash-can"></i> Delete</button>
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
        await fetch(`${API_URL}/delete-product/${id}`, {
            method: "DELETE"
        });
        alert("Product Deleted");
        loadProducts();
    } catch (err) {
        alert("Error deleting product");
    }
}

// --- Profile Sync Logic ---
const farmerId = localStorage.getItem("farmerId");
const farmerNameElement = document.getElementById("farmer-name");
const farmerEmailElement = document.getElementById("farmer-email");
const farmerPhoneElement = document.getElementById("farmer-phone");
const authButtonContainer = document.getElementById("authButton");

function getCleanValue(val) {
    return (val && val !== 'undefined' && val !== 'null') ? val : 'N/A';
}

function updateProfileUI() {
    if (farmerId) {
        farmerNameElement.textContent = getCleanValue(localStorage.getItem("farmerName"));
        farmerEmailElement.textContent = getCleanValue(localStorage.getItem("farmerEmail"));
        farmerPhoneElement.textContent = getCleanValue(localStorage.getItem("farmerPhone"));
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
            
            farmerNameElement.textContent = data.name;
            farmerEmailElement.textContent = getCleanValue(data.email);
            farmerPhoneElement.textContent = getCleanValue(data.phone);
        }
    } catch (err) {
        console.error("Profile Sync Error:", err);
    }
}

// Initial UI Update
updateProfileUI();

// Initial Load of Products
loadProducts();
