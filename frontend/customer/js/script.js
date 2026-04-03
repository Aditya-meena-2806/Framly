// Inject global cart elements if missing
(function() {
    // ---- Global Navbar Injection ----
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        // Detect path depth to adjust relative links
        let prefix = "";
        let contactPage = "contactus.html"; // Default for customer
        const path = window.location.pathname;
        if (path.includes('/farmer/') || path.includes('/delivery/')) {
            prefix = "../customer/";
            contactPage = "contact-us.html"; // Local for all partners (farmer & delivery)
        } else if (!path.includes('/customer/') && (path.endsWith('.html') || path.endsWith('/'))) {
            // Root files (like login.html in frontend/)
            prefix = "customer/";
        }

        navbarPlaceholder.innerHTML = `
        <nav class="navbar">
            <div class="logo">
                <a href="${prefix}index.html"><span>Farmly</span></a>
            </div>
            <ul class="nav-items">
                <li><a href="${prefix}index.html">Home</a></li>
                <li><a href="${prefix}about.html">About</a></li>
                <li><a href="${prefix}services.html">Services</a></li>
                <li><a href="${prefix}all-products.html">Products</a></li>
                <li><a href="${(path.includes('/delivery/')) ? contactPage : prefix + contactPage}">Contact</a></li>
            </ul>
            <div class="search-box">
                <div class="search-icon"><span class="fa-solid fa-magnifying-glass"></span></div>
                <input type="text" id="navbar-search-input" placeholder="Search...">
            </div>
            <div class="icon-links">
                <div id="search-btn"><span class="fa-solid fa-magnifying-glass"></span></div>
                <div id="customer-center"><span class="fa-solid fa-phone"></span></div>
                <div id="icon-shopping-cart"><span class="fa-solid fa-cart-shopping"></span><span id="item-counter">0</span></div>
                <div class="profile-container" id="profile-container">
                    <div id="login-or-signup"><a href="${prefix}login.html"><span class="fa-solid fa-user"></span></a></div>
                    <div class="profile-dropdown" id="profile-dropdown">
                        <div class="user-info">
                            <p><strong>Username:</strong> <span id="user-name">Welcome!</span></p>
                            <p><strong>Email:</strong> <span id="user-email"></span></p>
                            <p><strong>Phone:</strong> <span id="user-phone"></span></p>
                            <p><strong>Address:</strong> <span id="user-address"></span></p>
                        </div>
                        <hr>
                        <ul class="profile-links">
                            <li><a href="${prefix}update-location.html"><i class="fa-solid fa-map-location-dot"></i> Update Location</a></li>
                            <li><a href="${prefix}order-history.html"><i class="fa-solid fa-clock-rotate-left"></i> Order History</a></li>
                            <li><a href="${prefix}cart.html"><i class="fa-solid fa-heart"></i> Wishlist</a></li>
                            <li><a href="#"><i class="fa-solid fa-gift"></i> Gift Cards</a></li>
                            <li><a href="${(path.includes('/delivery/')) ? contactPage : prefix + contactPage}"><i class="fa-solid fa-headset"></i> Contact Us</a></li>
                        </ul>
                        <hr>
                        <div class="logout-btn-container">
                            <button id="logout-btn">Logout</button>
                        </div>
                    </div>
                </div>
                <div id="toggle-bar"><span class="toggler"></span></div>
            </div>
        </nav>`;

        // Re-run the scroll logic OR manually trigger it to ensure navbar is 'active' on non-home pages
        const injectedNav = navbarPlaceholder.querySelector('.navbar');
        if (!document.querySelector('.home')) {
            if (injectedNav) injectedNav.classList.add('active');
        }

        // Highlight current page link
        if (injectedNav) {
            const navLinks = injectedNav.querySelectorAll('.nav-items a');
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href.endsWith(currentPath)) {
                    link.style.color = 'orangered';
                }
            });
        }
    }

    if (document.getElementById('product-cart-area')) return;
    const cartContainer = document.createElement('div');
    cartContainer.innerHTML = `
    <div class="shopping-cart-area" id="product-cart-area">
        <div class="shopping-cart-wrap">
            <div class="product-cart-menu">
                <div class="cart-menu-items">
                    <h2 id="selected-products" class="active-cart-menu">Selected Products</h2>
                    <h2 id="favorite-products">Favorite Products</h2>
                </div>
                <div class="cart-close-btn"><button>Close Cart</button></div>
            </div>
            <div class="cart-contents-header">
                <div class="total-cart-items">
                    <p id="total-selected" class="active-product-counter"><strong>Total Selected: </strong><span>No item found</span></p>
                    <p id="total-favorite"><strong>Total Favorite: </strong><span>No item found</span></p>
                </div>
                <div class="buying-product-title">
                    <div class="total-buying-item"><p><strong>Total Buying Items: </strong><span id="total-buying-item-counter">0</span></p></div>
                    <div class="buy-items-button"><button id="buy-items">Buy Items</button></div>
                </div>
            </div>
            <div class="cart-contents-area shopping-cart-contents-area active-cart-content"></div>
            <div class="cart-wishlist-area shopping-cart-contents-area"></div>
        </div>
    </div>
    <div class="remove-confirmation-message">
        <div class="remove-message-wrap">
            <div class="remove-message-title"><h2>Remove item confirmation message</h2></div>
            <div class="remove-message-button"><button id="remove-confirm-btn">Remove</button><button id="remove-cancel-btn">Cancel</button></div>
        </div>
    </div>
    <div class="popup-shadow"></div>
    <div class="buying-details-area">
        <div class="buying-details-wrap">
            <div class="shop-title"><h1>Shopping Cart</h1></div>
            <div class="shopping-details-wrap">
                <div class="shopping-details-header">
                    <div class="shopping-details">
                        <div class="shop-detail product-sl"><h2>SL No.</h2></div>
                        <div class="shop-detail product-name"><h2>Product Name</h2></div>
                        <div class="shop-detail regular-price"><h2>Regular Price</h2></div>
                        <div class="shop-detail discount"><h2>Discount</h2></div>
                        <div class="shop-detail present-price"><h2>Present Price</h2></div>
                        <div class="shop-detail product-quantity"><h2>Quantity</h2></div>
                        <div class="shop-detail total-amount"><h2>Total Price</h2></div>
                        <div class="shop-detail remove-all-btn"><button id="remove-all-items">Remove All</button></div>
                    </div>
                </div>
                <div class="shopping-details-content"></div>
            </div>
            <div class="buying-details-footer">
                <div class="calculate-buying-details">
                    <div class="calculate-total-items"><h2>Total Items: </h2><p><span>0</span></p></div>
                    <div class="calculate-total-quantity"><h2>Total Quantity: </h2><p>0</p></div>
                    <div class="calculate-total-amount"><h2>Total Amount: </h2><p><span>0</span> Rs.</p></div>
                </div>
                <div class="confirm-order-button"><button id="confirm-order-btn">Confirm Order</button></div>
            </div>
        </div>
        <div class="close-buy-area"><div id="close-buy-area-btn"></div></div>
    </div>`;
    while (cartContainer.firstChild) {
        document.body.appendChild(cartContainer.firstChild);
    }
})();

// =====================
//    Home Area Start
// =====================

// selecting parallax and slider elements
let parallax = document.querySelector('.bg-slider-1');
let bgSlideContents = document.querySelectorAll('.bg-slider');

// initialize slide index
let slideIndex = 0;

// slide left
function homeSlideLeft() {
    if (!bgSlideContents || bgSlideContents.length === 0) return;
    slideIndex--;

    if (slideIndex < 0) {
        slideIndex = bgSlideContents.length - 1;
    }

    if (bgSlideContents[slideIndex]) {
        bgSlideContents[slideIndex].classList.add('active-bg');
    }
    if (parallax) {
        parallax.style.backgroundPositionY = 0 + 'px';
        parallax = document.querySelector(`.bg-slider-${slideIndex + 1}`);
    }
}

// slide right
function homeSlideRight() {
    if (!bgSlideContents || bgSlideContents.length === 0) return;
    slideIndex++;

    if (slideIndex >= bgSlideContents.length) {
        slideIndex = 0;
    }

    if (bgSlideContents[slideIndex]) {
        bgSlideContents[slideIndex].classList.add('active-bg');
    }
    if (parallax) {
        parallax.style.backgroundPositionY = 0 + 'px';
        parallax = document.querySelector(`.bg-slider-${slideIndex + 1}`);
    }
}

// remove previous slide
function removePrevSlide() {
    for (let i = 0; i < bgSlideContents.length; i++) {
        bgSlideContents[i].classList.remove('active-bg');
    }
}

// auto slider
let homeSlide = setInterval(() => {
    removePrevSlide();
    homeSlideRight();
}, 8000);


// slide left right button
let bgSlideLeftBtn = document.querySelector('.bg-slide-left');
let bgSlideRightBtn = document.querySelector('.bg-slide-right');

