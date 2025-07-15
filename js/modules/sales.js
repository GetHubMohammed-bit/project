// Sales Processing Module
const CART_KEY = 'pos_cart';

function initSalesModule() {
    renderSalesUI();
    setupSalesEventListeners();
    loadCart();
}

function renderSalesUI() {
    const moduleContent = document.getElementById('module-content');
    moduleContent.innerHTML = `
        <div class="sales-container">
            <div class="product-grid">
                <h3>قائمة المنتجات</h3>
                <div class="search-bar">
                    <input type="text" id="sales-search" placeholder="ابحث عن منتج أو باركود">
                    <button id="scan-barcode" class="neumorphic-btn small">
                        <i class="bi bi-upc-scan"></i> مسح باركود
                    </button>
                </div>
                <div id="sales-products" class="products-grid">
                    <!-- Products will be loaded here -->
                </div>
            </div>
            
            <div class="cart-section">
                <h3>سلة المشتريات</h3>
                <div id="cart-items" class="cart-items">
                    <!-- Cart items will be listed here -->
                </div>
                
                <div class="cart-summary neumorphic-card">
                    <div class="summary-row">
                        <span>الإجمالي:</span>
                        <span id="cart-total">0.00 ريال</span>
                    </div>
                    <div class="summary-row">
                        <span>الضريبة (15%):</span>
                        <span id="cart-tax">0.00 ريال</span>
                    </div>
                    <div class="summary-row total">
                        <span>المبلغ النهائي:</span>
                        <span id="cart-grand-total">0.00 ريال</span>
                    </div>
                    
                    <div class="customer-section">
                        <label for="customer-select">العميل:</label>
                        <select id="customer-select">
                            <option value="">عميل نقدي</option>
                        </select>
                    </div>
                    
                    <div class="payment-actions">
                        <button id="complete-sale" class="neumorphic-btn primary">إتمام البيع</button>
                        <button id="hold-sale" class="neumorphic-btn">حفظ كمسودة</button>
                        <button id="clear-cart" class="neumorphic-btn danger">تفريغ السلة</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadProductsForSale();
    loadCustomers();
}

function setupSalesEventListeners() {
    // Search functionality
    document.getElementById('sales-search').addEventListener('input', (e) => {
        filterProductsForSale(e.target.value);
    });
    
    // Barcode scan simulation
    document.getElementById('scan-barcode').addEventListener('click', () => {
        const barcode = prompt('أدخل رقم الباركود أو مرره على القارئ:');
        if (barcode) {
            addProductByBarcode(barcode);
        }
    });
    
    // Complete sale
    document.getElementById('complete-sale').addEventListener('click', completeSale);
    
    // Hold sale
    document.getElementById('hold-sale').addEventListener('click', () => {
        saveCart();
        alert('تم حفظ عملية البيع كمسودة');
    });
    
    // Clear cart
    document.getElementById('clear-cart').addEventListener('click', () => {
        if (confirm('هل تريد تفريغ سلة المشتريات؟')) {
            clearCart();
        }
    });
}

function loadProductsForSale() {
    const products = getProducts();
    const productsGrid = document.getElementById('sales-products');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="empty-message">لا توجد منتجات مسجلة</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card neumorphic-card" data-id="${product.id}">
            <div class="product-card-body">
                <h4>${product.name}</h4>
                <p>${product.price.toFixed(2)} ريال</p>
                <p class="stock">المخزون: ${product.quantity}</p>
            </div>
            <button class="add-to-cart neumorphic-btn small">
                <i class="bi bi-cart-plus"></i> إضافة
            </button>
        </div>
    `).join('');
    
    // Add event listeners to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.querySelector('.add-to-cart').addEventListener('click', () => {
            const productId = card.dataset.id;
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('المنتج غير موجود');
        return;
    }
    
    if (product.quantity <= 0) {
        alert('لا يوجد مخزون كافي من هذا المنتج');
        return;
    }
    
    const cart = getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    updateCartDisplay();
}

function addProductByBarcode(barcode) {
    const products = getProducts();
    const product = products.find(p => p.barcode === barcode);
    
    if (product) {
        addToCart(product.id);
    } else {
        alert('لم يتم العثور على منتج بهذا الباركود');
    }
}

function getCart() {
    const cartJSON = localStorage.getItem(CART_KEY);
    return cartJSON ? JSON.parse(cartJSON) : [];
}

function saveCart(cart = []) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadCart() {
    updateCartDisplay();
}

