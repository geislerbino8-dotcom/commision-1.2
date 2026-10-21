/**
 * Mr. Boy SpecialTea — Application JavaScript
 *
 * Handles:
 * - Authentication (Register, Login, Logout, Session State)
 * - Section Navigation (Home, Menu, Cart, About, Contact, Admin)
 * - Cart Management & Real-time Total Calculation
 * - Add-ons & Receipt Generation
 * - Admin Order Management (Protected by Admin Role)
 */

/* ============================================================
   GLOBAL STATE
   ============================================================ */

let currentUser = null;
let cart = [];
let total = 0;


/* ============================================================
   INITIALIZATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Check initial user authentication status
    checkAuthStatus();

    // Fade-in home section on load
    const home = document.getElementById('home');
    if (home) {
        home.style.opacity = 0;
        home.style.display = 'block';
        home.style.transition = 'opacity 1s ease';
        requestAnimationFrame(() => {
            home.style.opacity = 1;
        });
    }

    // "Start Ordering" button → navigate to menu
    const startBtn = document.getElementById('start-ordering');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const current = document.querySelector('.section.active');
            if (current) {
                current.style.opacity = 0;
                setTimeout(() => {
                    showSection('menu');
                }, 400);
            } else {
                showSection('menu');
            }
        });
    }

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAuthModal();
        }
    });
});


/* ============================================================
   AUTHENTICATION (REGISTER / LOGIN / LOGOUT)
   ============================================================ */

/**
 * Check if the user is already logged in (via API or localStorage fallback).
 */
function checkAuthStatus() {
    fetch('api/current_user.php')
        .then(res => res.json())
        .then(data => {
            if (data.logged_in && data.user) {
                currentUser = data.user;
                localStorage.setItem('mr_boy_user', JSON.stringify(currentUser));
            } else {
                // Check localStorage backup
                const cached = localStorage.getItem('mr_boy_user');
                if (cached) {
                    try {
                        currentUser = JSON.parse(cached);
                    } catch(e) {
                        currentUser = null;
                    }
                } else {
                    currentUser = null;
                }
            }
            updateAuthUI();
        })
        .catch(() => {
            const cached = localStorage.getItem('mr_boy_user');
            if (cached) {
                try {
                    currentUser = JSON.parse(cached);
                } catch(e) {
                    currentUser = null;
                }
            }
            updateAuthUI();
        });
}

/**
 * Update Navbar and Admin view based on auth state.
 */
function updateAuthUI() {
    const navAuth = document.getElementById('nav-auth');
    if (navAuth) {
        if (currentUser) {
            const roleBadge = currentUser.role === 'admin' 
                ? '<span class="auth-role-tag">Admin</span>' 
                : '';

            navAuth.innerHTML = `
                <div class="auth-user-badge">
                    <span>👤 ${currentUser.fullname}</span>
                    ${roleBadge}
                </div>
                <button onclick="handleLogout()" class="auth-logout-btn">🚪 Logout</button>
            `;
        } else {
            navAuth.innerHTML = `
                <button onclick="openAuthModal('login')" class="auth-nav-btn">🔑 Login / Register</button>
            `;
        }
    }

    // Auto-fill customer name in cart if logged in
    const nameInput = document.getElementById('customer-name');
    if (nameInput && currentUser && !nameInput.value.trim()) {
        nameInput.value = currentUser.fullname;
    }

    // Update Admin dashboard view gate
    updateAdminGate();
}

/**
 * Update Admin tab contents according to role.
 */
function updateAdminGate() {
    const gate = document.getElementById('admin-auth-gate');
    const content = document.getElementById('admin-content');

    if (!gate || !content) return;

    if (currentUser && currentUser.role === 'admin') {
        gate.style.display = 'none';
        content.style.display = 'block';
        loadOrders();
    } else {
        gate.style.display = 'block';
        content.style.display = 'none';
    }
}

/**
 * Open the Auth Modal on Login or Register tab.
 */
function openAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex';
        clearAuthAlert();
        switchAuthTab(tab);
    }
}