// actions while left button click
if (bgSlideLeftBtn) {
    bgSlideLeftBtn.onclick = () => {
        removePrevSlide();
        homeSlideLeft();
    }
}

// actions while right button click
if (bgSlideRightBtn) {
    bgSlideRightBtn.onclick = () => {
        removePrevSlide();
        homeSlideRight();
    }
}

// selecting navbar elements
let navbar = document.querySelector('nav');
let navItems = document.querySelectorAll('.nav-items li');

// home text
let hero = document.querySelector('#hero');

// actions while scroll up or down
window.onscroll = () => {
    if (!navbar) return;
    let scrollTop = document.documentElement.scrollTop;
    let totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    let percentage = totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0;

    // parallax effect
    if (parallax) {
        parallax.style.backgroundPositionY = scrollTop * 0.7 + 'px';
    }

    // home text effect
    if (hero) {
        hero.style.top = 50 - percentage * 1.8 + '%';
    }

    // sticky navbar (safety check for navbar)
    if (navbar) {
        if (scrollTop > (navbar.offsetTop || 0)) {
            navbar.classList.add('active');
        } else {
            // On subpages, we might WANT it to stay active.
            // But if it's not the home page, we check context.
            if (!document.querySelector('.home')) {
                 navbar.classList.add('active');
            } else {
                 navbar.classList.remove('active');
            }
        }
    }
}

// selecting elements for menu toggle
let toggleBar = document.querySelector('#toggle-bar');
let navigationArea = document.querySelector('.nav-items');

// slelecting elements for search bar
let searchBtn = document.querySelector('#search-btn');
let searchBox = document.querySelector('.search-box');

// actions while toggle button click
if (toggleBar && navigationArea) {
    toggleBar.addEventListener('click', function () {
        toggleBar.classList.toggle('active-toggler');
        navigationArea.classList.toggle('active-navbar');
        if (searchBox) searchBox.classList.remove('active-search-box');
        if (navItems) {
            for (let i = 0; i < navItems.length; i++) {
                navItems[i].addEventListener('click', function () {
                    toggleBar.classList.remove('active-toggler');
                    navigationArea.classList.remove('active-navbar');
                });
            }
        }
    });
}

// actions while search button click
if (searchBtn && searchBox) {
    searchBtn.addEventListener('click', function () {
        searchBox.classList.toggle('active-search-box');
        if (toggleBar) toggleBar.classList.remove('active-toggler');
        if (navigationArea) navigationArea.classList.remove('active-navbar');
    });
}

// Global Navbar Search Handling
const navbarSearchInput = document.getElementById("navbar-search-input");
if (navbarSearchInput) {
    navbarSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const term = navbarSearchInput.value.trim();
            if (term !== "") {
                window.location.href = `search-results.html?search=${encodeURIComponent(term)}`;
            }
        }
    });
}

// ===================
//    Home Area End
// ===================





// =====================================
//    Product Cart Control Area Start
// =====================================

// selecting featured products and product cart elements
let shoppingCartBtn = document.querySelector('#icon-shopping-cart');
let cartIconProductCounter = document.querySelector('#item-counter');
let productCartArea = document.querySelector('#product-cart-area');

let favoriteIcon = document.querySelectorAll('.add-to-favorite > span');
let cartWishlistArea = document.querySelector('.cart-wishlist-area');

let itemDeleteConfirmationBox = document.querySelector('.remove-confirmation-message');
let itemDeleteConfirmationBoxTitle = document.querySelector('.remove-message-title h2');
let popupShadow = document.querySelector('.popup-shadow');
let removeCancelBtn = document.querySelector('#remove-cancel-btn');
let removeConfirmBtn = document.querySelector('#remove-confirm-btn');

let shoppingCart = document.querySelector('.shopping-cart-area');
let cartContentMenu = document.querySelectorAll('.cart-menu-items h2');
let cartCloseButton = document.querySelector('.cart-close-btn button');
let shoppingCartContentsArea = document.querySelectorAll('.shopping-cart-contents-area');

let featuredProducts = document.querySelectorAll('.product-wrap');
let productImage = document.querySelectorAll('.product-img img');
let productPrice = document.querySelectorAll('.f-product-price');
let productDiscount = document.querySelectorAll('.discount');
let productName = document.querySelectorAll('.product-name');
let currentPrice = document.querySelectorAll('.f-cur-price');
let productUnit = document.querySelectorAll('.f-product-unit');
let addToCartBtn = document.querySelectorAll('.add-to-cart-btn p');
let cartContentArea = document.querySelector('.cart-contents-area');
let shoppingCartArea = document.querySelector('.shopping-cart-wrap');
let buyingProductContent = document.querySelector('.buying-product-title');
let buyingDetailsFooter = document.querySelector('.buying-details-footer');
let totalBuyingItems = document.querySelector('.calculate-total-items p span');
let shoppingDetailsContent = document.querySelector('.shopping-details-content');
let totalBuyingItemsQuantity = document.querySelector('.calculate-total-quantity p');
let totalBuyingItemsAmount = document.querySelector('.calculate-total-amount p span');

let totalSelectedProduct = document.querySelector('#total-selected');
let totalFavoriteProduct = document.querySelector('#total-favorite');
let totalSelectedCounter = document.querySelector('#total-selected span');
let totalFavoriteCounter = document.querySelector('#total-favorite span');
let totalAddToBuyCounter = document.querySelector('#total-buying-item-counter');

let controllScrolling = document.querySelector('html');

// item counter
let countSelectedItem = 0;
let countFavoriteItem = 0;
let countAddToBuyItem = 0;
let countBuyProductSl = 0;
let countTotalWeight = 0;
let countTotalPieces = 0;
let countTotalAmount = 0;
let countTotalDozen = 0;

// store event data (Load from localStorage if available)
let addedToCart = [];
let addedForBuy = [];
let newCartContent = [];
let addedToFavorite = [];
let newfavoriteItem = [];
let shoppingCartItem = [];
let storeShopItemsIndex = [];

// Persistence functions
function saveCartToStorage() {
    const cartData = [];
    const selectedItems = cartContentArea ? cartContentArea.children : [];
    for (let item of selectedItems) {
        // Extract data from DOM or use a parallel array if we had one
        // For simplicity, we'll extract from labels
        const name = item.querySelector('.cart-details p:nth-child(2) span').textContent;
        const priceText = item.querySelector('.cart-details p:nth-child(3) span').textContent;
        const price = parseFloat(priceText);
        let unit = 'kg';
        if (priceText.includes('/')) {
            unit = priceText.split('/')[1].trim();
            if (unit === 'undefined') unit = 'kg';
        }
        const discount = parseInt(item.querySelector('.cart-details p:nth-child(4) span').textContent);
        const image = item.querySelector('.cart-image-area img').src;
        const addedTime = item.querySelector('.cart-details p:nth-child(7) span').textContent;
        const farmerNameRaw = item.querySelector('.cart-details p:nth-child(8) span').textContent;
        const farmerName = (farmerNameRaw && farmerNameRaw !== 'Unknown') ? farmerNameRaw : 'Unknown Farmer';
        const stockTextRaw = item.querySelector('.cart-details p:nth-child(9) span').textContent;
        const stock = parseFloat(stockTextRaw) || 0;
        const id = item.getAttribute('data-id');
        const actualFarmerId = item.getAttribute('data-farmer-id');
        
        // Find if it's already in "Buy" list
        let buyData = null;
        const buyItems = shoppingDetailsContent ? shoppingDetailsContent.querySelectorAll('.shopping-details') : [];
        for (let b of buyItems) {
            if (b.querySelector('.product-name p').textContent === name) {
                buyData = {
                    id: b.getAttribute('data-id'),
                    quantity: parseFloat(b.getAttribute('data-quantity')),
                    farmerId: b.getAttribute('data-farmer-id')
                };
            }
        }

        cartData.push({ name, price, unit, image, addedTime, discount, buyData, id, farmerName, stock, actualFarmerId });
    }
    localStorage.setItem('farmly_cart', JSON.stringify(cartData));
}

function saveFavoritesToStorage() {
    const favData = [];
    const favItems = cartWishlistArea ? cartWishlistArea.children : [];
    for (let item of favItems) {
        const name = item.querySelector('.product-name').textContent;
        const price = parseFloat(item.querySelector('.f-cur-price').textContent);
        
        // Better unit extraction: find the text after "Rs/"
        const priceText = item.querySelector('.price').textContent;
        let unit = 'kg';
        if (priceText.includes('/')) {
            const parts = priceText.split('/');
            unit = parts[1].trim();
            if (unit === 'undefined') unit = 'kg';
        }
        
        const image = item.querySelector('.product-img img').src;
        const id = item.getAttribute('data-id');
        
        // Also capture seller and stock from the clone if available
        const sellerEle = item.querySelector('.seller-name strong');
        let farmerName = sellerEle ? sellerEle.textContent : 'Unknown Farmer';
        if (farmerName === 'Unknown') farmerName = 'Unknown Farmer';
        
        const stockEle = item.querySelector('.stock-level strong');
        const stock = stockEle ? parseFloat(stockEle.textContent) : 0;

        favData.push({ name, price, unit, image, id, farmerName, stock });
    }
    localStorage.setItem('farmly_favorites', JSON.stringify(favData));
}

