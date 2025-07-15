// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        showMainApp();
    } else {
        document.getElementById('login-screen').style.display = 'block';
    }

    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Simple authentication (will be enhanced later)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('authToken', 'authenticated');
            showMainApp();
        } else {
            alert('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    });
});

function showMainApp() {
    document.getElementById('login-screen').style.display = 'none';
    const mainApp = document.getElementById('main-app');
    mainApp.style.display = 'block';
    
    // Load the main navigation
    mainApp.innerHTML = `
        <header class="app-header">
            <h1>نظام نقاط البيع والمحاسبة</h1>
            <nav class="main-nav">
                <button class="neumorphic-btn nav-btn" data-module="products">إدارة المنتجات</button>
                <button class="neumorphic-btn nav-btn" data-module="sales">المبيعات</button>
                <button class="neumorphic-btn nav-btn" data-module="customers">العملاء</button>
                <button class="neumorphic-btn nav-btn" data-module="reports">التقارير</button>
                <button class="neumorphic-btn nav-btn" data-module="settings">الإعدادات</button>
                <button class="neumorphic-btn nav-btn" id="logout-btn">تسجيل الخروج</button>
            </nav>
        </header>
        <main id="module-content" class="neumorphic-card">
            <!-- Module content will be loaded here -->
            <div class="welcome-message">
                <h2>مرحبًا بك في نظام نقاط البيع</h2>
                <p>الرجاء اختيار وحدة من القائمة أعلاه لبدء العمل</p>
            </div>
        </main>
    `;
    
    // Add event listeners to navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'logout-btn') {
                localStorage.removeItem('authToken');
                location.reload();
            } else {
                loadModule(btn.dataset.module);
            }
        });
    });
}

// Import modules
import { initProductsModule } from './modules/products.js';
import { initSalesModule } from './modules/sales.js';

function loadModule(moduleName) {
    const moduleContent = document.getElementById('module-content');
    moduleContent.innerHTML = '<div class="loading">جاري التحميل...</div>';
    
    // Clear previous module content and event listeners
    while (moduleContent.firstChild) {
        moduleContent.removeChild(moduleContent.firstChild);
    }
    
    // Load the requested module
    switch(moduleName) {
        case 'products':
            initProductsModule();
            break;
        case 'sales':
            initSalesModule();
            break;
        case 'customers':
            moduleContent.innerHTML = '<h2>إدارة العملاء</h2><p>وحدة إدارة العملاء قيد التطوير...</p>';
            break;
        case 'reports':
            moduleContent.innerHTML = '<h2>التقارير</h2><p>وحدة التقارير قيد التطوير...</p>';
            break;
        case 'settings':
            moduleContent.innerHTML = '<h2>الإعدادات</h2><p>وحدة الإعدادات قيد التطوير...</p>';
            break;
        default:
            moduleContent.innerHTML = '<h2>الوحدة المطلوبة غير متوفرة</h2>';
    }
}

// Core data management functions
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}