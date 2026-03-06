if (typeof API_URL === 'undefined') {
    var API_URL = "http://localhost:5000/api/public";
}

async function loadAllProducts() {
    try {
        const fruitsContainer = document.getElementById("fruits-container");
        const vegetablesContainer = document.getElementById("vegetables-container");
        const noResults = document.getElementById("no-results");
        
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();

        fruitsContainer.innerHTML = "";
        vegetablesContainer.innerHTML = "";

        if (products.length === 0) {
            noResults.style.display = "block";
            document.getElementById("fruits-section").style.display = "none";
            document.getElementById("vegetables-section").style.display = "none";
            return;
        }

        noResults.style.display = "none";
        
        let hasFruits = false;
        let hasVegetables = false;

        products.forEach(p => {
            const imageUrl = p.image ? `http://localhost:5000${p.image}` : 'img/fruits/apple.jpg';
            const productHTML = `
                <div class="product-wrap">
                    <div class="product-img">
                        <img src="${imageUrl}" alt="${p.name}">
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
                hasFruits = true;
            } else {
                vegetablesContainer.innerHTML += productHTML;
                hasVegetables = true;
            }
        });

        document.getElementById("fruits-section").style.display = hasFruits ? "block" : "none";
        document.getElementById("vegetables-section").style.display = hasVegetables ? "block" : "none";

    } catch (err) {
        console.error("Error loading products:", err);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("page-search-input");
    
    loadAllProducts();

    const performSearch = () => {
        const term = searchInput.value.trim();
        if (term) {
            window.location.href = `search-results.html?search=${encodeURIComponent(term)}`;
        }
    };

    let debounceTimer;
    searchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            // We don't want live redirection while typing on this page as it's annoying
            // but the user asked for "if someone search something redirect"
            // So I'll keep redirection to the Enter press or Button click
        }, 400); 
    });

    document.getElementById("page-search-btn").onclick = performSearch;

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Handle back/forward buttons
    window.onpopstate = () => {
        loadAllProducts();
    };
});