// Global function to open favorites from anywhere
window.openFavoritesSidebar = function() {
    if (typeof productCartArea !== 'undefined' && productCartArea) {
        productCartArea.classList.add('active-cart');
        if (typeof controllScrolling !== 'undefined' && controllScrolling) 
            controllScrolling.style.overflowY = 'hidden';
        
        // Switch to favorites tab
        const favTab = document.getElementById('favorite-products');
        if (favTab) favTab.click();
    }
};

let isSelectedItemActive = true;

// calculate and update current price
(function () {
    for (let i = 0; i < featuredProducts.length; i++) {
        let oldPrice = productPrice[i].textContent;
        let discount = productDiscount[i].textContent;

        let newPrice = oldPrice - Math.round((oldPrice * (discount / 100)));

        currentPrice[i].textContent = newPrice;
    }
})();

// show cart area
if (shoppingCartBtn) {
    shoppingCartBtn.onclick = () => {
        if (productCartArea) productCartArea.classList.add('active-cart');
        if (controllScrolling) controllScrolling.style.overflowY = 'hidden';
    };
}

// remove cart area
if (cartCloseButton) {
    cartCloseButton.onclick = () => {
        if (productCartArea) productCartArea.classList.remove('active-cart');
        if (controllScrolling) controllScrolling.style.overflowY = 'auto';
    };
}

// display cart buying header
function displayBuyingHeader(countValue) {
    if (!shoppingDetailsContent || !buyingProductContent) return;
    let totalShopItems = shoppingDetailsContent.children.length;
    if (countValue > 0 && isSelectedItemActive === true) {
        buyingProductContent.classList.add('acvie-buying-title');
    } else if (totalShopItems > 0 && isSelectedItemActive === true) {
        buyingProductContent.classList.add('acvie-buying-title');
    } else {
        buyingProductContent.classList.remove('acvie-buying-title');
    }
}

// cart header menu switch and show/hide total items counter
(function () {
    for (let i = 0; i < cartContentMenu.length; i++) {
        cartContentMenu[i].addEventListener('click', function () {
            for (let j = 0; j < cartContentMenu.length; j++) {
                cartContentMenu[j].classList.remove('active-cart-menu');
                shoppingCartContentsArea[j].classList.remove('active-cart-content');
                totalSelectedProduct.classList.remove('active-product-counter');
                totalFavoriteProduct.classList.remove('active-product-counter');
            }
            cartContentMenu[i].classList.add('active-cart-menu');
            shoppingCartContentsArea[i].classList.add('active-cart-content');
            if (cartContentMenu[i].getAttribute('id') === 'selected-products') {
                totalSelectedProduct.classList.add('active-product-counter');
                if (countSelectedItem > 0) {
                    buyingProductContent.classList.add('acvie-buying-title');
                    totalSelectedCounter.innerHTML = countSelectedItem;
                } else {
                    totalSelectedCounter.innerHTML = 'No item found';
                }
                isSelectedItemActive = true;
            } else {
                totalFavoriteProduct.classList.add('active-product-counter');
                buyingProductContent.classList.remove('acvie-buying-title');
                if (countFavoriteItem > 0) {
                    totalFavoriteCounter.innerHTML = countFavoriteItem;
                } else {
                    totalFavoriteCounter.innerHTML = 'No item found';
                }

                isSelectedItemActive = false;
            }

            displayBuyingHeader(countSelectedItem);

        });
    }
})();

// set event data false
(function () {
    for (let i = 0; i < addToCartBtn.length; i++) {
        addedToCart[i] = false;
        addedForBuy[i] = false;
        addedToFavorite[i] = false;
    }
})();

// create elements for selected product content
function createSelectedProductsContent(image, name, price, unit, discount, preservative, time, id, farmerName, stock, actualFarmerId) {
    const safeUnit = (unit && unit !== 'undefined') ? unit : 'kg';
    const safeFarmer = (farmerName && farmerName !== 'undefined' && farmerName !== 'Unknown') ? farmerName : 'Unknown Farmer';
    const safeStock = stock || 0;

    let newCartContent = document.createElement('div');
    newCartContent.setAttribute('class', 'cart-content');
    if (id) newCartContent.setAttribute('data-id', id);
    if (actualFarmerId) newCartContent.setAttribute('data-farmer-id', actualFarmerId);

    let newCartImageArea = document.createElement('div');
    newCartImageArea.setAttribute('class', 'cart-image-area');

    let newCartDetails = document.createElement('div');
    newCartDetails.setAttribute('class', 'cart-details');

    //children of newCartImageArea
    let newImage = document.createElement('img');
    newImage.src = image;

    newCartImageArea.appendChild(newImage);

    // childrens of newCartDetails
    let newHeading2 = document.createElement('h2');
    newHeading2.textContent = 'Product Details';

    let newPara = [];
    let newStrong = [];

    for (let i = 0; i < 8; i++) {
        newPara[i] = document.createElement('p');
        newStrong[i] = document.createElement('strong');
    }

    newStrong[0].textContent = 'Product name: ';
    newStrong[1].textContent = 'Price: ';
    newStrong[2].textContent = 'Discount: ';
    newStrong[3].textContent = 'Quantity: ';
    newStrong[4].textContent = 'Preservatives: ';
    newStrong[5].textContent = 'Added Time: ';
    newStrong[6].textContent = 'Sold by: ';
    newStrong[7].textContent = 'Stock Left: ';

    for (let i = 0; i < 8; i++) {
        newPara[i].appendChild(newStrong[i]);
    }

    let newInput = document.createElement('input');
    newInput.setAttribute('type', 'number');
    newInput.setAttribute('min', '1');
    if (safeStock) newInput.setAttribute('max', safeStock);
    newPara[3].appendChild(newInput);

    let newQuantitySpan = document.createElement('span');
    newQuantitySpan.innerHTML = `${safeUnit}`;
    newQuantitySpan.style.paddingLeft = '0.4rem';
    newPara[3].appendChild(newQuantitySpan);

    let newSpan = [];
    for (let i = 0; i < 3; i++) {
        newSpan[i] = document.createElement('span');
    }

    newSpan[0].textContent = name;
    newSpan[1].textContent = price + `Rs/${unit}`;
    newSpan[2].textContent = discount + '%';

    for (let i = 0; i < 3; i++) {
        newPara[i].appendChild(newSpan[i]);
    }

    let preservativeSpan = document.createElement('span');
    preservativeSpan.textContent = preservative;

    let timeSpan = document.createElement('span');
    timeSpan.textContent = time;

    let farmerSpan = document.createElement('span');
    farmerSpan.textContent = safeFarmer;

    let stockSpan = document.createElement('span');
    stockSpan.textContent = `${safeStock} ${safeUnit}`;

    newPara[4].appendChild(preservativeSpan);
    newPara[5].appendChild(timeSpan);
    newPara[6].appendChild(farmerSpan);
    newPara[7].appendChild(stockSpan);

    let newShoppingButton = [];

    for (let i = 0; i < 2; i++) {
        newShoppingButton[i] = document.createElement('button');
    }

    newShoppingButton[0].textContent = 'Add to Buy';
    newShoppingButton[1].textContent = 'Remove Item';

    newShoppingButton[0].setAttribute('class', 'add-to-buy-btn');
    newShoppingButton[1].setAttribute('class', 'remove-item-btn');

    // adding children to parent element
    newCartDetails.appendChild(newHeading2);

    for (let i = 0; i < 8; i++) {
        newCartDetails.appendChild(newPara[i]);
    }

    for (let i = 0; i < 2; i++) {
        newCartDetails.appendChild(newShoppingButton[i]);
    }

    newCartContent.appendChild(newCartImageArea);
    newCartContent.appendChild(newCartDetails);

    return newCartContent;
}

// get product added time
function getAddedTime() {
    let dt = new Date();

    let dd = dt.getDate();
    let mm = dt.getMonth() + 1;
    let yyyy = dt.getFullYear();

    let HH = dt.getHours();
    let MM = dt.getMinutes();
    let XM = null;

    (HH >= 12) ? XM = 'PM': XM = 'AM';

    if (HH > 12) {
        HH -= 12;
    }

    if (HH == 0) {
        HH = 12;
    }

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    if (HH < 10) {
        HH = '0' + HH;
    }

    if (MM < 10) {
        MM = '0' + MM;
    }

    let format = `${dd}/${mm}/${yyyy}  ${HH}:${MM} ${XM}`;

    return format;
}