/**
 * Close the Auth Modal.
 */
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'none';
        clearAuthAlert();
    }
}

/**
 * Switch between Login and Register tabs.
 */
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegBtn = document.getElementById('tab-register-btn');

    clearAuthAlert();

    if (tab === 'login') {
        if (loginForm) loginForm.style.display = 'flex';
        if (regForm) regForm.style.display = 'none';
        if (tabLoginBtn) tabLoginBtn.classList.add('active');
        if (tabRegBtn) tabRegBtn.classList.remove('active');
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (regForm) regForm.style.display = 'flex';
        if (tabLoginBtn) tabLoginBtn.classList.remove('active');
        if (tabRegBtn) tabRegBtn.classList.add('active');
    }
}

/**
 * Show alert banner in auth modal.
 */
function showAuthAlert(message, type = 'error') {
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) {
        alertBox.textContent = message;
        alertBox.className = `auth-alert ${type}`;
        alertBox.style.display = 'block';
    }
}

function clearAuthAlert() {
    const alertBox = document.getElementById('auth-alert');
    if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.textContent = '';
    }
}

/**
 * Handle Login Form Submission.
 */
function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit-btn');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username || !password) {
        showAuthAlert("Please enter both username/email and password.");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";
    }

    fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Login ☕";
        }

        if (data.status === 'success') {
            currentUser = data.user;
            localStorage.setItem('mr_boy_user', JSON.stringify(currentUser));
            showAuthAlert(data.message || "Login successful!", 'success');
            setTimeout(() => {
                closeAuthModal();
                updateAuthUI();
                // If on admin tab and user is admin, refresh view
                const adminSec = document.getElementById('admin');
                if (adminSec && adminSec.classList.contains('active')) {
                    updateAdminGate();
                }
            }, 700);
        } else {
            showAuthAlert(data.message || "Invalid login credentials.", 'error');
        }
    })
    .catch(err => {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Login ☕";
        }
        showAuthAlert("Could not connect to server. Check your connection.", 'error');
    });
}

/**
 * Handle Registration Form Submission.
 */
function handleRegister(e) {
    e.preventDefault();
    const fullnameInput = document.getElementById('reg-fullname');
    const usernameInput = document.getElementById('reg-username');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const submitBtn = document.getElementById('reg-submit-btn');

    const fullname = fullnameInput ? fullnameInput.value.trim() : '';
    const username = usernameInput ? usernameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!fullname || !username || !email || !password) {
        showAuthAlert("Please fill in all fields.");
        return;
    }

    if (password.length < 6) {
        showAuthAlert("Password must be at least 6 characters.");
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Account...";
    }

    fetch('api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, username, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account ✨";
        }

        if (data.status === 'success') {
            currentUser = data.user;
            localStorage.setItem('mr_boy_user', JSON.stringify(currentUser));
            showAuthAlert(data.message || "Account created successfully!", 'success');
            setTimeout(() => {
                closeAuthModal();
                updateAuthUI();
            }, 800);
        } else {
            showAuthAlert(data.message || "Registration failed.", 'error');
        }
    })
    .catch(err => {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account ✨";
        }
        showAuthAlert("Could not connect to server. Check your connection.", 'error');
    });
}

/**
 * Handle Logout.
 */
function handleLogout() {
    fetch('api/logout.php', { method: 'POST' })
        .finally(() => {
            currentUser = null;
            localStorage.removeItem('mr_boy_user');
            updateAuthUI();
            alert("You have been logged out.");
            showSection('home');
        });
}


/* ============================================================
   SECTION NAVIGATION
   ============================================================ */

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active');
            section.style.display = 'block';
            section.style.opacity = 0;
            section.style.transition = 'opacity 0.4s ease';
            requestAnimationFrame(() => {
                section.style.opacity = 1;
            });

            // Refresh cart UI when switching to cart
            if (sectionId === 'cart') {
                renderCart();
                updatePearlButton();
                updateGenerateButton();
                // Pre-fill name if user logged in
                const nameInput = document.getElementById('customer-name');
                if (nameInput && currentUser && !nameInput.value.trim()) {
                    nameInput.value = currentUser.fullname;
                }
            }

            // Refresh admin view
            if (sectionId === 'admin') {
                updateAdminGate();
            }
        } else {
            section.classList.remove('active');
            section.style.opacity = 0;
            section.style.display = 'none';
        }
    });
}


