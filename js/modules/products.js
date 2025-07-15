// Product Management Module
const PRODUCTS_KEY = 'pos_products';

function initProductsModule() {
    renderProductsUI();
    setupProductEventListeners();
}

function renderProductsUI() {
    const moduleContent = document.getElementById('module-content');
    moduleContent.innerHTML = `
        <div class="module-header">
            <h2>إدارة المنتجات</h2>
            <button id="add-product-btn" class="neumorphic-btn">
                <i class="bi bi-plus-lg"></i> إضافة منتج جديد
            </button>
        </div>
        
        <div class="search-bar">
            <input type="text" id="product-search" placeholder="ابحث عن منتج...">
            <select id="category-filter">
                <option value="">جميع الفئات</option>
            </select>
        </div>
        
        <div id="product-form-container" style="display:none;">
            <h3 id="form-title">إضافة منتج جديد</h3>
            <form id="product-form" class="neumorphic-form">
                <input type="hidden" id="product-id">
                <div class="form-row">
                    <div class="form-group">
                        <label for="product-name">اسم المنتج:</label>
                        <input type="text" id="product-name" required>
                    </div>
                    <div class="form-group">
                        <label for="product-price">السعر (ريال):</label>
                        <input type="number" id="product-price" min="0" step="0.01" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="product-quantity">الكمية المتاحة:</label>
                        <input type="number" id="product-quantity" min="0" required>
                    </div>
                    <div class="form-group">
                        <label for="product-barcode">الباركود:</label>
                        <input type="text" id="product-barcode">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="product-category">الفئة:</label>
                        <select id="product-category" required>
                            <option value="">اختر فئة</option>
                        </select>
                        <button type="button" id="add-category-btn" class="neumorphic-btn small">
                            <i class="bi bi-plus"></i> فئة جديدة
                        </button>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" id="cancel-product-btn" class="neumorphic-btn">إلغاء</button>
                    <button type="submit" class="neumorphic-btn primary">حفظ</button>
                </div>
            </form>
        </div>
        
        <div id="products-list" class="items-list">
            <!-- Products will be listed here -->
        </div>
    `;
    
    loadCategories();
    loadProducts();
}

function setupProductEventListeners() {
    // Add new product button
    document.getElementById('add-product-btn').addEventListener('click', () => {
        showProductForm();
    });
    
    // Product form submission
    document.getElementById('product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });
    
    // Cancel button
    document.getElementById('cancel-product-btn').addEventListener('click', () => {
        hideProductForm();
    });
    
    // Add new category button
    document.getElementById('add-category-btn').addEventListener('click', () => {
        const newCategory = prompt('أدخل اسم الفئة الجديدة:');
        if (newCategory) {
            addCategory(newCategory);
        }
    });
    
    // Search functionality
    document.getElementById('product-search').addEventListener('input', (e) => {
        filterProducts(e.target.value);
    });
    
    // Category filter
    document.getElementById('category-filter').addEventListener('change', (e) => {
        filterProductsByCategory(e.target.value);
    });
}

function showProductForm(product = null) {
    const formContainer = document.getElementById('product-form-container');
    const formTitle = document.getElementById('form-title');
    const form = document.getElementById('product-form');
    
    formContainer.style.display = 'block';
    form.reset();
    document.getElementById('product-id').value = '';
    
    if (product) {
        formTitle.textContent = 'تعديل المنتج';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-quantity').value = product.quantity;
        document.getElementById('product-barcode').value = product.barcode || '';
        document.getElementById('product-category').value = product.category;
    } else {
        formTitle.textContent = 'إضافة منتج جديد';
    }
}

function hideProductForm() {
    document.getElementById('product-form-container').style.display = 'none';
}

function saveProduct() {
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const barcode = document.getElementById('product-barcode').value;
    const category = document.getElementById('product-category').value;
    
    if (!name || isNaN(price) || isNaN(quantity) || !category) {
        alert('الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const products = getProducts();
    const newProduct = {
        id: productId || Date.now().toString(),
        name,
        price,
        quantity,
        barcode,
        category,
        createdAt: new Date().toISOString()
    };
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = newProduct;
        }
    } else {
        // Add new product
        products.push(newProduct);
    }
    
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    hideProductForm();
    loadProducts();
    alert('تم حفظ المنتج بنجاح');
}

function getProducts() {
    const productsJSON = localStorage.getItem(PRODUCTS_KEY);
    return productsJSON ? JSON.parse(productsJSON) : [];
}

function loadProducts() {
    const products = getProducts();
    const productsList = document.getElementById('products-list');
    
    if (products.length === 0) {
        productsList.innerHTML = '<p class="empty-message">لا توجد منتجات مسجلة</p>';
        return;
    }
    
    productsList.innerHTML = products.map(product => `
        <div class="product-item neumorphic-card">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>السعر: ${product.price.toFixed(2)} ريال</p>
                <p>الكمية: ${product.quantity}</p>
                <p>الفئة: ${product.category}</p>
                ${product.barcode ? `<p>الباركود: ${product.barcode}</p>` : ''}
            </div>
            <div class="product-actions">
                <button class="neumorphic-btn small edit-btn" data-id="${product.id}">
                    <i class="bi bi-pencil"></i> تعديل
                </button>
                <button class="neumorphic-btn small delete-btn" data-id="${product.id}">
                    <i class="bi bi-trash"></i> حذف
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.id;
            const product = products.find(p => p.id === productId);
            if (product) showProductForm(product);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.id;
            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                deleteProduct(productId);
            }
        });
    });
}

function deleteProduct(productId) {
    const products = getProducts().filter(p => p.id !== productId);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    loadProducts();
    alert('تم حذف المنتج بنجاح');
}

function filterProducts(searchTerm) {
    const products = getProducts();
    const filtered = products.filter(product => 
        product.name.includes(searchTerm) || 
        (product.barcode && product.barcode.includes(searchTerm))
    );
    renderProductList(filtered);
}

function filterProductsByCategory(categoryId) {
    const products = getProducts();
    const filtered = categoryId ? 
        products.filter(product => product.category === categoryId) : 
        products;
    renderProductList(filtered);
}

function renderProductList(products) {
    const productsList = document.getElementById('products-list');
    
    if (products.length === 0) {
        productsList.innerHTML = '<p class="empty-message">لا توجد منتجات تطابق معايير البحث</p>';
        return;
    }
    
    productsList.innerHTML = products.map(product => `
        <div class="product-item neumorphic-card">
            <!-- Same product item structure as in loadProducts -->
        </div>
    `).join('');
}

// Category management
const CATEGORIES_KEY = 'pos_categories';

function loadCategories() {
    const categories = getCategories();
    const categorySelect = document.getElementById('product-category');
    const filterSelect = document.getElementById('category-filter');
    
    // Clear existing options except the first one
    categorySelect.innerHTML = '<option value="">اختر فئة</option>';
    filterSelect.innerHTML = '<option value="">جميع الفئات</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
        
        const filterOption = document.createElement('option');
        filterOption.value = category;
        filterOption.textContent = category;
        filterSelect.appendChild(filterOption);
    });
}

function getCategories() {
    const categoriesJSON = localStorage.getItem(CATEGORIES_KEY);
    return categoriesJSON ? JSON.parse(categoriesJSON) : ['أجهزة', 'ملابس', 'أطعمة'];
}

function addCategory(categoryName) {
    if (!categoryName) return;
    
    const categories = getCategories();
    if (!categories.includes(categoryName)) {
        categories.push(categoryName);
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
        loadCategories();
    }
}