// add items to selected products
function addItemsToSelectedProducts(productIndex) {
    addToCartBtn[productIndex].style.background = 'orangered';
    addToCartBtn[productIndex].innerHTML = '<span class="icon-cart-arrow-down"></span> Added';
    let productCartImage = productImage[productIndex].src;
    let productCartName = productName[productIndex].textContent;
    let productCartPrice = productPrice[productIndex].textContent;
    let productCartUnit = productUnit[productIndex].textContent;
    let productCartDiscount = productDiscount[productIndex].textContent;
    let preservativeName = 'No';
    let addedTime = getAddedTime();
    newCartContent[productIndex] = createSelectedProductsContent(productCartImage, productCartName, productCartPrice, productCartUnit, productCartDiscount, preservativeName, addedTime);
    cartContentArea.insertBefore(newCartContent[productIndex], cartContentArea.firstChild);
    saveCartToStorage();
}

// remove Items to selected products
function removeItemsToSelectedProducts(productIndex) {
    addToCartBtn[productIndex].style.background = '#459122';
    addToCartBtn[productIndex].innerHTML = '<span class="icon-cart-plus"></span> Add to Cart';
    cartContentArea.removeChild(newCartContent[productIndex]);
    saveCartToStorage();
}

// active add to cart button of favorite item
function activeFavoriteItemAddToCartBtn(productIndex) {
    let favoriteItemAddToCartBtn = newfavoriteItem[productIndex].children[2].children[2].children[0];
    favoriteItemAddToCartBtn.style.background = 'orangered';
    favoriteItemAddToCartBtn.innerHTML = '<span class="icon-cart-arrow-down"></span> Added';
}

// deactive add to cart button of favorite item
function deactiveFavoriteItemAddToCartBtn(productIndex) {
    let favoriteItemAddToCartBtn = newfavoriteItem[productIndex].children[2].children[2].children[0];
    favoriteItemAddToCartBtn.style.background = '#459122';
    favoriteItemAddToCartBtn.innerHTML = '<span class="icon-cart-plus"></span> Add to Cart';
}

// create favorite content wrapper
function favoriteContentWrapper() {
    let newProductWrapper = document.createElement('div');
    newProductWrapper.setAttribute('class', 'product-wrap');

    return newProductWrapper;
}

// add items to favorite products
function addItemsToFavoriteProducts(productIndex) {
    favoriteIcon[productIndex].style.background = 'orangered';
    let clone = featuredProducts[productIndex].cloneNode(true);
    let favoriteContentWrap = favoriteContentWrapper();
    newfavoriteItem[productIndex] = favoriteContentWrap.appendChild(clone);
    cartWishlistArea.appendChild(newfavoriteItem[productIndex]);
    saveFavoritesToStorage();
}

// remove items to favorite products
function removeItemsToFavoriteProducts(productIndex) {
    favoriteIcon[productIndex].style.background = '#61790a';
    cartWishlistArea.removeChild(newfavoriteItem[productIndex]);
    saveFavoritesToStorage();
}

// show confirmation box
function activeConfirmationBox(confirmMessage) {
    itemDeleteConfirmationBox.classList.add('active-confirmation-box');
    itemDeleteConfirmationBoxTitle.innerHTML = confirmMessage;
    popupShadow.classList.add('active-popup-shadow');
    shoppingCart.style.overflow = 'hidden';
}

// remove confirmation box
function removeConfirmationBox() {
    itemDeleteConfirmationBox.classList.remove('active-confirmation-box');
    popupShadow.classList.remove('active-popup-shadow');
    shoppingCart.style.overflow = 'auto';
}

// display cart item counter
function displayCartCounter(countValue) {
    if (countValue > 0) {
        cartIconProductCounter.classList.add('active-item-counter');
    } else {
        cartIconProductCounter.classList.remove('active-item-counter');
    }
}

// create shopping cart item
function createShoppingCartItem(itemName, itemPrice, itemUnit, itemDiscount, presentPrice, itemQuantity, itemId, farmerId) {
    let newParentDiv = document.createElement('div');
    newParentDiv.setAttribute('class', 'shopping-details');
    newParentDiv.setAttribute('data-id', itemId);
    if (farmerId) newParentDiv.setAttribute('data-farmer-id', farmerId);

    let newChildDiv = [];

    for (let i = 0; i < 8; i++) {
        newChildDiv[i] = document.createElement('div');
    }

    newChildDiv[0].setAttribute('class', 'product-sl');
    newChildDiv[1].setAttribute('class', 'product-name');
    newChildDiv[2].setAttribute('class', 'regular-price');
    newChildDiv[3].setAttribute('class', 'discount');
    newChildDiv[4].setAttribute('class', 'present-price');
    newChildDiv[5].setAttribute('class', 'product-quantity');
    newChildDiv[6].setAttribute('class', 'total-amount');
    newChildDiv[7].setAttribute('class', 'remove-item-btn');

    let newChildPara = [];

    for (let i = 0; i < 7; i++) {
        newChildPara[i] = document.createElement('p');
    }

    let removeBtn = document.createElement('button');
    removeBtn.innerHTML = 'Remove';
    removeBtn.setAttribute('class', 'remove-shop-item');

    let totalPrice = itemQuantity * presentPrice;
    totalPrice = totalPrice.toFixed(2);

    newChildPara[1].innerHTML = itemName;
    newChildPara[2].innerHTML = itemPrice + `Rs/${itemUnit}`;
    newChildPara[3].innerHTML = itemDiscount + `%`;
    newChildPara[4].innerHTML = presentPrice + `Rs/${itemUnit}`;
    newChildPara[5].innerHTML = itemQuantity + ` ${itemUnit}`;
    newChildPara[6].innerHTML = totalPrice + ` Rs`;

    newParentDiv.setAttribute('data-price', presentPrice);
    newParentDiv.setAttribute('data-quantity', itemQuantity);

    for (let i = 0; i < 7; i++) {
        newChildDiv[i].appendChild(newChildPara[i]);
    }

    newChildDiv[7].appendChild(removeBtn);

    for (let i = 0; i < 8; i++) {
        newParentDiv.appendChild(newChildDiv[i]);
    }

    return newParentDiv;
}

// add items to shopping cart area
function addItemsToShoppingCartArea(itemIndex, buyBtn, itemQuantity) {
    totalAddToBuyCounter.innerHTML = ++countAddToBuyItem;
    buyBtn.style.background = 'crimson';
    buyBtn.innerHTML = 'Added';

    let getQuantity = Number(itemQuantity.value);
    let getItemName = productName[itemIndex].textContent;
    let getItemPrice = productPrice[itemIndex].textContent;
    let getItemUnit = productUnit[itemIndex].textContent;
    let getItemDiscount = productDiscount[itemIndex].textContent;
    let getPresentPrice = getItemPrice - ((getItemDiscount / 100) * getItemPrice);

    getPresentPrice = getPresentPrice.toFixed(2);
    shoppingCartItem[itemIndex] = createShoppingCartItem(getItemName, getItemPrice, getItemUnit, getItemDiscount, getPresentPrice, getQuantity);
    shoppingDetailsContent.appendChild(shoppingCartItem[itemIndex]);

    if (getItemUnit === 'kg') {
        countTotalWeight += getQuantity;
    } else if (getItemUnit === 'dzn') {
        countTotalDozen += getQuantity;
    } else if (getItemUnit === 'pcs') {
        countTotalPieces += getQuantity;
    }

    countTotalAmount += getPresentPrice * getQuantity;
    saveCartToStorage();
}

// remove items to shopping cart area
function removeItemsToShoppingCartArea(itemIndex, buyBtn, itemQuantity) {
    totalAddToBuyCounter.innerHTML = --countAddToBuyItem;
    buyBtn.style.background = '#267247';
    buyBtn.innerHTML = 'Add to Buy';

    let getQuantity = Number(itemQuantity.value);
    let getItemPrice = productPrice[itemIndex].textContent;
    let getItemUnit = productUnit[itemIndex].textContent;
    let getItemDiscount = productDiscount[itemIndex].textContent;
    let getPresentPrice = getItemPrice - ((getItemDiscount / 100) * getItemPrice);

    shoppingDetailsContent.removeChild(shoppingCartItem[itemIndex]);

    if (getItemUnit === 'kg') {
        countTotalWeight -= getQuantity;
    } else if (getItemUnit === 'dzn') {
        countTotalDozen -= getQuantity;
    } else if (getItemUnit === 'pcs') {
        countTotalPieces -= getQuantity;
    }

    countTotalAmount -= getPresentPrice * getQuantity;
    itemQuantity.value = '';
    saveCartToStorage();
}

