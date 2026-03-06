if (typeof API_URL === 'undefined') {
    var API_URL = "http://localhost:5000/api/public";
}

async function loadProducts(searchQuery = "") {
    try {
        const fruitsContainer = document.getElementById("fruits-container");
        const vegetablesContainer = document.getElementById("vegetables-container");
        if (!fruitsContainer || !vegetablesContainer) return;

        let url = `${API_URL}/products`;
        if (searchQuery) {
            url += `?search=${encodeURIComponent(searchQuery)}`;
        }
        
        const response = await fetch(url);
        const products = await response.json();

        fruitsContainer.innerHTML = "";
        vegetablesContainer.innerHTML = "";

        if (products.length === 0) {
            fruitsContainer.innerHTML = "<p style='width:100%; text-align:center; padding: 2rem;'>No products found.</p>";
            return;
        }

        products.forEach(p => {
            const imageUrl = p.image ? `http://localhost:5000${p.image}` : 'img/fruits/apple.jpg';

            const productHTML = `
                <div class="product-wrap">
                    <div class="product-img">
                        <img src="${imageUrl}" alt="${p.name}" style="height: 200px; object-fit: cover;">
                    </div>

                    <div class="product-icons">
                        <div class="add-to-favorite" onclick="toggleFavorite(this, '${p.name}', ${p.price}, '${p.unit}', '${imageUrl}')"><span class="fa-solid fa-heart"></span></div>
                    </div>

                    <div class="product-description">
                        <p class="product-name">${p.name}</p>
                        <p class="price">
                            <strong>Price:</strong>
                            <ins>
                                <span class="f-cur-price">${p.price}</span>Rs/${p.unit}
                            </ins>
                        </p>
                        <div class="add-to-cart-btn" onclick="addToCart(this, '${p.name}', ${p.price}, '${p.unit}', '${imageUrl}')">
                            <p><span class="fa-solid fa-cart-plus"></span> Add to Cart</p>
                        </div>
                    </div>
                </div>
            `;
            
            if (p.category === "Fruit") {
                fruitsContainer.innerHTML += productHTML;
            } else {
                vegetablesContainer.innerHTML += productHTML;
            }
        });

    } catch (err) {
        console.error("Error loading products:", err);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    loadProducts();

    const searchInput = document.getElementById("navbar-search-input");
    const searchIcon = document.querySelector(".search-icon");

    if (searchInput) {
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && searchInput.value.trim() !== "") {
                window.location.href = `search-results.html?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }

    if (searchIcon && searchInput) {
        searchIcon.addEventListener("click", () => {
            if (searchInput.value.trim() !== "") {
                window.location.href = `search-results.html?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
});