/* ============================================================
   CART MANAGEMENT
   ============================================================ */

/**
 * Add an item to the cart and switch to cart view.
 */
function addToCart(item, price) {
    cart.push({ item: item, price: price, addons: [] });
    total += price;
    renderCart();
    updatePearlButton();
    updateGenerateButton();
    showSection('cart');
}

/**
 * Add an add-on to the last item in the cart.
 */
function addAddonToLastItem(addonName, addonPrice) {
    if (cart.length === 0) {
        alert("Please order a drink first.");
        return;
    }
    const lastItem = cart[cart.length - 1];
    lastItem.addons.push({ name: addonName, price: addonPrice });
    total += addonPrice;
    renderCart();
}

/**
 * Render the cart items list and total.
 */
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems || !cartTotal) return;

    cartItems.innerHTML = '';
    cart.forEach((cartItem, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${cartItem.item}</strong> - ₱${cartItem.price}`;

        // Render add-ons
        if (cartItem.addons.length > 0) {
            const addonList = document.createElement('ul');
            cartItem.addons.forEach(addon => {
                const addonLi = document.createElement('li');
                addonLi.textContent = `+ ${addon.name} (₱${addon.price})`;
                addonList.appendChild(addonLi);
            });
            li.appendChild(addonList);
        }

        // Cancel button per item
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = "❌";
        cancelBtn.style.marginLeft = "10px";
        cancelBtn.onclick = () => removeItem(index);
        li.appendChild(cancelBtn);

        cartItems.appendChild(li);
    });

    cartTotal.textContent = total;
}

/**
 * Remove an item from the cart by index.
 */
function removeItem(index) {
    const item = cart[index];
    if (!item) return;
    total -= item.price;
    item.addons.forEach(addon => total -= addon.price);
    cart.splice(index, 1);
    renderCart();
    updatePearlButton();
    updateGenerateButton();
}

/**
 * Clear the entire cart.
 */
function clearCart() {
    cart = [];
    total = 0;
    renderCart();
    updatePearlButton();
    updateGenerateButton();
    const receipt = document.getElementById('receipt');
    if (receipt) receipt.style.display = 'none';
}

/**
 * Enable/disable the Pearl add-on button based on cart state.
 */
function updatePearlButton() {
    const pearlBtn = document.getElementById('pearl-btn');
    if (pearlBtn) {
        pearlBtn.disabled = (cart.length === 0);
    }
}

/**
 * Enable/disable the Generate Receipt button based on cart state.
 */
function updateGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.disabled = (cart.length === 0);
    }
}


/* ============================================================
   RECEIPT GENERATION & ORDER SUBMISSION
   ============================================================ */

function generateReceipt() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    if (!currentUser) {
        alert("Please log in or register before submitting your order.");
        openAuthModal('login');
        return;
    }

    const nameInput = document.getElementById('customer-name');
    const name = nameInput ? nameInput.value.trim() : (currentUser ? currentUser.fullname : "");

    if (!name) {
        alert("Please enter your name before generating receipt.");
        if (nameInput) nameInput.focus();
        return;
    }

    fetch('api/submit_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: currentUser ? currentUser.id : null,
            customer_name: name,
            order_details: cart.map(item => item.item).join(", "),
            total_price: total
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Success! Order saved to database.");

            // Populate receipt
            const receiptItems = document.getElementById('receipt-items');
            if (receiptItems) {
                receiptItems.innerHTML = '';
                cart.forEach(cartItem => {
                    const li = document.createElement('li');
                    li.textContent = `${cartItem.item} - ₱${cartItem.price}`;
                    receiptItems.appendChild(li);
                });
            }

            const rName  = document.getElementById('receipt-name');
            const rTotal = document.getElementById('receipt-total');
            const rDiv   = document.getElementById('receipt');

            if (rName)  rName.textContent  = name;
            if (rTotal) rTotal.textContent = total;
            if (rDiv)   rDiv.style.display = 'block';
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to connect to server. Check Console (F12).");
    });
}


/* ============================================================
   ADMIN — ORDER MANAGEMENT
   ============================================================ */

/**
 * Load all orders into the admin dashboard table.
 */
function loadOrders() {
    const tableBody = document.getElementById('admin-order-list');
    if (!tableBody) return;

    fetch('api/fetch_orders.php')
        .then(response => response.json())
        .then(data => {
            tableBody.innerHTML = "";

            if (!data || data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="padding: 20px; text-align: center; color: #888;">No orders found.</td>
                    </tr>
                `;
                return;
            }

            data.forEach(order => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="padding:8px; border:1px solid #ddd;">${order.order_date}</td>
                    <td style="padding:8px; border:1px solid #ddd;">${order.customer_name}</td>
                    <td style="padding:8px; border:1px solid #ddd;">${order.order_details}</td>
                    <td style="padding:8px; border:1px solid #ddd;">₱${order.total_price}</td>
                    <td style="padding:8px; border:1px solid #ddd;">
                        <button onclick="deleteOrder(${order.id})">Done</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

/**
 * Delete a single order and refresh the table.
 */
function deleteOrder(id) {
    fetch('api/delete_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            loadOrders();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => console.error('Delete error:', err));
}

/**
 * Clear all order records.
 */
function clearAllOrders() {
    if (!confirm("Are you sure you want to clear ALL order records?")) return;

    fetch('api/clear_orders.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            alert("All records cleared.");
            loadOrders();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => console.error('Clear error:', err));
}


/* ============================================================
   FEATURED PRODUCTS CAROUSEL SLIDER (HOME PAGE)
   ============================================================ */

let currentSlideIndex = 0;
const totalSlides = 6;
let sliderTimer = null;
let isSliderPaused = false;

function initFeaturedSlider() {
    startSliderAutoPlay();
}

function startSliderAutoPlay() {
    if (sliderTimer) clearInterval(sliderTimer);
    sliderTimer = setInterval(() => {
        if (!isSliderPaused) {
            nextSlide();
        }
    }, 4500);
}

function updateSliderView() {
    const track = document.getElementById('carousel-track');
    const pills = document.querySelectorAll('.slider-category-tabs .cat-pill');
    const dots = document.querySelectorAll('.carousel-dots .dot');

    if (track) {
        track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    // Update Category Pills
    pills.forEach((pill, idx) => {
        if (idx === currentSlideIndex) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });

    // Update Dots
    dots.forEach((dot, idx) => {
        if (idx === currentSlideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function jumpToSlide(index) {
    currentSlideIndex = (index + totalSlides) % totalSlides;
    updateSliderView();
}

function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    updateSliderView();
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    updateSliderView();
}

function pauseSlider() {
    isSliderPaused = true;
}

function resumeSlider() {
    isSliderPaused = false;
}

// Start slider when document loads
document.addEventListener('DOMContentLoaded', () => {
    initFeaturedSlider();
});


/* ============================================================
   LANDING PAGE — replica of the React home view
   (marquee, hero photo carousel, featured slider, categories,
    theme toggle, mobile drawer)
   ============================================================ */

const LP_HERO_BG = [
    'public/images/storefront.webp',
    'public/images/Boy.jpeg',
    'public/images/menuboard.webp',
    'public/images/475807591_609840018360890_5530054815047393827_n.jpg'
];

const LP_BEST_SELLERS = [
    { name: 'CreamCheese Purple Taro', cat: 'Milktea',  badge: '👑 #1 Best Seller',  rating: 5.0, ordered: '480+ ordered', img: 'public/images/Taro.jpeg',                prices: [{ size: '16oz', price: 29 }, { size: '22oz', price: 39 }] },
    { name: 'Caramel Macchiato',       cat: 'Iced Coffee', badge: '🔥 Top Coffee Pick', rating: 4.9, ordered: '390+ ordered', img: 'public/images/caramelmacchiato.jpg',      prices: [{ size: '16oz', price: 29 }, { size: '22oz', price: 39 }] },
    { name: 'Wintermelon Milk Tea',    cat: 'Milktea',  badge: '⭐ Crowd Favorite',  rating: 4.9, ordered: '340+ ordered', img: 'public/images/wintermelon.jpg',           prices: [{ size: '16oz', price: 29 }, { size: '22oz', price: 39 }] },
    { name: 'Matcha Green Tea',        cat: 'Milktea',  badge: '🍵 Japanese Classic', rating: 4.9, ordered: '290+ ordered', img: 'public/images/matcha.jpeg',               prices: [{ size: '16oz', price: 29 }, { size: '22oz', price: 39 }] },
    { name: 'Passion Fruit Tea',       cat: 'Fruit Tea', badge: '🌴 Refreshing',      rating: 4.8, ordered: '270+ ordered', img: 'public/images/passionfruit.jpg',          prices: [{ size: '16oz', price: 29 }, { size: '22oz', price: 39 }] },
    { name: 'Blueberry Burst Frappé',  cat: 'Frappé',   badge: '✨ Sweet Bliss',     rating: 4.9, ordered: '240+ ordered', img: 'public/images/blueberryburstfrappee.jpg', prices: [{ size: '16oz', price: 29 }, { size: '22oz', price: 39 }] },
    { name: 'Dark Chocolate',          cat: 'Milktea',  badge: '🍫 Choco Treat',     rating: 4.9, ordered: '285+ ordered', img: 'public/images/dark choco.jpg',            prices: [{ size: '16oz', price: 29 }, { size: '22oz', price: 39 }] },
    { name: 'Crispy French Fries',     cat: 'Snacks',   badge: '🍟 Perfect Match',   rating: 4.8, ordered: '350+ ordered', img: 'public/images/fries.jpeg',                prices: [{ size: 'Medium', price: 29 }, { size: 'Large', price: 39 }] }
];

const LP_CATEGORIES = [
    { id: 'milktea', name: 'Milktea',    count: '19 Flavors',  price: 'From ₱29', img: 'public/images/Taro.jpeg',                tag: 'Bestseller' },
    { id: 'coffee',  name: 'Iced Coffee', count: '6 Variants', price: 'From ₱29', img: 'public/images/caramelmacchiato.jpg',     tag: 'Daily Energy' },
    { id: 'fruit',   name: 'Fruit Tea',  count: '7 Flavors',   price: 'From ₱29', img: 'public/images/passionfruit.jpg',         tag: 'Refreshing' },
    { id: 'frappe',  name: 'Frappé',     count: '5 Flavors',   price: 'From ₱29', img: 'public/images/blueberryburstfrappee.jpg', tag: 'Cream-based' },
    { id: 'hot',     name: 'Hot Cups',   count: '6 Choices',   price: '₱35 Flat',  img: 'public/images/Hotcoffee.jpeg',           tag: 'Cozy Morning' },
    { id: 'snack',   name: 'Snacks',     count: 'Crispy Fries', price: 'From ₱29', img: 'public/images/fries.jpeg',               tag: 'Perfect Pair' }
];

let lpFeatureIndex = 0;
let lpFeatureSize = 0;
let lpFeatureTimer = null;
let lpHeroBgIndex = 0;
let lpHeroBgTimer = null;
let lpAddedName = '';

/** Spaces in filenames (e.g. "dark choco.jpg") must be percent-encoded. */
function lpImg(path) {
    return encodeURI(path);
}

function lpEscape(text) {
    return String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}


/* ---------- 0. Best-sellers marquee ---------- */

function lpRenderMarquee() {
    const track = document.getElementById('marquee-track');
    if (!track) return;

    // Three copies give a seamless loop (track travels exactly one third).
    let html = '';
    for (let copy = 0; copy < 3; copy++) {
        LP_BEST_SELLERS.forEach((item, i) => {
            const base = item.prices[0];
            const sizeLabel = item.prices.length > 1 ? item.prices.map(p => p.size).join(' / ') : 'Standard';
            html += `
                <div class="mq-card" data-lp-index="${i}" role="button" tabindex="0"
                     aria-label="Add ${lpEscape(item.name)} ${base.size} for ${base.price} pesos">
                    <span class="mq-thumb">
                        <img src="${lpImg(item.img)}" alt="${lpEscape(item.name)}" loading="lazy">
                        <span class="mq-rating">★ ${item.rating}</span>
                    </span>
                    <span class="mq-info">
                        <span class="mq-badge">${lpEscape(item.badge)}</span>
                        <span class="mq-name">${lpEscape(item.name)}</span>
                        <span class="mq-prices">
                            <span class="mq-price">₱${base.price}</span>
                            <span class="mq-size">${lpEscape(sizeLabel)}</span>
                        </span>
                    </span>
                    <button type="button" class="mq-add" data-lp-add="${i}">+ ₱${base.price}</button>
                </div>`;
        });
    }
    track.innerHTML = html;

    // Tap anywhere on a card (or its button) quick-adds the base size.
    track.addEventListener('click', (e) => {
        const card = e.target.closest('.mq-card');
        if (!card) return;
        const item = LP_BEST_SELLERS[Number(card.dataset.lpIndex)];
        if (item) lpQuickAdd(item, item.prices[0]);
    });
    track.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.mq-card');
        if (!card) return;
        e.preventDefault();
        const item = LP_BEST_SELLERS[Number(card.dataset.lpIndex)];
        if (item) lpQuickAdd(item, item.prices[0]);
    });
}


/* ---------- 1a. Hero background photo crossfade ---------- */

function lpRenderHeroBgs() {
    const wrap = document.getElementById('hero-bgs');
    if (!wrap) return;

    wrap.innerHTML = LP_HERO_BG.map((src, i) => `
        <span class="lp-hero-bg${i === 0 ? ' is-active' : ''}" style="background-image:url('${lpImg(src)}')"></span>
    `).join('');

    if (LP_HERO_BG.length < 2) return;
    lpHeroBgTimer = setInterval(() => {
        const slides = wrap.children;
        if (!slides.length) return;
        slides[lpHeroBgIndex].classList.remove('is-active');
        lpHeroBgIndex = (lpHeroBgIndex + 1) % slides.length;
        slides[lpHeroBgIndex].classList.add('is-active');
    }, 6000);
}


/* ---------- 1b. Featured best-seller slider ---------- */

function lpRenderFeatured() {
    const stage = document.getElementById('featured-stage');
    const dots = document.getElementById('featured-dots');
    const total = document.getElementById('featured-total');
    if (!stage || !dots) return;

    const item = LP_BEST_SELLERS[lpFeatureIndex];
    const priceObj = item.prices[lpFeatureSize] || item.prices[0];
    const isAdded = lpAddedName === item.name;

    stage.innerHTML = `
        <span class="lp-stage-media">
            <img src="${lpImg(item.img)}" alt="${lpEscape(item.name)}">
            <span class="lp-stage-scrim"></span>
            <span class="lp-stage-badge">✨ ${lpEscape(item.badge)}</span>
            <button type="button" class="lp-stage-preview" data-lp-preview>👁 Preview</button>
            <span class="lp-stage-foot">
                <span class="lp-stage-row">
                    <span class="lp-stage-cat">${lpEscape(item.cat)}</span>
                    <span class="lp-stage-rating">★ ${item.rating} (${item.ordered})</span>
                </span>
                <span class="lp-stage-name">${lpEscape(item.name)}</span>
                <span class="lp-stage-sizes">
                    ${item.prices.map((p, i) => `
                        <button type="button" class="lp-size-chip${i === lpFeatureSize ? ' is-active' : ''}"
                                data-lp-size="${i}">${p.size} ₱${p.price}</button>`).join('')}
                </span>
                <span class="lp-stage-row lp-stage-actions">
                    <span class="lp-stage-total">Total: ₱${priceObj.price}</span>
                    <button type="button" class="lp-stage-add${isAdded ? ' is-added' : ''}" data-lp-featured-add>
                        ${isAdded ? '✓ Added to Cart!' : '🛍 + Quick Add'}
                    </button>
                </span>
            </span>
        </span>`;

    const idxEl = document.getElementById('featured-index');
    const totalEl = document.getElementById('featured-total');
    if (idxEl) idxEl.textContent = lpFeatureIndex + 1;
    if (totalEl) totalEl.textContent = LP_BEST_SELLERS.length;

    dots.innerHTML = LP_BEST_SELLERS.map((_, i) => `
        <button type="button" class="lp-dot${i === lpFeatureIndex ? ' is-active' : ''}"
                data-lp-dot="${i}" role="tab" aria-selected="${i === lpFeatureIndex}"
                aria-label="Jump to slide ${i + 1}"></button>`).join('');
}

function lpGoFeature(index) {
    const n = LP_BEST_SELLERS.length;
    lpFeatureIndex = ((index % n) + n) % n;
    lpFeatureSize = 0;
    lpRenderFeatured();
    lpRestartFeatureTimer();
}

function lpRestartFeatureTimer() {
    if (lpFeatureTimer) clearInterval(lpFeatureTimer);
    lpFeatureTimer = setInterval(() => lpGoFeature(lpFeatureIndex + 1), 6000);
}

function lpSetFeatureSize(sizeIndex) {
    lpFeatureSize = sizeIndex;
    lpRenderFeatured();
}

function lpInitFeatured() {
    const stage = document.getElementById('featured-stage');
    if (!stage) return;

    lpRenderFeatured();
    lpRestartFeatureTimer();

    document.getElementById('featured-prev')
        ?.addEventListener('click', () => lpGoFeature(lpFeatureIndex - 1));
    document.getElementById('featured-next')
        ?.addEventListener('click', () => lpGoFeature(lpFeatureIndex + 1));

    stage.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-lp-size]');
        if (chip) return lpSetFeatureSize(Number(chip.dataset.lpSize));

        if (e.target.closest('[data-lp-preview]')) {
            const item = LP_BEST_SELLERS[lpFeatureIndex];
            return lpToast(`✨ ${item.name} — ${item.cat} · ★ ${item.rating} (${item.ordered})`);
        }
        if (e.target.closest('[data-lp-featured-add]')) {
            const item = LP_BEST_SELLERS[lpFeatureIndex];
            return lpQuickAdd(item, item.prices[lpFeatureSize] || item.prices[0]);
        }
        const media = e.target.closest('.lp-stage-media');
        if (media) {
            const item = LP_BEST_SELLERS[lpFeatureIndex];
            return lpToast(`✨ ${item.name} — ${item.cat} · ★ ${item.rating} (${item.ordered})`);
        }
    });

    document.getElementById('featured-dots')?.addEventListener('click', (e) => {
        const dot = e.target.closest('[data-lp-dot]');
        if (dot) lpGoFeature(Number(dot.dataset.lpDot));
    });

    // Hovering the card pauses the auto-advance (mirrors the React behaviour).
    const card = stage.closest('.lp-featured-card');
    card?.addEventListener('mouseenter', () => { if (lpFeatureTimer) clearInterval(lpFeatureTimer); });
    card?.addEventListener('mouseleave', lpRestartFeatureTimer);
}


/* ---------- Quick add + toast ---------- */

function lpQuickAdd(item, priceObj) {
    // Mirror addToCart(), but stay on the landing page instead of
    // jumping straight to the cart section.
    cart.push({ item: `${item.name} ${priceObj.size}`, price: priceObj.price, addons: [] });
    total += priceObj.price;
    renderCart();
    updatePearlButton();
    updateGenerateButton();

    lpAddedName = item.name;
    lpRenderFeatured();
    lpSyncCartBadge();
    lpToast(`✓ ${item.name} (${priceObj.size}) added — ₱${priceObj.price}`);
}

function lpSyncCartBadge() {
    const badge = document.getElementById('nav-cart-count');
    if (!badge) return;
    badge.textContent = cart.length;
    badge.hidden = cart.length === 0;
}

function lpToast(message) {
    let toast = document.getElementById('lp-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'lp-toast';
        toast.className = 'lp-toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}


/* ---------- 2. Category tiles ---------- */

function lpRenderCategories() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;

    grid.innerHTML = LP_CATEGORIES.map(cat => `
        <button type="button" class="lp-cat-card" data-lp-cat="${cat.id}">
            <span class="lp-cat-media">
                <img src="${lpImg(cat.img)}" alt="${lpEscape(cat.name)}" loading="lazy">
                <span class="lp-cat-scrim"></span>
                <span class="lp-cat-price">${lpEscape(cat.price)}</span>
            </span>
            <span class="lp-cat-body">
                <span class="lp-cat-name">${lpEscape(cat.name)}</span>
                <span class="lp-cat-count">${lpEscape(cat.count)}</span>
                <span class="lp-cat-tag">${lpEscape(cat.tag)}</span>
            </span>
        </button>`).join('');

    grid.addEventListener('click', (e) => {
        const card = e.target.closest('[data-lp-cat]');
        if (card) lpExploreCategory(card.dataset.lpCat);
    });
}

/** Jump to the menu section and scroll its heading into view. */
function lpExploreCategory(id) {
    const map = {
        milktea: 'milktea-sec', coffee: 'coffee-sec', fruit: 'fruit-sec',
        frappe: 'frappe-sec', hot: 'hot-sec', snack: 'snack-sec'
    };
    showSection('menu');
    const target = document.getElementById(map[id]);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
}


/* ---------- Theme toggle ---------- */

function lpApplyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
}

function lpInitTheme() {
    let stored = null;
    try { stored = localStorage.getItem('mbst-theme'); } catch (e) { /* storage blocked */ }
    lpApplyTheme(stored === 'light' ? 'light' : 'dark');

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        btn.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            lpApplyTheme(next);
            try { localStorage.setItem('mbst-theme', next); } catch (e) { /* ignore */ }
        });
    });
}