// display buying details footer
function displayBuyingDetailsFooter(countValue) {

    if (countValue > 0) {
        buyingDetailsFooter.classList.add('active-buying-details-footer');
    } else {
        buyingDetailsFooter.classList.remove('active-buying-details-footer');
    }

    totalBuyingItems.innerHTML = shoppingDetailsContent.children.length;

    let quantityResult = ``;

    let quantityList = [countTotalWeight, countTotalDozen, countTotalPieces];

    for (let i = 0; i < quantityList.length; i++) {
        if (quantityList[i] !== 0) {
            if (quantityResult !== ``) {
                quantityResult += ` + `;
            }

            if (i === 0) {
                if (countTotalWeight % 1 === 0) {
                    quantityResult += `${countTotalWeight} kg`;
                } else {
                    quantityResult += `${countTotalWeight.toFixed(2)} kg`;
                }
            } else if (i === 1) {
                if (countTotalDozen % 1 === 0) {
                    quantityResult += `${countTotalDozen} dzn`;
                } else {
                    quantityResult += `${countTotalDozen.toFixed(2)} dzn`;
                }
            } else {
                if (countTotalPieces % 1 === 0) {
                    quantityResult += `${countTotalPieces} pcs`;
                } else {
                    quantityResult += `${countTotalPieces.toFixed(2)} pcs`;
                }
            }
        }
    }

    totalBuyingItemsQuantity.innerHTML = quantityResult;
    totalBuyingItemsAmount.innerHTML = countTotalAmount.toFixed(1);
}

// controll product serial number
function setProductSl() {
    let sl = 0;
    let shopItems = shoppingDetailsContent.children;
    for (let i = 0; i < shopItems.length; i++) {
        shopItems[i].children[0].children[0].innerHTML = ++sl;
    }
}

// remove shop itmes index from array
function removeShopItemsIndex(index) {
    for (let i = 0; i < storeShopItemsIndex.length; i++) {
        if (storeShopItemsIndex[i] === index) {
            for (let j = i; j < storeShopItemsIndex.length; j++) {
                storeShopItemsIndex[j] = storeShopItemsIndex[j + 1];
            }
        }
    }
    storeShopItemsIndex.length--;
}

// remove selected product item
function removeSelectedProduct(productIndex) {
    removeItemsToSelectedProducts(productIndex);
    if (newfavoriteItem[productIndex] !== undefined) {
        deactiveFavoriteItemAddToCartBtn(productIndex);
    }
    --countSelectedItem;
    totalSelectedCounter.innerHTML = countSelectedItem;
    cartIconProductCounter.innerHTML = countSelectedItem;
    displayBuyingHeader(countSelectedItem);
    displayCartCounter(countSelectedItem);
    addedToCart[productIndex] = false;
}

// remove shopping cart product
function removeShoppingCartProduct(productIndex) {
    let addToBuyBtn = newCartContent[productIndex].children[1].children[7];
    let itemQuantity = newCartContent[productIndex].children[1].children[4].children[1];
    removeItemsToShoppingCartArea(productIndex, addToBuyBtn, itemQuantity);
    displayBuyingDetailsFooter(countAddToBuyItem);
    displayBuyingHeader(countSelectedItem);
    itemQuantity.removeAttribute('disabled');
    removeShopItemsIndex(productIndex);
    setProductSl();
    addedForBuy[productIndex] = false;
}

// add product to shopping cart area
function addProductToShoppingCart(productIndex) {
    let addToBuyBtn = newCartContent[productIndex].children[1].children[7];
    let itemQuantity = newCartContent[productIndex].children[1].children[4].children[1];
    addItemsToShoppingCartArea(productIndex, addToBuyBtn, itemQuantity);
    displayBuyingDetailsFooter(countAddToBuyItem);
    itemQuantity.setAttribute('disabled', 'true');
    storeShopItemsIndex.push(productIndex);
    setProductSl();
}

// shopping items controll area
function controlShoppingProductItems(itemIndex) {
    let itemQuantity = newCartContent[itemIndex].children[1].children[4].children[1];
    if (addedForBuy[itemIndex] === false && itemQuantity.value !== '' && itemQuantity.value > 0) {
        addProductToShoppingCart(itemIndex);
        let shopItemRemoveBtn = shoppingCartItem[itemIndex].children[7].children[0];
        shopItemRemoveBtn.addEventListener('click', function () {
            removeShoppingCartProduct(itemIndex);
        });
        addedForBuy[itemIndex] = true;
    } else if (addedForBuy[itemIndex] === true && itemQuantity.value !== '' && itemQuantity.value > 0) {
        removeShoppingCartProduct(itemIndex);
    } else {
        if (itemQuantity.value === '') {
            alert('Please fill the quantity of your item');
        } else {
            alert('Please enter a valid quantity of your item');
        }
    }
}

// control selected product items
function controlSelectedProductItems(itemIndex) {
    if (addedToCart[itemIndex] === false) {
        addItemsToSelectedProducts(itemIndex);
        if (newfavoriteItem[itemIndex] !== undefined) {
            activeFavoriteItemAddToCartBtn(itemIndex);
        }

        let selectedProductRemoveBtn = newCartContent[itemIndex].children[1].children[8];

        selectedProductRemoveBtn.onclick = () => {
                removeSelectedProduct(itemIndex);

                // remove shopping cart item
                if (addedForBuy[itemIndex] === true) {
                    removeShoppingCartProduct(itemIndex);
                }

            }
            ++countSelectedItem;
        totalSelectedCounter.innerHTML = countSelectedItem;
        cartIconProductCounter.innerHTML = countSelectedItem;
        addedToCart[itemIndex] = true;
    } else {
        removeSelectedProduct(itemIndex);

        // remove shopping cart item
        if (addedForBuy[itemIndex] === true) {
            removeShoppingCartProduct(itemIndex);
        }
    }

    let addToBuyBtn = newCartContent[itemIndex].children[1].children[7];

    addToBuyBtn.onclick = () => {
        controlShoppingProductItems(itemIndex);
    }

    displayBuyingHeader(countSelectedItem);
    displayCartCounter(countSelectedItem);
}

// control favorite product items
function controlFavoriteProductItems(itemIndex) {
    if (addedToFavorite[itemIndex] === false) {
        addItemsToFavoriteProducts(itemIndex);
        totalFavoriteCounter.innerHTML = ++countFavoriteItem;
        addedToFavorite[itemIndex] = true;
    } else {
        removeItemsToFavoriteProducts(itemIndex);
        totalFavoriteCounter.innerHTML = --countFavoriteItem;
        addedToFavorite[itemIndex] = false;
    }

    let favoriteContent = newfavoriteItem[itemIndex].children[1].children[0];

    favoriteContent.addEventListener('click', function () {
        activeConfirmationBox('Remove item from wishlist?');
        removeConfirmBtn.onclick = () => {
            removeItemsToFavoriteProducts(itemIndex);
            totalFavoriteCounter.innerHTML = --countFavoriteItem;
            addedToFavorite[itemIndex] = false;
            removeConfirmationBox();
        }

        removeCancelBtn.onclick = () => {
            removeConfirmationBox();
        }

    });

    // select 'Add to Cart' button of favorite item
    let favoriteItemAddToCartBtn = newfavoriteItem[itemIndex].children[2].children[2].children[0];

    // actions while click 'Add to Cart' button of favorite item 
    favoriteItemAddToCartBtn.addEventListener('click', function () {
        controlSelectedProductItems(itemIndex);
    });
}

// controll product items and product cart area
(function () {
    for (let i = 0; i < addToCartBtn.length; i++) {

        // actions while click 'Add to Cart' button
        addToCartBtn[i].addEventListener('click', function () {
            controlSelectedProductItems(i);
        });

        // actions while click favorite icon 
        favoriteIcon[i].addEventListener('click', function () {
            controlFavoriteProductItems(i);
        });
    }
})();

// product cart 'Buy Items' button
let buyNowBtn = document.querySelector('#buy-items');
let buyingDetailsArea = document.querySelector('.buying-details-area');
let closeBuyingDetailsArea = document.querySelector('.close-buy-area');

// show shopping cart area
if (buyNowBtn) {
    buyNowBtn.onclick = () => {
        if (buyingDetailsArea) buyingDetailsArea.classList.add('active-buying-details');
    };
}

// remove shopping cart area
if (closeBuyingDetailsArea) {
    closeBuyingDetailsArea.onclick = () => {
        if (buyingDetailsArea) buyingDetailsArea.classList.remove('active-buying-details');
    };
}

// select 'Remove all' button of shopping cart area
let removeAllShopItems = document.querySelector('#remove-all-items');

