const SEARCH_PAGE_API = "http://localhost:5000/api/public";

async function fetchSearchResults(query) {
    try {
        const container = document.getElementById("search-results-grid");
        const noResults = document.getElementById("no-results-msg");
        const resultSpan = document.querySelector("#result-text span");

        resultSpan.textContent = query;

        if (!query || query.trim() === "") {
            window.location.href = "all-products.html";
            return;
        }

        const response = await fetch(`${SEARCH_PAGE_API}/products?search=${encodeURIComponent(query.trim())}`);
        let products = await response.json();
        
        console.log("Products received from API:", products);

        // Ensure products is an array before processing
        if (!Array.isArray(products)) {
            console.error("API did not return an array:", products);
            products = [];
        }

        // Extra client-side filter for "proper" behavior
        const searchTerm = query.toLowerCase().trim();
        products = products.filter(p => p.name && p.name.toLowerCase().includes(searchTerm));

        container.innerHTML = "";

        if (products.length === 0) {
            console.log("No products found for:", searchTerm);
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        products.forEach(p => {
            let imageUrl = p.image;
            if (imageUrl) {
                // If it's a relative path starting with /uploads, point to backend
                if (imageUrl.startsWith('/uploads')) {
                    imageUrl = `http://localhost:5000${imageUrl}`;
                } else if (!imageUrl.startsWith('http')) {
                    // Fallback for other relative paths
                    imageUrl = `http://localhost:5000/${imageUrl}`;
                }
            } else {
                imageUrl = 'img/fruits/apple.jpg';
            }

            const unit = p.unit || 'kg';
            const farmerName = (p.farmerId && p.farmerId.name) ? p.farmerId.name : 'Unknown Farmer';

            const productHTML = `
                <div class="product-wrap">
                    <div class="product-img">
                        <img src="${imageUrl}" alt="${p.name}">
                    </div>
                    <div class="product-icons">
                        <div class="add-to-favorite" onclick="toggleFavorite(this, '${p.name}', ${p.price}, '${unit}', '${imageUrl}', '${p._id}')"><span class="fa-solid fa-heart"></span></div>
                    </div>
                    <div class="product-description">
                        <p class="product-name">${p.name}</p>
                        <p class="seller-name">Sold by: <strong>${farmerName}</strong></p>
                        <p class="stock-level ${p.quantity <= 5 ? 'low-stock' : ''}">
                            Quantity left: <strong>${p.quantity} ${unit}</strong>
                        </p>
                        <p class="price">
                            <strong>Price:</strong>
                            <ins>
                                <span class="f-cur-price">${p.price}</span>Rs/${unit}
                            </ins>
                        </p>
                        ${p.quantity > 0 ? `
                        <div class="add-to-cart-btn" onclick="addToCart(this, '${p.name}', ${p.price}, '${unit}', '${imageUrl}', '${p._id}', '${farmerName.replace(/'/g, "\\'")}', ${p.quantity})">
                            <p><span class="fa-solid fa-cart-plus"></span> Add to Cart</p>
                        </div>
                        ` : `
                        <div class="add-to-cart-btn disabled" style="opacity: 0.5; cursor: not-allowed;">
                            <p style="background: grey;"><span class="fa-solid fa-circle-xmark"></span> Out of Stock</p>
                        </div>
                        `}
                    </div>
                </div>
            `;
            container.innerHTML += productHTML;
        });

    } catch (err) {
        console.error("Error fetching search results:", err);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('search');
    const searchInput = document.getElementById("results-search-input");
    const searchBtn = document.getElementById("results-search-btn");

    if (query) {
        searchInput.value = query;
        fetchSearchResults(query);
    } else {
        window.location.href = "all-products.html";
    }

    const performSubSearch = () => {
        const term = searchInput.value.trim();
        if (term) {
            window.location.href = `search-results.html?search=${encodeURIComponent(term)}`;
        }
    };

    searchBtn.onclick = performSubSearch;
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') performSubSearch();
    };

    // Handling the navbar search while on this page
    const navbarSearchInput = document.getElementById("navbar-search-input");
    if (navbarSearchInput) {
        navbarSearchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && navbarSearchInput.value.trim() !== "") {
                window.location.href = `search-results.html?search=${encodeURIComponent(navbarSearchInput.value.trim())}`;
            }
        });
    }
});