/* ---------- Nav: active state + mobile drawer ---------- */

function lpSyncNav(sectionId) {
    document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.nav === sectionId);
    });
}

function lpCloseDrawer() {
    const drawer = document.getElementById('nav-drawer');
    const burger = document.getElementById('nav-burger');
    if (drawer) drawer.hidden = true;
    if (burger) {
        burger.textContent = '☰';
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open navigation menu');
    }
}

function lpInitNav() {
    // Wrap showSection so the active pill and drawer stay in sync no matter
    // which caller (inline onclick or app.js internals) triggers it.
    const original = window.showSection;
    if (typeof original === 'function' && !window.showSection.__lpWrapped) {
        const wrapped = function (sectionId) {
            original.call(this, sectionId);
            lpSyncNav(sectionId);
            lpCloseDrawer();
        };
        wrapped.__lpWrapped = true;
        window.showSection = wrapped;
    }

    const burger = document.getElementById('nav-burger');
    const drawer = document.getElementById('nav-drawer');
    burger?.addEventListener('click', () => {
        const open = drawer.hidden;
        drawer.hidden = !open;
        burger.textContent = open ? '✕' : '☰';
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });

    // Close the drawer when a tap lands outside it.
    document.addEventListener('click', (e) => {
        if (!drawer || drawer.hidden) return;
        if (!e.target.closest('.site-nav')) lpCloseDrawer();
    });

    lpSyncNav('home');
}


/* ---------- Boot ---------- */

document.addEventListener('DOMContentLoaded', () => {
    // The legacy carousel markup is not present on this page, so stop the
    // empty 4.5s timer started above instead of letting it spin uselessly.
    if (!document.getElementById('carousel-track') && sliderTimer) {
        clearInterval(sliderTimer);
        sliderTimer = null;
    }

    lpInitTheme();
    lpInitNav();
    lpRenderMarquee();
    lpRenderHeroBgs();
    lpInitFeatured();
    lpRenderCategories();
    lpSyncCartBadge();
});