// remove all shopping cart items
if (removeAllShopItems) {
    removeAllShopItems.onclick = () => {
        if (shoppingDetailsContent && shoppingDetailsContent.children.length > 0) {
            activeConfirmationBox('Remove all items from cart?');
            if (removeConfirmBtn) {
                removeConfirmBtn.onclick = () => {
                    // Method 1: Clear hardcoded items if any
                    for (let i = 0; i < storeShopItemsIndex.length; i++) {
                        let itemIndex = storeShopItemsIndex[i];
                        let buyBtn = newCartContent[itemIndex] ? newCartContent[itemIndex].children[1].children[7] : null;
                        let itemQuantity = newCartContent[itemIndex] ? newCartContent[itemIndex].children[1].children[4].children[1] : null;
                        if (buyBtn && itemQuantity) {
                            removeItemsToShoppingCartArea(itemIndex, buyBtn, itemQuantity);
                            itemQuantity.removeAttribute('disabled');
                            addedForBuy[itemIndex] = false;
                        }
                    }
                    storeShopItemsIndex = [];

                    // Method 2: Clear dynamic items and raw DOM
                    shoppingDetailsContent.innerHTML = "";
                    countAddToBuyItem = 0;
                    countTotalWeight = 0;
                    countTotalDozen = 0;
                    countTotalPieces = 0;
                    countTotalAmount = 0;
                    totalAddToBuyCounter.innerHTML = 0;

                    // Reset buttons in the "Selected Products" list
                    const buyButtons = cartContentArea.querySelectorAll('.add-to-buy-btn');
                    buyButtons.forEach(btn => {
                        btn.style.background = '#267247';
                        btn.innerHTML = 'Add to Buy';
                        const parentCard = btn.closest('.cart-content');
                        if (parentCard) parentCard.style.display = 'flex'; // Restore visibility
                        const input = btn.parentElement.querySelector('input[type="number"]');
                        if (input) {
                            input.removeAttribute('disabled');
                            input.value = "";
                        }
                    });

                    displayBuyingDetailsFooter(0);
                    displayBuyingHeader(countSelectedItem);
                    saveCartToStorage(); // Update storage
                    removeConfirmationBox();
                };
            }
            if (removeCancelBtn) {
                removeCancelBtn.onclick = () => {
                    removeConfirmationBox();
                };
            }
        } else {
            alert('No items found in shopping cart');
        }
    };
}

// ===================================
//    Product Cart Control Area End
// ===================================

// Bridge for dynamic products
window.addToCart = function(btnWrap, name, price, unit, image, id, farmerName, stock, actualFarmerId) {
    const btn = btnWrap.querySelector('p');
    const isAdded = btnWrap.getAttribute('data-added') === 'true';

    if (!isAdded) {
        btnWrap.setAttribute('data-added', 'true');
        btn.style.background = 'orangered';
        btn.innerHTML = '<span class="fa-solid fa-cart-arrow-down"></span> Added';
        
        const addedTime = getAddedTime();
        const newContent = createSelectedProductsContent(image, name, price, unit, 0, 'No', addedTime, id, farmerName, stock, actualFarmerId);
        
        const removeBtn = newContent.querySelector('.remove-item-btn');
        removeBtn.onclick = () => {
            cartContentArea.removeChild(newContent);
            btnWrap.setAttribute('data-added', 'false');
            btn.style.background = '#459122';
            btn.innerHTML = '<span class="fa-solid fa-cart-plus"></span> Add to Cart';
            countSelectedItem--;
            totalSelectedCounter.innerHTML = countSelectedItem;
            cartIconProductCounter.innerHTML = countSelectedItem;
            displayBuyingHeader(countSelectedItem);
            displayCartCounter(countSelectedItem);
        };

        const addToBuyBtn = newContent.querySelector('.add-to-buy-btn');
        let addedForBuyLocal = false;
        let shoppingCartItemLocal = null;

        addToBuyBtn.onclick = () => {
            const itemQuantity = newContent.querySelector('input[type="number"]');
            const q = Number(itemQuantity.value);
            
            if (!addedForBuyLocal && q > 0) {
                if (stock && q > stock) {
                    alert(`Only ${stock} items available!`);
                    return;
                }
                totalAddToBuyCounter.innerHTML = ++countAddToBuyItem;
                addToBuyBtn.style.background = 'crimson';
                addToBuyBtn.innerHTML = 'Added';
                itemQuantity.setAttribute('disabled', 'true');
                
                const presentPrice = (price - (0 * price)).toFixed(2);
                
                shoppingCartItemLocal = createShoppingCartItem(name, price, unit, 0, presentPrice, q, id, actualFarmerId);
                shoppingDetailsContent.appendChild(shoppingCartItemLocal);
                
                if (unit === 'kg') countTotalWeight += q;
                else if (unit === 'dzn') countTotalDozen += q;
                else if (unit === 'pcs') countTotalPieces += q;
                countTotalAmount += presentPrice * q;
                
                addedForBuyLocal = true;
                newContent.style.display = 'none'; // Hide from Selected Products list
                saveCartToStorage();
                displayBuyingDetailsFooter(countAddToBuyItem);

                const shopItemRemoveBtn = shoppingCartItemLocal.querySelector('.remove-shop-item');
                shopItemRemoveBtn.onclick = () => {
                    totalAddToBuyCounter.innerHTML = --countAddToBuyItem;
                    addToBuyBtn.style.background = '#267247';
                    addToBuyBtn.innerHTML = 'Add to Buy';
                    itemQuantity.removeAttribute('disabled');
                    shoppingDetailsContent.removeChild(shoppingCartItemLocal);
                    newContent.style.display = 'flex'; // Show again in Selected Products
                    
                    if (unit === 'kg') countTotalWeight -= q;
                    else if (unit === 'dzn') countTotalDozen -= q;
                    else if (unit === 'pcs') countTotalPieces -= q;
                    countTotalAmount -= presentPrice * q;
                    
                    addedForBuyLocal = false;
                    saveCartToStorage();
                    displayBuyingDetailsFooter(countAddToBuyItem);
                };

            } else if (addedForBuyLocal) {
                // Trigger the remove logic if clicked again
                shoppingCartItemLocal.querySelector('.remove-shop-item').click();
            } else {
                alert('Please enter a valid quantity');
            }
        };

        cartContentArea.insertBefore(newContent, cartContentArea.firstChild);
        countSelectedItem++;
        saveCartToStorage();
    } else {
        productCartArea.classList.add('active-cart');
    }
    
    totalSelectedCounter.innerHTML = countSelectedItem;
    cartIconProductCounter.innerHTML = countSelectedItem;
    displayBuyingHeader(countSelectedItem);
    displayCartCounter(countSelectedItem);
};

// ==============================
//    Confirm Order Area Start
// ==============================

const confirmOrderBtn = document.getElementById('confirm-order-btn');
if (confirmOrderBtn) {
    confirmOrderBtn.onclick = async () => {
        const customerId = localStorage.getItem('customerId');
        if (!customerId) {
            alert('Please login to place an order.');
            window.location.href = 'login.html';
            return;
        }

        const shoppingDetailsItems = shoppingDetailsContent.querySelectorAll('.shopping-details');
        if (shoppingDetailsItems.length === 0) {
            alert('Your cart is empty. Please add items to buy.');
            return;
        }

        if (!confirm("Are you sure you want to place this order?")) return;

        const items = [];
        let missingIds = false;
        shoppingDetailsItems.forEach(itemDiv => {
            const id = itemDiv.getAttribute('data-id');
            const farmerId = itemDiv.getAttribute('data-farmer-id');
            if (!id || id === 'null' || id === 'undefined') missingIds = true;
            const name = itemDiv.children[1].children[0].innerText;
            const priceText = itemDiv.getAttribute('data-price');
            const price = parseFloat(priceText);
            const quantity = parseFloat(itemDiv.getAttribute('data-quantity'));

            items.push({ productId: id, farmerId, name, price, quantity });
        });

        if (missingIds) {
            alert('One or more items are missing internal IDs. Please try removing and re-adding them.');
            return;
        }

        const totalAmount = parseFloat(totalBuyingItemsAmount.innerText);

        try {
                const response = await fetch('http://localhost:5000/api/order/place', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: customerId, 
                        items, 
                        totalAmount,
                        address: localStorage.getItem('customerAddress'),
                        phone: localStorage.getItem('customerPhone')
                    })
                });
            const data = await response.json();

            if (response.ok) {
                alert('Order Placed! Check your email for confirmation.');
                localStorage.removeItem('farmly_cart'); // Clear cart on success
                window.location.reload(); 
            } else {
                alert(data.message || 'Order Failed');
            }
        } catch (err) {
            console.error('Order Error:', err);
            alert('Server Error during order placement. Ensure backend is running.');
        }
    };
}

// ==============================
//    Confirm Order Area End
// ==============================





// ================================
//    Countdown Timer Area Start
// ================================

// Big deals countdown timer
const bigDealsDay = document.getElementById('day');
const bigDealsHour = document.getElementById('hour');
const bigDealsMinute = document.getElementById('minute');
const bigDealsSecond = document.getElementById('second');

// Initialize date, month, year
let date = new Date();
let monthIndex = date.getMonth();
let year = date.getFullYear();

// Create infinite countdown
function createInfiniteCountdown(date, time) {
    let curntTime = Date.now();
    let month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let eventTime = new Date(`${month[monthIndex]} ${date}, ${year} ${time}`).getTime();
    let totalSeconds = (eventTime - curntTime) / 1000;

    if (totalSeconds < 0) {
        monthIndex = (monthIndex + 1) % 12;

        if (monthIndex === 0) {
            year = year + 1;
        }

        let eventTime = new Date(`${month[monthIndex]} ${date}, ${year} ${time}`).getTime();
        totalSeconds = (eventTime - curntTime) / 1000;
    }

    let dayConst = 86400;
    let hourConst = 3600;
    let minuteConst = 60;

    let days = Math.floor(totalSeconds / dayConst);
    totalSeconds = totalSeconds % dayConst;

    let hours = Math.floor(totalSeconds / hourConst);
    totalSeconds = totalSeconds % hourConst;

    let minutes = Math.floor(totalSeconds / minuteConst);
    totalSeconds = totalSeconds % minuteConst;

    let seconds = Math.floor(totalSeconds);

    if (days < 10) {
        days = '0' + days;
    }

    if (hours < 10) {
        hours = '0' + hours;
    }

    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    return [days, hours, minutes, seconds];
}