function updateCartDisplay() {
    const cart = getCart();
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartTax = document.getElementById('cart-tax');
    const cartGrandTotal = document.getElementById('cart-grand-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-message">السلة فارغة</p>';
        cartTotal.textContent = '0.00 ريال';
        cartTax.textContent = '0.00 ريال';
        cartGrandTotal.textContent = '0.00 ريال';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.productId}">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toFixed(2)} ريال × ${item.quantity}</p>
            </div>
            <div class="item-actions">
                <button class="quantity-btn minus" data-id="${item.productId}">
                    <i class="bi bi-dash"></i>
                </button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.productId}">
                    <i class="bi bi-plus"></i>
                </button>
                <button class="remove-btn" data-id="${item.productId}">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.15; // 15% VAT
    const grandTotal = subtotal + tax;
    
    cartTotal.textContent = subtotal.toFixed(2) + ' ريال';
    cartTax.textContent = tax.toFixed(2) + ' ريال';
    cartGrandTotal.textContent = grandTotal.toFixed(2) + ' ريال';
    
    // Add event listeners to cart buttons
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.id;
            updateCartItemQuantity(productId, 1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.id;
            updateCartItemQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.id;
            removeFromCart(productId);
        });
    });
}

function updateCartItemQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart(cart);
        updateCartDisplay();
    }
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => item.productId !== productId);
    saveCart(cart);
    updateCartDisplay();
}

function clearCart() {
    saveCart([]);
    updateCartDisplay();
}

function completeSale() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('السلة فارغة، لا يمكن إتمام البيع');
        return;
    }
    
    const customerId = document.getElementById('customer-select').value;
    
    // Generate invoice
    const invoice = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        customerId,
        items: cart,
        subtotal: parseFloat(document.getElementById('cart-total').textContent),
        tax: parseFloat(document.getElementById('cart-tax').textContent),
        total: parseFloat(document.getElementById('cart-grand-total').textContent)
    };
    
    // Save invoice
    saveInvoice(invoice);
    
    // Update product quantities
    updateProductQuantities(cart);
    
    // Clear cart
    clearCart();
    
    // Show success message
    alert(`تم إتمام عملية البيع بنجاح! رقم الفاتورة: ${invoice.id}`);
    
    // Print invoice
    printInvoice(invoice);
}

function saveInvoice(invoice) {
    const invoices = getInvoices();
    invoices.push(invoice);
    localStorage.setItem('pos_invoices', JSON.stringify(invoices));
}

function getInvoices() {
    const invoicesJSON = localStorage.getItem('pos_invoices');
    return invoicesJSON ? JSON.parse(invoicesJSON) : [];
}

function updateProductQuantities(cart) {
    const products = getProducts();
    
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
            product.quantity -= cartItem.quantity;
        }
    });
    
    localStorage.setItem('pos_products', JSON.stringify(products));
}

function printInvoice(invoice) {
    // In a real implementation, this would open a print dialog with formatted invoice
    alert(`طباعة الفاتورة ${invoice.id}...`);
    // For now, we'll just log it
    console.log('Invoice:', invoice);
}

function loadCustomers() {
    // In a real implementation, this would load from localStorage
    const customerSelect = document.getElementById('customer-select');
    customerSelect.innerHTML = '<option value="">عميل نقدي</option>';
    
    // Sample customers
    const customers = [
        {id: '1', name: 'عميل دائم'},
        {id: '2', name: 'شركة التقنية الحديثة'}
    ];
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        customerSelect.appendChild(option);
    });
}

// Helper functions
function getProducts() {
    const productsJSON = localStorage.getItem('pos_products');
    return productsJSON ? JSON.parse(productsJSON) : [];
}

function filterProductsForSale(searchTerm) {
    const products = getProducts();
    const filtered = products.filter(product => 
        product.name.includes(searchTerm) || 
        (product.barcode && product.barcode.includes(searchTerm))
    );
    
    const productsGrid = document.getElementById('sales-products');
    productsGrid.innerHTML = filtered.map(product => `
        <div class="product-card neumorphic-card" data-id="${product.id}">
            <div class="product-card-body">
                <h4>${product.name}</h4>
                <p>${product.price.toFixed(2)} ريال</p>
                <p class="stock">المخزون: ${product.quantity}</p>
            </div>
            <button class="add-to-cart neumorphic-btn small">
                <i class="bi bi-cart-plus"></i> إضافة
            </button>
        </div>
    `).join('');
    
    // Reattach event listeners
    document.querySelectorAll('.product-card').forEach(card => {
        card.querySelector('.add-to-cart').addEventListener('click', () => {
            const productId = card.dataset.id;
            addToCart(productId);
        });
    });
}