// Display and update timer
function updateCountDownTimer(time, dest) {
    if (dest[0]) dest[0].textContent = time[0];
    if (dest[1]) dest[1].textContent = time[1];
    if (dest[2]) dest[2].textContent = time[2];
    if (dest[3]) dest[3].textContent = time[3];
}

// Infinite countdown timer
let timeCount = setInterval(() => {
    let createCountdown, updateDest;

    createCountdown = createInfiniteCountdown('28', '12:00:00');
    updateDest = [bigDealsDay, bigDealsHour, bigDealsMinute, bigDealsSecond];

    updateCountDownTimer(createCountdown, updateDest);

}, 1000);

// Bridge for dynamic favorites
window.toggleFavorite = function(heartIcon, name, price, unit, image, id) {
    const parentWrap = heartIcon.closest('.product-wrap');
    if (!parentWrap) return;

    const isFav = heartIcon.getAttribute('data-fav') === 'true';
    const span = heartIcon.querySelector('span') || heartIcon;

    if (!isFav) {
        heartIcon.setAttribute('data-fav', 'true');
        span.style.background = '#fff'; // White background
        span.style.color = '#e74c3c'; // Red heart
        span.style.fontSize = '1.3rem'; // Make it pop
        
        // Create a dedicated clone for the wishlist
        let clone = parentWrap.cloneNode(true);
        clone.classList.add('favorite-item-clone');
        if (id) clone.setAttribute('data-id', id);
        
        const fNameEle = parentWrap.querySelector('.seller-name strong');
        const fName = fNameEle ? fNameEle.textContent : 'Unknown Farmer';
        const sEle = parentWrap.querySelector('.stock-level strong');
        const sLevel = sEle ? parseFloat(sEle.textContent) : 0;
        
        // Setup Add to Cart for the clone
        const cloneCartBtn = clone.querySelector('.add-to-cart-btn');
        if (cloneCartBtn) {
            cloneCartBtn.onclick = () => {
                window.addToCart(cloneCartBtn, name, price, unit, image, id, fName, sLevel);
            };
        }
        
        // Setup removal behavior for the heart inside the wishlist
        const cloneHeart = clone.querySelector('.add-to-favorite');
        if (cloneHeart) {
            const cloneSpan = cloneHeart.querySelector('span') || cloneHeart;
            cloneSpan.style.background = '#fff';
            cloneSpan.style.color = '#e74c3c';
            cloneHeart.onclick = (e) => {
                e.stopPropagation();
                activeConfirmationBox('Remove item from wishlist?');
                removeConfirmBtn.onclick = () => {
                    if (clone.parentNode === cartWishlistArea) {
                        cartWishlistArea.removeChild(clone);
                        heartIcon.setAttribute('data-fav', 'false');
                        span.style.background = 'rgba(255, 255, 255, 0.9)';
                        span.style.color = '#459122';
                        countFavoriteItem--;
                        totalFavoriteCounter.innerHTML = countFavoriteItem > 0 ? countFavoriteItem : 'No item found';
                    }
                    removeConfirmationBox();
                };
                removeCancelBtn.onclick = removeConfirmationBox;
            };
        }

        cartWishlistArea.appendChild(clone);
        countFavoriteItem++;
        totalFavoriteCounter.innerHTML = countFavoriteItem;
        saveFavoritesToStorage();
    } else {
        // Find the matching item in wishlist and remove it
        const wishlistItems = cartWishlistArea.querySelectorAll('.product-wrap');
        wishlistItems.forEach(item => {
            const pName = item.querySelector('.product-name').textContent;
            if (pName === name) {
                cartWishlistArea.removeChild(item);
                heartIcon.setAttribute('data-fav', 'false');
                span.style.background = 'rgba(255, 255, 255, 0.9)';
                span.style.color = '#459122';
                countFavoriteItem--;
            }
        });
        totalFavoriteCounter.innerHTML = countFavoriteItem > 0 ? countFavoriteItem : 'No item found';
        saveFavoritesToStorage();
    }
};

// =========================
//    Profile Logic Start
// =========================
document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.getElementById('profile-container');
    const profileDropdown = document.getElementById('profile-dropdown');
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userPhoneElement = document.getElementById('user-phone');
    const userAddressElement = document.getElementById('user-address');
    const logoutBtn = document.getElementById('logout-btn');
    const loginLink = document.querySelector('#login-or-signup a');

    const customerName = localStorage.getItem('customerName');
    const customerId = localStorage.getItem('customerId');
    const customerEmail = localStorage.getItem('customerEmail');
    const customerPhone = localStorage.getItem('customerPhone');
    const customerAddress = localStorage.getItem('customerAddress');

    console.log("Current Session:", { customerName, customerId, customerEmail, customerPhone, customerAddress });

    const getCleanValue = (val) => (val && val !== 'undefined' && val !== 'null') ? val : 'N/A';

    // Proactive Sync: Fetch latest info if logged in
    async function syncProfile() {
        if (!customerId) return;
        try {
            // Added cache-busting timestamp to avoid old responses
            const response = await fetch(`http://localhost:5000/api/customer/profile/${customerId}?t=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                console.log("Profile Synced (Backend Version:", data.version, ")", data);
                
                // Update LocalStorage to keep in sync
                localStorage.setItem('customerName', data.name);
                localStorage.setItem('customerEmail', data.email);
                localStorage.setItem('customerPhone', data.phone);
                localStorage.setItem('customerAddress', data.address);
                
                // Update UI instantly
                if (userNameElement) userNameElement.textContent = data.name;
                if (userEmailElement) userEmailElement.textContent = getCleanValue(data.email);
                if (userPhoneElement) {
                    userPhoneElement.textContent = getCleanValue(data.phone);
                }
                if (userAddressElement) {
                    userAddressElement.textContent = getCleanValue(data.address);
                }
            } else {
                console.warn("Profile sync failed. Error Code:", response.status);
            }
        } catch (err) {
            console.error("Profile sync network error", err);
        }
    }

    if (customerName) {
        // Show initial cached values first
        if (userNameElement) userNameElement.textContent = customerName;
        if (userEmailElement) userEmailElement.textContent = getCleanValue(customerEmail);
        if (userPhoneElement) userPhoneElement.textContent = getCleanValue(customerPhone);
        if (userAddressElement) userAddressElement.textContent = getCleanValue(customerAddress);
        
        // Sync with backend to fix any "N/A"
        syncProfile();
        
        if (loginLink) {
            loginLink.href = "javascript:void(0)"; 
            loginLink.onclick = (e) => {
                e.preventDefault();
                if (profileDropdown) profileDropdown.classList.toggle('active-dropdown');
            };
        }
        
        // Ensure Logout button is visible and properly styled
        if (logoutBtn) {
            logoutBtn.textContent = 'Logout';
            logoutBtn.style.display = 'block';
            logoutBtn.style.background = '#f4f4f4';
            logoutBtn.style.color = '#333';
            
            logoutBtn.onclick = (e) => {
                e.stopPropagation();
                localStorage.removeItem('customerName');
                localStorage.removeItem('customerId');
                localStorage.removeItem('customerEmail');
                localStorage.removeItem('customerPhone');
                localStorage.removeItem('customerAddress');
                window.location.reload();
            };
        }

        // Show dropdown on hover
        if (profileContainer && profileDropdown) {
            profileContainer.addEventListener('mouseenter', () => {
                profileDropdown.classList.add('active-dropdown');
            });
            profileContainer.addEventListener('mouseleave', () => {
                profileDropdown.classList.remove('active-dropdown');
            });
        }

        // Link Wishlist button in profile to sidebar favorites
        const wishlistLinks = document.querySelectorAll('.profile-links a');
        wishlistLinks.forEach(link => {
            if (link.textContent.toLowerCase().includes('wishlist')) {
                link.href = 'javascript:void(0)';
                link.onclick = (e) => {
                    e.preventDefault();
                    if (profileDropdown) profileDropdown.classList.remove('active-dropdown');
                    window.openFavoritesSidebar();
                };
            }
        });
    } else {
        // User is NOT logged in
        if (userNameElement) userNameElement.textContent = "N/A";
        if (userEmailElement) userEmailElement.textContent = "N/A";
        if (userPhoneElement) {
            userPhoneElement.textContent = "N/A";
            userPhoneElement.parentElement.style.display = 'block'; // Ensure it's visible
        }
        
        // Change "Logout" button to "Login" button
        if (logoutBtn) {
            logoutBtn.textContent = 'Login';
            logoutBtn.style.display = 'block';
            logoutBtn.style.background = '#267226'; // Brand Green
            logoutBtn.style.color = '#fff';
            
            logoutBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.href = 'login.html';
            };
        }
        
        // Still allow hover for info
        if (profileContainer && profileDropdown) {
            profileContainer.addEventListener('mouseenter', () => {
                profileDropdown.classList.add('active-dropdown');
            });
            profileContainer.addEventListener('mouseleave', () => {
                profileDropdown.classList.remove('active-dropdown');
            });
        }
    }

    // --- Persistence: Load Cart & Favorites ---
    function loadCartAndFavorites() {
        // Load Cart
        const savedCart = JSON.parse(localStorage.getItem('farmly_cart') || '[]');
        savedCart.forEach(data => {
            // Check if already in DOM (for static index.html items)
            let existing = false;
            const items = cartContentArea.querySelectorAll('.cart-content');
            items.forEach(i => {
                if (i.querySelector('.cart-details span').textContent === data.name) existing = true;
            });
            if (existing) return;

            // Use window.addToCart if it's a dynamic product?
            // Actually, better to just reconstruct it manually or find the button.
            // But since many products are loaded via API, we just reconstruct the cart UI.
            const newContent = createSelectedProductsContent(data.image, data.name, data.price, data.unit, data.discount, 'No', data.addedTime, data.id, data.farmerName, data.stock, data.actualFarmerId);
            
            // Setup removeBtn
            const removeBtn = newContent.querySelector('.remove-item-btn');
            removeBtn.onclick = () => {
                cartContentArea.removeChild(newContent);
                // Also reset any button on the page if it exists
                const originBtn = Array.from(document.querySelectorAll('.product-wrap')).find(p => p.querySelector('.product-name').textContent === data.name);
                if (originBtn) {
                   const btn = originBtn.querySelector('.add-to-cart-btn');
                   if (btn) btn.setAttribute('data-added', 'false');
                   const p = btn.querySelector('p');
                   if (p) {
                       p.style.background = '#459122';
                       p.innerHTML = '<span class="fa-solid fa-cart-plus"></span> Add to Cart';
                   }
                }
                countSelectedItem--;
                totalSelectedCounter.innerHTML = countSelectedItem;
                cartIconProductCounter.innerHTML = countSelectedItem;
                displayBuyingHeader(countSelectedItem);
                displayCartCounter(countSelectedItem);
                saveCartToStorage();
            };

            const addToBuyBtn = newContent.querySelector('.add-to-buy-btn');
            const itemQuantity = newContent.querySelector('input[type="number"]');
            
            let addedForBuyLocal = false;
            let shoppingCartItemLocal = null;

            addToBuyBtn.onclick = () => {
                const q = Number(itemQuantity.value);
                if (!addedForBuyLocal && q > 0) {
                    totalAddToBuyCounter.innerHTML = ++countAddToBuyItem;
                    addToBuyBtn.style.background = 'crimson';
                    addToBuyBtn.innerHTML = 'Added';
                    itemQuantity.setAttribute('disabled', 'true');
                    
                    const presentPrice = (data.price - ((data.discount/100) * data.price)).toFixed(2);
                    shoppingCartItemLocal = createShoppingCartItem(data.name, data.price, data.unit, data.discount, presentPrice, q, data.buyData ? (data.buyData.id || data.id) : data.id, data.actualFarmerId || (data.buyData ? data.buyData.farmerId : null));
                    shoppingDetailsContent.appendChild(shoppingCartItemLocal);
                    
                    if (data.unit === 'kg') countTotalWeight += q;
                    else if (data.unit === 'dzn') countTotalDozen += q;
                    else if (data.unit === 'pcs') countTotalPieces += q;
                    countTotalAmount += presentPrice * q;
                    
                    addedForBuyLocal = true;
                    newContent.style.display = 'none'; // Hide from sidebar
                    saveCartToStorage();
                    displayBuyingDetailsFooter(countAddToBuyItem);

                    const shopItemRemoveBtn = shoppingCartItemLocal.querySelector('.remove-shop-item');
                    shopItemRemoveBtn.onclick = () => {
                        totalAddToBuyCounter.innerHTML = --countAddToBuyItem;
                        addToBuyBtn.style.background = '#267247';
                        addToBuyBtn.innerHTML = 'Add to Buy';
                        itemQuantity.removeAttribute('disabled');
                        shoppingDetailsContent.removeChild(shoppingCartItemLocal);
                        newContent.style.display = 'flex'; // Show again in sidebar
                        
                        const presentPrice = (data.price - ((data.discount/100) * data.price)).toFixed(2);
                        if (data.unit === 'kg') countTotalWeight -= q;
                        else if (data.unit === 'dzn') countTotalDozen -= q;
                        else if (data.unit === 'pcs') countTotalPieces -= q;
                        countTotalAmount -= presentPrice * q;
                        
                        addedForBuyLocal = false;
                        newContent.style.display = 'flex'; // Show again in Selected Products
                        saveCartToStorage();
                        displayBuyingDetailsFooter(countAddToBuyItem);
                    };
                } else if (addedForBuyLocal) {
                    shoppingCartItemLocal.querySelector('.remove-shop-item').click();
                }
            };

            cartContentArea.appendChild(newContent);
            if (data.buyData) {
                newContent.style.display = 'none'; // Hide if already in buy list
            }
            countSelectedItem++;

            // If it was already "Buy Items" confirmed in the backup
            if (data.buyData) {
                itemQuantity.value = data.buyData.quantity;
                addToBuyBtn.click();
            }
        });

        // Load Favorites
        const savedFavs = JSON.parse(localStorage.getItem('farmly_favorites') || '[]');
        savedFavs.forEach(data => {
            // Avoid duplicates
            let existing = false;
            Array.from(cartWishlistArea.children).forEach(c => {
               if (c.querySelector('.product-name').textContent === data.name) existing = true;
            });
            if (existing) return;

            // Build a simple favorite element
            const favWrap = document.createElement('div');
            favWrap.className = 'product-wrap favorite-item-clone';
            if (data.id) favWrap.setAttribute('data-id', data.id);
            favWrap.innerHTML = `
                <div class="product-img"><img src="${data.image}" alt="${data.name}"></div>
                <div class="product-icons">
                    <div class="add-to-favorite" data-fav="true" style="padding:0.1rem;"><span class="fa-solid fa-heart" style="background:#fff; color:#e74c3c; padding:0.6rem; border-radius:50%; font-size:1.2rem; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"></span></div>
                </div>
                <div class="product-description">
                    <p class="product-name" style="color: #2c3e50; font-weight: 700;">${data.name}</p>
                    <p class="seller-name" style="font-size: 0.8rem; color: #7f8c8d; margin-bottom: 0.2rem;">Sold by: <strong>${data.farmerName || 'Unknown Farmer'}</strong></p>
                    <p class="price"><strong>Price:</strong><ins><span class="f-cur-price">${data.price}</span>Rs/${data.unit || 'kg'}</ins></p>
                    <div class="add-to-cart-btn" style="cursor:pointer; margin-top: 1rem;">
                        <p style="background: linear-gradient(135deg, #459122 0%, #267247 100%); color:white; padding:0.8rem; border-radius:30px; text-align:center; font-weight:600; font-size: 0.95rem;">
                            <span class="fa-solid fa-cart-plus"></span> Add to Cart
                        </p>
                    </div>
                </div>
            `;
            
            favWrap.querySelector('.add-to-favorite').onclick = () => {
                activeConfirmationBox('Remove item from wishlist?');
                removeConfirmBtn.onclick = () => {
                   cartWishlistArea.removeChild(favWrap);
                   countFavoriteItem--;
                   totalFavoriteCounter.innerHTML = countFavoriteItem > 0 ? countFavoriteItem : 'No item found';
                   saveFavoritesToStorage();
                   removeConfirmationBox();
                };
            };

            // Add function to "Add to Cart" button in favorites
            const favAddToCartBtn = favWrap.querySelector('.add-to-cart-btn');
            favAddToCartBtn.onclick = () => {
                // We don't have an index 'i' here, so we call window.addToCart directly
                window.addToCart(favAddToCartBtn, data.name, data.price, data.unit, data.image, data.id, data.farmerName, data.stock);
            };

            cartWishlistArea.appendChild(favWrap);
            countFavoriteItem++;
        });

        totalSelectedCounter.innerHTML = countSelectedItem > 0 ? countSelectedItem : 'No item found';
        totalFavoriteCounter.innerHTML = countFavoriteItem > 0 ? countFavoriteItem : 'No item found';
        cartIconProductCounter.innerHTML = countSelectedItem;
        displayCartCounter(countSelectedItem);
        displayBuyingHeader(countSelectedItem);
    }

    loadCartAndFavorites();
});

// =======================
//    Profile Logic End
// =======================

// ==============================
//    Countdown Timer Area End
// ==============================