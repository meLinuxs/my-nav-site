<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>𝙄𝙆𝙐𝙉导航站</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <style>
        /* Base font styles */
        html[lang="zh-CN"] body { font-family: 'Inter', 'Helvetica Neue', 'Hiragino Sans GB', 'WenQuanYi Micro Hei', 'Microsoft Yahei', sans-serif; }
        body { font-family: 'Inter', sans-serif; transition: background-color 0.5s ease-in-out, color 0.5s ease-in-out; }
        
        /* UI element styles */
        .backdrop-blur-md { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .modal { display: none; }
        .modal.active { display: flex; }
        .icon-preview { width: 32px; height: 32px; object-fit: contain; border-radius: 6px; }

        /* Sakura Canvas Effect */
        #sakura-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        }

        /* Light Mode Theme */
        .light-mode {
            --bg-color: #f3f4f6;
            --text-color: #1f2937;
            --ui-bg: rgba(255, 255, 255, 0.4); /* Your custom opacity */
            --ui-border: #e5e7eb;
            --input-bg: #e5e7eb;
            --input-text: #111827;
            --hover-bg: #d1d5db;
            --modal-bg: #ffffff;
            --panel-bg: #f9fafb;
            --card-bg: rgba(255, 255, 255, 0.4);
            --card-hover-bg: rgba(255, 255, 255, 0.8);
            --text-muted: #6b7280;
        }

        body.light-mode { background-color: var(--bg-color); color: var(--text-color); }
        .light-mode .bg-black.bg-opacity-10 { background-color: var(--ui-bg); border-bottom: 1px solid var(--ui-border); }
        .light-mode .bg-gray-700 { background-color: var(--input-bg); }
        .light-mode .text-gray-400 { color: var(--text-muted); }
        .light-mode input, .light-mode select, .light-mode textarea { color: var(--input-text); }
        .light-mode .hover\:bg-gray-700:hover { background-color: var(--hover-bg); }
        .light-mode .bg-gray-800 { background-color: var(--modal-bg); }
        .light-mode .bg-gray-900 { background-color: var(--panel-bg); }
        .light-mode .bg-black.bg-opacity-20 { background-color: var(--card-bg); } /* Updated for your card opacity */
        .light-mode .hover\:bg-opacity-60:hover { background-color: var(--card-hover-bg); }
        
        /* Drag-and-drop styles */
        .sortable-ghost { opacity: 0.4; background: #4a5568; }
        .sortable-chosen { background: #2d3748; }
        .drag-handle { cursor: grab; }
        .drag-handle:active { cursor: grabbing; }
        .light-mode .sortable-ghost { background: #cbd5e1; }
        .light-mode .sortable-chosen { background: #e5e7eb; }

        /* Styles for collapsible desktop sidebar */
        #app-container.sidebar-collapsed #sidebar {
            width: 0;
            padding-left: 0;
            padding-right: 0;
            overflow: hidden;
            transform: translateX(-100%);
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    
    <canvas id="sakura-canvas"></canvas>

    <div id="app-container" class="flex h-screen">
        <aside id="sidebar" class="bg-black bg-opacity-10 backdrop-blur-md w-64 p-6 hidden md:flex flex-col flex-shrink-0 transition-all duration-300">
            <h1 class="text-2xl font-bold mb-8 text-center" data-i18n-key="navMenu">Navigation Menu</h1>
            <nav id="sidebar-nav" class="flex-grow space-y-2"></nav>
        </aside>

        <main class="flex-1 flex flex-col overflow-hidden">
            <header class="bg-black bg-opacity-10 backdrop-blur-md shadow-lg p-4 flex items-center justify-between">
                <div class="flex items-center">
                    <button id="mobile-menu-toggle" class="md:hidden mr-4 p-2 rounded-md hover:bg-gray-700"><i data-lucide="menu"></i></button>
                    <button id="desktop-sidebar-toggle" class="hidden md:flex mr-4 p-2 rounded-md hover:bg-gray-700">
                        <i data-lucide="panel-left-close" id="desktop-sidebar-icon"></i>
                    </button>
                    <div class="relative w-full max-w-xs">
                        <input type="text" id="search-input" data-i18n-key="searchPlaceholder" placeholder="Search sites..." class="bg-gray-700 border border-gray-600 rounded-full py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3"><i data-lucide="search" class="text-gray-400"></i></div>
                    </div>
                </div>
                <nav id="topbar-nav" class="hidden lg:flex items-center space-x-4"></nav>
                <div class="flex items-center space-x-2">
                    <button id="theme-switcher" class="p-2 rounded-md hover:bg-gray-700">
                        <i data-lucide="sun" class="theme-icon-sun"></i>
                        <i data-lucide="moon" class="theme-icon-moon hidden"></i>
                    </button>
                    <button id="lang-switcher" class="p-2 rounded-md hover:bg-gray-700 font-semibold text-sm">EN / 中</button>
                    <button id="admin-login-btn" class="p-2 rounded-md hover:bg-gray-700"><i data-lucide="settings"></i></button>
                </div>
            </header>
            <div id="content-grid" class="flex-1 p-8 overflow-y-auto"></div>
        </main>
    </div>

    <div id="mobile-sidebar-container" class="fixed inset-0 bg-black bg-opacity-50 z-40 hidden" onclick="toggleMobileSidebar()"></div>
    <div id="mobile-sidebar" class="fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg p-6 transform -translate-x-full transition-transform duration-300 ease-in-out z-50">
         <button id="mobile-sidebar-close" class="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-700">
            <i data-lucide="x"></i>
         </button>
         <h1 class="text-2xl font-bold mb-8 text-center" data-i18n-key="navMenu">Navigation Menu</h1>
         <nav id="mobile-sidebar-nav" class="flex-grow space-y-2"></nav>
    </div>

    <div id="admin-modal" class="modal fixed inset-0 bg-black bg-opacity-70 items-center justify-center p-4 z-50">
        <div id="admin-login-view" class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 class="text-2xl font-bold mb-6 text-center" data-i18n-key="adminLogin">Admin Login</h2>
            <form id="login-form">
                <input type="password" id="password-input" data-i18n-key="passwordPlaceholder" placeholder="Enter admin password" class="w-full bg-gray-700 border border-gray-600 rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 rounded-md p-3 font-semibold transition-colors" data-i18n-key="login">Login</button>
            </form>
            <p id="login-error" class="text-red-500 text-center mt-4"></p>
        </div>
        <div id="admin-panel-view" class="hidden bg-gray-800 rounded-lg p-4 md:p-8 w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold" data-i18n-key="adminPanel">Admin Panel</h2>
                <button id="admin-logout-btn" class="p-2 rounded-md hover:bg-gray-700"><i data-lucide="x"></i></button>
            </div>
            <div class="flex-grow overflow-y-auto pr-4">
                <div class="bg-gray-900 p-6 rounded-lg mb-6">
                    <h3 class="text-xl font-semibold mb-4" data-i18n-key="globalSettings">Global Settings</h3>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <input type="text" id="background-url-input" data-i18n-key="backgroundPlaceholder" placeholder="Enter background image URL" class="w-full flex-grow bg-gray-700 border border-gray-600 rounded-md p-2">
                        <button id="save-background-btn" class="w-full sm:w-auto flex-shrink-0 bg-green-600 hover:bg-green-700 rounded-md py-2 px-4 font-semibold" data-i18n-key="saveBackground">Save Background</button>
                    </div>
                </div>
                <div class="bg-gray-900 p-6 rounded-lg mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold" data-i18n-key="categoryManagement">Category Management</h3>
                        <button id="save-order-btn" class="bg-purple-600 hover:bg-purple-700 rounded-md py-1 px-3 text-sm font-semibold hidden" data-i18n-key="saveOrder">Save Order</button>
                    </div>
                    <form id="add-category-form" class="flex flex-col sm:flex-row gap-2 mb-4">
                        <input type="text" id="category-name-input" data-i18n-key="newCategoryPlaceholder" placeholder="New category name" class="w-full flex-grow bg-gray-700 border border-gray-600 rounded-md p-2" required>
                        <select id="category-type-select" class="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-md p-2">
                            <option value="sidebar" data-i18n-key="sidebar">Sidebar</option>
                            <option value="topbar" data-i18n-key="topbar">Topbar</option>
                        </select>
                        <button type="submit" class="w-full sm:w-auto flex-shrink-0 bg-blue-600 hover:bg-blue-700 p-2 rounded-md"><i data-lucide="plus"></i></button>
                    </form>
                    <div id="categories-list" class="space-y-2"></div>
                </div>
                <div class="bg-gray-900 p-6 rounded-lg">
                    <h3 id="site-form-title" class="text-xl font-semibold mb-4" data-i18n-key="siteManagement">Site Management</h3>
                    <form id="site-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-6 p-4 bg-gray-800 rounded-lg">
                        <select id="site-category-select" class="bg-gray-700 border border-gray-600 rounded-md p-2" required><option value="" data-i18n-key="selectCategory">Select a category</option></select>
                        <input type="text" id="site-name-input" data-i18n-key="siteNamePlaceholder" placeholder="Site Name" class="bg-gray-700 rounded-md p-2" required>
                        <input type="url" id="site-url-input" data-i18n-key="siteUrlPlaceholder" placeholder="Site URL" class="bg-gray-700 rounded-md p-2" required>
                        <div class="flex items-center space-x-2">
                           <input type="text" id="site-icon-input" data-i18n-key="iconUrlPlaceholder" placeholder="Icon URL (optional)" class="flex-grow bg-gray-700 rounded-md p-2">
                           <img id="icon-preview" src="https://placehold.co/32x32/777/eee?text=?" alt="Icon Preview" class="icon-preview">
                        </div>
                        <textarea id="site-desc-input" data-i18n-key="siteDescPlaceholder" placeholder="Site Description" class="bg-gray-700 rounded-md p-2 md:col-span-2 lg:col-span-3" rows="2"></textarea>
                        <div class="flex items-center gap-2 md:col-start-4">
                            <button type="button" id="cancel-edit-btn" class="w-full bg-gray-600 hover:bg-gray-700 rounded-md py-2 px-4 font-semibold hidden" data-i18n-key="cancel">Cancel</button>
                            <button type="submit" id="site-submit-btn" class="w-full bg-blue-600 hover:bg-blue-700 rounded-md py-2 px-4 font-semibold" data-i18n-key="addSite">Add Site</button>
                        </div>
                    </form>
                    <div id="sites-list-admin" class="space-y-4"></div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="generic-modal" class="modal fixed inset-0 bg-black bg-opacity-70 items-center justify-center p-4 z-50">
        <div class="bg-gray-800 rounded-lg p-8 w-full max-w-sm text-center shadow-2xl">
            <p id="generic-modal-text" class="mb-6 text-lg"></p>
            <div id="generic-modal-buttons" class="flex justify-center space-x-4"></div>
        </div>
    </div>

    <script type="module">
        // --- i18n Translations ---
        const translations = {
            en: {
                navMenu: "Navigation Menu", searchPlaceholder: "Search sites...", adminLogin: "Admin Login", passwordPlaceholder: "Enter admin password", login: "Login", adminPanel: "Admin Panel", globalSettings: "Global Settings", backgroundPlaceholder: "Enter background image URL", saveBackground: "Save Background", categoryManagement: "Category Management", newCategoryPlaceholder: "New category name", sidebar: "Sidebar", topbar: "Topbar", siteManagement: "Site Management", selectCategory: "Select a category", siteNamePlaceholder: "Site Name", siteUrlPlaceholder: "Site URL", iconUrlPlaceholder: "Icon URL (optional)", siteDescPlaceholder: "Site Description", addSite: "Add Site", allSites: "All Sites", noSitesFound: "No sites found.", passwordIncorrect: "Incorrect password, please try again.", backgroundSaved: "Background saved successfully!", backgroundSaveFailed: "Failed to save background.", fillRequiredFields: "Please fill in all required fields.", confirmCategoryDeletion: "Are you sure you want to delete this category? All associated sites will also be deleted.", confirmSiteDeletion: "Are you sure you want to delete this site?", dataLoadFailed: "Failed to load data. Please check the browser console (F12) for more details and ensure the backend API is running correctly.", modalOk: "OK", modalCancel: "Cancel", modalConfirm: "Confirm", saveOrder: "Save Order", orderSaved: "Order saved successfully!", editSite: "Edit Site", saveChanges: "Save Changes", siteUpdated: "Site updated successfully!"
            },
            zh: {
                navMenu: "导航菜单", searchPlaceholder: "搜索网站...", adminLogin: "管理员登录", passwordPlaceholder: "请输入管理密码", login: "登录", adminPanel: "管理面板", globalSettings: "全局设置", backgroundPlaceholder: "输入背景图片 URL", saveBackground: "保存背景", categoryManagement: "分类管理", newCategoryPlaceholder: "新分类名称", sidebar: "侧边栏", topbar: "顶部栏", siteManagement: "网站管理", selectCategory: "选择一个分类", siteNamePlaceholder: "网站名称", siteUrlPlaceholder: "网站 URL", iconUrlPlaceholder: "图标 URL (可选)", siteDescPlaceholder: "网站简介", addSite: "添加网站", allSites: "所有网站", noSitesFound: "没有找到网站。", passwordIncorrect: "密码错误，请重试。", backgroundSaved: "背景已保存！", backgroundSaveFailed: "背景保存失败。", fillRequiredFields: "请填写所有必填字段。", confirmCategoryDeletion: "确定要删除这个分类吗？其下的所有网站也会被一并删除。", confirmSiteDeletion: "确定要删除这个网站吗？", dataLoadFailed: "数据加载失败。请按 F12 查看浏览器控制台获取更多信息，并确保后端 API 运行正常。", modalOk: "好的", modalCancel: "取消", modalConfirm: "确定", saveOrder: "保存顺序", orderSaved: "顺序已保存！", editSite: "编辑网站", saveChanges: "保存更改", siteUpdated: "网站已成功更新！"
            }
        };

        // --- Global State and Configuration ---
        const ADMIN_PASSWORD = "password123";
        let state = {
            categories: [], sites: [], selectedCategory: 'all', isLoggedIn: false, currentLanguage: 'zh', currentTheme: 'dark', editingSiteId: null
        };

        // --- DOM Elements Cache ---
        const DOMElements = {
            html: document.documentElement,
            body: document.body,
            appContainer: document.getElementById('app-container'),
            sidebarNav: document.getElementById('sidebar-nav'),
            mobileSidebarNav: document.getElementById('mobile-sidebar-nav'),
            topbarNav: document.getElementById('topbar-nav'),
            contentGrid: document.getElementById('content-grid'),
            searchInput: document.getElementById('search-input'),
            adminLoginBtn: document.getElementById('admin-login-btn'),
            langSwitcher: document.getElementById('lang-switcher'),
            themeSwitcher: document.getElementById('theme-switcher'),
            adminModal: document.getElementById('admin-modal'),
            adminLoginView: document.getElementById('admin-login-view'),
            adminPanelView: document.getElementById('admin-panel-view'),
            loginForm: document.getElementById('login-form'),
            passwordInput: document.getElementById('password-input'),
            loginError: document.getElementById('login-error'),
            adminLogoutBtn: document.getElementById('admin-logout-btn'),
            backgroundUrlInput: document.getElementById('background-url-input'),
            saveBackgroundBtn: document.getElementById('save-background-btn'),
            addCategoryForm: document.getElementById('add-category-form'),
            categoryNameInput: document.getElementById('category-name-input'),
            categoryTypeSelect: document.getElementById('category-type-select'),
            categoriesList: document.getElementById('categories-list'),
            saveOrderBtn: document.getElementById('save-order-btn'),
            siteForm: document.getElementById('site-form'),
            siteFormTitle: document.getElementById('site-form-title'),
            siteCategorySelect: document.getElementById('site-category-select'),
            siteNameInput: document.getElementById('site-name-input'),
            siteUrlInput: document.getElementById('site-url-input'),
            siteIconInput: document.getElementById('site-icon-input'),
            siteDescInput: document.getElementById('site-desc-input'),
            siteSubmitBtn: document.getElementById('site-submit-btn'),
            cancelEditBtn: document.getElementById('cancel-edit-btn'),
            sitesListAdmin: document.getElementById('sites-list-admin'),
            iconPreview: document.getElementById('icon-preview'),
            mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
            desktopSidebarToggle: document.getElementById('desktop-sidebar-toggle'),
            desktopSidebarIcon: document.getElementById('desktop-sidebar-icon'),
            mobileSidebar: document.getElementById('mobile-sidebar'),
            mobileSidebarClose: document.getElementById('mobile-sidebar-close'),
            mobileSidebarContainer: document.getElementById('mobile-sidebar-container'),
            genericModal: document.getElementById('generic-modal'),
            genericModalText: document.getElementById('generic-modal-text'),
            genericModalButtons: document.getElementById('generic-modal-buttons'),
        };

        // --- API Client ---
        const api = {
            get: (endpoint) => fetch(`${window.location.origin}/api/${endpoint}`).then(async res => {
                if (res.ok) return res.json();
                const errorDetails = await res.text().catch(() => 'Could not read error body.');
                return Promise.reject({ status: res.status, statusText: res.statusText, body: errorDetails });
            }),
            post: (endpoint, body) => fetch(`${window.location.origin}/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }).then(async res => {
                if (res.ok) return res.json();
                const errorDetails = await res.text().catch(() => 'Could not read error body.');
                return Promise.reject({ status: res.status, statusText: res.statusText, body: errorDetails });
            }),
            put: (endpoint, body) => fetch(`${window.location.origin}/api/${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }).then(async res => {
                if (res.ok) return res.json();
                const errorDetails = await res.text().catch(() => 'Could not read error body.');
                return Promise.reject({ status: res.status, statusText: res.statusText, body: errorDetails });
            }),
            delete: (endpoint) => fetch(`${window.location.origin}/api/${endpoint}`, { method: 'DELETE' }).then(async res => {
                if (res.ok) return res.json();
                const errorDetails = await res.text().catch(() => 'Could not read error body.');
                return Promise.reject({ status: res.status, statusText: res.statusText, body: errorDetails });
            }),
        };
        
        // --- UI Functions ---
        function setLanguage(lang) {
            state.currentLanguage = lang;
            localStorage.setItem('lang', lang);
            DOMElements.html.lang = lang === 'zh' ? 'zh-CN' : 'en';
            document.querySelectorAll('[data-i18n-key]').forEach(el => {
                const key = el.getAttribute('data-i18n-key');
                const translation = translations[lang][key];
                if (translation) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        el.placeholder = translation;
                    } else {
                        el.textContent = translation;
                    }
                }
            });
            renderAll();
        }

        function setTheme(theme) {
            state.currentTheme = theme;
            localStorage.setItem('theme', theme);
            const sunIcon = DOMElements.themeSwitcher.querySelector('.theme-icon-sun');
            const moonIcon = DOMElements.themeSwitcher.querySelector('.theme-icon-moon');
            if (theme === 'light') {
                DOMElements.body.classList.add('light-mode');
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                DOMElements.body.classList.remove('light-mode');
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        }

        function showModal(text, buttons) {
            DOMElements.genericModalText.textContent = text;
            DOMElements.genericModalButtons.innerHTML = '';
            buttons.forEach(btn => {
                const buttonEl = document.createElement('button');
                buttonEl.textContent = btn.text;
                buttonEl.className = btn.class;
                buttonEl.onclick = () => {
                    DOMElements.genericModal.classList.remove('active');
                    if (btn.onClick) btn.onClick();
                };
                DOMElements.genericModalButtons.appendChild(buttonEl);
            });
            DOMElements.genericModal.classList.add('active');
        }
        function customAlert(key, useKey = true) {
            const text = useKey ? translations[state.currentLanguage][key] : key;
            showModal(text, [{ text: translations[state.currentLanguage].modalOk, class: 'w-full bg-blue-600 hover:bg-blue-700 rounded-md py-2 px-4 font-semibold' }]);
        }
        function customConfirm(key, onConfirm) {
            const text = translations[state.currentLanguage][key];
            showModal(text, [
                { text: translations[state.currentLanguage].modalCancel, class: 'flex-1 bg-gray-600 hover:bg-gray-700 rounded-md py-2 px-4 font-semibold' },
                { text: translations[state.currentLanguage].modalConfirm, class: 'flex-1 bg-red-600 hover:bg-red-700 rounded-md py-2 px-4 font-semibold', onClick: onConfirm }
            ]);
        }
        
        function resetSiteForm() {
            state.editingSiteId = null;
            DOMElements.siteForm.reset();
            DOMElements.iconPreview.src = 'https://placehold.co/32x32/777/eee?text=?';
            DOMElements.siteFormTitle.setAttribute('data-i18n-key', 'siteManagement');
            DOMElements.siteSubmitBtn.setAttribute('data-i18n-key', 'addSite');
            DOMElements.cancelEditBtn.classList.add('hidden');
            setLanguage(state.currentLanguage);
        }

        // --- Rendering Functions ---
        function renderCategories() {
            const createLink = (cat, isMobile = false) => {
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = cat.i18nKey ? translations[state.currentLanguage][cat.i18nKey] : cat.name;
                a.dataset.categoryId = cat.id;
                a.className = `block px-4 py-2 rounded-md transition-colors ${state.selectedCategory == cat.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`;
                a.onclick = e => { e.preventDefault(); state.selectedCategory = cat.id; if (isMobile) toggleMobileSidebar(); renderAll(); };
                return a;
            };
            ['sidebarNav', 'mobileSidebarNav', 'topbarNav'].forEach(key => DOMElements[key].innerHTML = '');
            const allSitesCategory = { id: 'all', name: 'All Sites', i18nKey: 'allSites' };
            DOMElements.sidebarNav.appendChild(createLink(allSitesCategory));
            DOMElements.mobileSidebarNav.appendChild(createLink(allSitesCategory, true));
            state.categories.forEach(cat => {
                if (cat.type === 'sidebar') {
                    DOMElements.sidebarNav.appendChild(createLink(cat));
                    DOMElements.mobileSidebarNav.appendChild(createLink(cat, true));
                } else if (cat.type === 'topbar') {
                    DOMElements.topbarNav.appendChild(createLink(cat));
                }
            });
        }

        function renderSites(sitesToRender) {
            DOMElements.contentGrid.innerHTML = '';
            if (!sitesToRender || sitesToRender.length === 0) {
                DOMElements.contentGrid.innerHTML = `<p class="text-gray-400">${translations[state.currentLanguage].noSitesFound}</p>`;
                return;
            }
            const sitesByCat = sitesToRender.reduce((acc, site) => { (acc[site.categoryId] = acc[site.categoryId] || []).push(site); return acc; }, {});
            const categoryOrder = state.categories.map(c => c.id);
            categoryOrder.forEach(catId => {
                const category = state.categories.find(c => c.id == catId);
                if (!category || !sitesByCat[catId]) return;
                const catTitle = document.createElement('h2');
                catTitle.textContent = category.name;
                catTitle.className = 'text-2xl font-bold mb-4 mt-6 first:mt-0';
                DOMElements.contentGrid.appendChild(catTitle);
                const grid = document.createElement('div');
                grid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8';
                sitesByCat[catId].forEach(site => {
                    const card = document.createElement('a');
                    card.href = site.url;
                    card.target = '_blank';
                    card.rel = 'noopener noreferrer';
                    card.className = 'bg-black bg-opacity-20 backdrop-blur-md rounded-lg p-3 flex flex-col items-center text-center hover:bg-opacity-60 transform hover:-translate-y-1 transition-all';
                    const iconUrl = site.icon || `https://www.google.com/s2/favicons?domain=${site.url}&sz=64`;
                    card.innerHTML = `<img src="${iconUrl}" alt="${site.name}" class="w-16 h-16 mb-4 rounded-lg object-contain" onerror="this.onerror=null;this.src='https://placehold.co/64x64/777/eee?text=${site.name.charAt(0)}';"><h3 class="font-semibold text-lg mb-1 truncate w-full">${site.name}</h3><p class="text-gray-400 text-sm flex-grow">${site.description || '&nbsp;'}</p>`;
                    grid.appendChild(card);
                });
                DOMElements.contentGrid.appendChild(grid);
            });
        }

        function renderAdminPanel() {
            if (!state.isLoggedIn) return;
            
            DOMElements.categoriesList.innerHTML = '';
            const sidebarCats = state.categories.filter(c => c.type === 'sidebar');
            const topbarCats = state.categories.filter(c => c.type === 'topbar');

            const createSortableList = (titleKey, cats) => {
                if (cats.length > 0) {
                    const titleEl = document.createElement('h4');
                    titleEl.className = "text-sm font-bold mt-4 mb-2 text-gray-400";
                    titleEl.setAttribute('data-i18n-key', titleKey);
                    titleEl.textContent = translations[state.currentLanguage][titleKey];
                    DOMElements.categoriesList.appendChild(titleEl);
                }

                const listContainer = document.createElement('div');
                listContainer.id = `sortable-${titleKey}`;
                listContainer.className = "space-y-2";
                DOMElements.categoriesList.appendChild(listContainer);

                cats.forEach(cat => {
                    const div = document.createElement('div');
                    div.className = 'flex items-center justify-between bg-gray-700 p-2 rounded-md';
                    div.dataset.id = cat.id;
                    div.innerHTML = `
                        <div class="flex items-center">
                            <i data-lucide="grip-vertical" class="drag-handle mr-2 text-gray-500"></i>
                            <span>${cat.name}</span>
                        </div>
                        <button data-id="${cat.id}" class="delete-category-btn p-1 text-red-500 hover:text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    `;
                    listContainer.appendChild(div);
                });

                new Sortable(listContainer, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    chosenClass: 'sortable-chosen',
                    handle: '.drag-handle',
                    onUpdate: () => DOMElements.saveOrderBtn.classList.remove('hidden')
                });
            };

            createSortableList('sidebar', sidebarCats);
            createSortableList('topbar', topbarCats);
            
            DOMElements.sitesListAdmin.innerHTML = '';
            state.sites.forEach(site => {
                const cat = state.categories.find(c => c.id == site.categoryId);
                const div = document.createElement('div');
                div.className = 'bg-gray-700 p-3 rounded-lg flex items-center justify-between flex-wrap gap-2';
                div.innerHTML = `<div class="flex items-center gap-3"><img src="${site.icon || `https://www.google.com/s2/favicons?domain=${site.url}&sz=32`}" class="w-8 h-8 rounded object-contain" onerror="this.onerror=null;this.src='https://placehold.co/32x32/777/eee?text=${site.name.charAt(0)}';"><div><p class="font-semibold">${site.name}</p><p class="text-xs text-gray-400">${cat ? cat.name : 'N/A'}</p></div></div><div class="flex items-center gap-2"><a href="${site.url}" target="_blank" class="p-2 text-blue-400 hover:text-blue-300"><i data-lucide="external-link" class="w-4 h-4"></i></a><button data-id="${site.id}" class="edit-site-btn p-2 text-yellow-400 hover:text-yellow-300"><i data-lucide="file-pen-line" class="w-4 h-4"></i></button><button data-id="${site.id}" class="delete-site-btn p-2 text-red-500 hover:text-red-400"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`;
                DOMElements.sitesListAdmin.appendChild(div);
            });

            DOMElements.siteCategorySelect.innerHTML = `<option value="" data-i18n-key="selectCategory">${translations[state.currentLanguage].selectCategory}</option>`;
            state.categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = `${cat.name} (${translations[state.currentLanguage][cat.type] || cat.type})`;
                DOMElements.siteCategorySelect.appendChild(opt);
            });
            lucide.createIcons();
        }

        function filterAndRenderSites() {
            const term = DOMElements.searchInput.value.toLowerCase();
            let filteredSites = state.sites;
            if (state.selectedCategory !== 'all') {
                filteredSites = filteredSites.filter(s => s.categoryId == state.selectedCategory);
            }
            if (term) {
                filteredSites = filteredSites.filter(s => (s.name && s.name.toLowerCase().includes(term)) || (s.description && s.description.toLowerCase().includes(term)) || (s.url && s.url.toLowerCase().includes(term)));
            }
            renderSites(filteredSites);
        }

        function renderAll() {
            renderCategories();
            filterAndRenderSites();
            if (state.isLoggedIn) renderAdminPanel();
        }

        // --- Event Listeners ---
        function setupEventListeners() {
            DOMElements.langSwitcher.onclick = () => { setLanguage(state.currentLanguage === 'en' ? 'zh' : 'en'); };
            DOMElements.themeSwitcher.onclick = () => { setTheme(state.currentTheme === 'light' ? 'dark' : 'light'); };
            DOMElements.adminLoginBtn.onclick = () => DOMElements.adminModal.classList.add('active');
            DOMElements.adminLogoutBtn.onclick = () => { DOMElements.adminModal.classList.remove('active'); DOMElements.adminLoginView.style.display = 'block'; DOMElements.adminPanelView.style.display = 'none'; DOMElements.passwordInput.value = ''; state.isLoggedIn = false; resetSiteForm(); };
            DOMElements.adminModal.onclick = e => { if (e.target === DOMElements.adminModal) DOMElements.adminLogoutBtn.click(); };
            DOMElements.loginForm.onsubmit = e => {
                e.preventDefault();
                if (DOMElements.passwordInput.value === ADMIN_PASSWORD) {
                    state.isLoggedIn = true;
                    DOMElements.loginError.textContent = '';
                    DOMElements.adminLoginView.style.display = 'none';
                    DOMElements.adminPanelView.style.display = 'block';
                    renderAdminPanel();
                } else {
                    DOMElements.loginError.textContent = translations[state.currentLanguage].passwordIncorrect;
                }
            };
            DOMElements.searchInput.oninput = filterAndRenderSites;
            DOMElements.saveBackgroundBtn.onclick = async () => {
                const url = DOMElements.backgroundUrlInput.value.trim();
                if (url) {
                    try { await api.post('settings', { backgroundUrl: url }); customAlert('backgroundSaved'); document.body.style.backgroundImage = `url('${url}')`; } catch (err) { customAlert('backgroundSaveFailed'); console.error(err); }
                }
            };
            DOMElements.addCategoryForm.onsubmit = async (e) => { e.preventDefault(); const name = DOMElements.categoryNameInput.value.trim(); const type = DOMElements.categoryTypeSelect.value; if (name) { await api.post('categories', { name, type }); DOMElements.categoryNameInput.value = ''; loadInitialData(); } };
            
            DOMElements.siteForm.onsubmit = async (e) => {
                e.preventDefault();
                const site = { categoryId: DOMElements.siteCategorySelect.value, name: DOMElements.siteNameInput.value.trim(), url: DOMElements.siteUrlInput.value.trim(), icon: DOMElements.siteIconInput.value.trim(), description: DOMElements.siteDescInput.value.trim() };
                if (!site.categoryId || !site.name || !site.url) { customAlert('fillRequiredFields'); return; }
                try {
                    if (state.editingSiteId) {
                        await api.put(`sites/${state.editingSiteId}`, site);
                        customAlert('siteUpdated');
                    } else {
                        await api.post('sites', site);
                    }
                    resetSiteForm();
                    loadInitialData();
                } catch (err) {
                    console.error("Failed to save site:", err);
                    customAlert("Failed to save site.", false);
                }
            };

            DOMElements.categoriesList.onclick = async (e) => { const btn = e.target.closest('.delete-category-btn'); if (btn) { customConfirm('confirmCategoryDeletion', async () => { await api.delete(`categories/${btn.dataset.id}`); loadInitialData(); }); } };
            
            DOMElements.sitesListAdmin.onclick = async (e) => {
                const deleteBtn = e.target.closest('.delete-site-btn');
                if (deleteBtn) {
                    customConfirm('confirmSiteDeletion', async () => {
                        await api.delete(`sites/${deleteBtn.dataset.id}`);
                        loadInitialData();
                    });
                    return;
                }
                const editBtn = e.target.closest('.edit-site-btn');
                if (editBtn) {
                    const siteId = editBtn.dataset.id;
                    const siteToEdit = state.sites.find(s => s.id == siteId);
                    if (siteToEdit) {
                        state.editingSiteId = siteId;
                        DOMElements.siteCategorySelect.value = siteToEdit.categoryId;
                        DOMElements.siteNameInput.value = siteToEdit.name;
                        DOMElements.siteUrlInput.value = siteToEdit.url;
                        DOMElements.siteIconInput.value = siteToEdit.icon;
                        DOMElements.siteDescInput.value = siteToEdit.description;
                        DOMElements.iconPreview.src = siteToEdit.icon || `https://placehold.co/32x32/777/eee?text=${siteToEdit.name.charAt(0)}`;
                        DOMElements.siteFormTitle.setAttribute('data-i18n-key', 'editSite');
                        DOMElements.siteSubmitBtn.setAttribute('data-i18n-key', 'saveChanges');
                        DOMElements.cancelEditBtn.classList.remove('hidden');
                        setLanguage(state.currentLanguage);
                        DOMElements.siteForm.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            };
            
            DOMElements.cancelEditBtn.onclick = resetSiteForm;

            DOMElements.saveOrderBtn.onclick = async () => {
                const sidebarList = document.getElementById('sortable-sidebar');
                const topbarList = document.getElementById('sortable-topbar');
                const sidebarIds = sidebarList ? Array.from(sidebarList.children).map(el => el.dataset.id) : [];
                const topbarIds = topbarList ? Array.from(topbarList.children).map(el => el.dataset.id) : [];
                const orderedIds = [...sidebarIds, ...topbarIds];
                try {
                    await api.post('categories/order', { orderedIds });
                    customAlert('orderSaved');
                    DOMElements.saveOrderBtn.classList.add('hidden');
                    await loadInitialData();
                } catch (err) {
                    console.error("Failed to save order:", err);
                    customAlert("Failed to save order.", false);
                }
            };
            DOMElements.siteUrlInput.onblur = () => {
                const url = DOMElements.siteUrlInput.value.trim();
                if (url && !DOMElements.siteIconInput.value.trim()) { try { const domain = new URL(url).hostname; const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`; DOMElements.siteIconInput.value = iconUrl; DOMElements.iconPreview.src = iconUrl; } catch (e) { /* ignore invalid urls */ } }
            };
            DOMElements.siteIconInput.oninput = () => { DOMElements.iconPreview.src = DOMElements.siteIconInput.value.trim() || 'https://placehold.co/32x32/777/eee?text=?'; };
            
            DOMElements.mobileMenuToggle.onclick = (e) => { e.stopPropagation(); toggleMobileSidebar(); };
            DOMElements.mobileSidebarClose.onclick = toggleMobileSidebar;
            DOMElements.desktopSidebarToggle.onclick = toggleDesktopSidebar;
        }
        
        // --- Sidebar Toggle Functions ---
        function toggleMobileSidebar() {
            DOMElements.mobileSidebar.classList.toggle('-translate-x-full');
            DOMElements.mobileSidebarContainer.classList.toggle('hidden');
        }

        function toggleDesktopSidebar() {
            const isCollapsed = DOMElements.appContainer.classList.toggle('sidebar-collapsed');
            localStorage.setItem('desktopSidebarState', isCollapsed ? 'collapsed' : 'open');
            const iconName = isCollapsed ? 'panel-right-close' : 'panel-left-close';
            DOMElements.desktopSidebarIcon.outerHTML = `<i data-lucide="${iconName}" id="desktop-sidebar-icon"></i>`;
            lucide.createIcons();
        }

        // --- Sakura Effect ---
        function initSakuraEffect() {
            const canvas = document.getElementById('sakura-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let petals = [];
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const petalShapes = [
                (ctx, s) => { const scale = s / 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(scale, -scale*2, scale*2, -scale*2, scale*2, 0); ctx.bezierCurveTo(scale*2, scale*2, scale, scale*2, 0, scale*4); ctx.bezierCurveTo(-scale, scale*2, -scale*2, scale*2, -scale*2, 0); ctx.bezierCurveTo(-scale*2, -scale*2, -scale, -scale*2, 0, 0); ctx.fill(); ctx.closePath(); },
                (ctx, s) => { const scale = s / 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(scale * 2, scale * 2, scale * 4, 0); ctx.quadraticCurveTo(scale * 2, -scale * 2, 0, 0); ctx.fill(); ctx.closePath(); },
                (ctx, s) => { const scale = s / 10; ctx.beginPath(); ctx.arc(0, 0, scale * 2, 0, Math.PI); ctx.quadraticCurveTo(-scale * 2, -scale * 2, 0, 0); ctx.fill(); ctx.closePath(); },
                (ctx, s) => { const scale = s / 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(scale * 3, scale, scale * 3, -scale * 2, scale * 5, -scale * 3); ctx.bezierCurveTo(scale * 2, -scale, 0, 0, 0, 0); ctx.fill(); ctx.closePath(); },
                (ctx, s) => { const scale = s / 10; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(scale, -scale * 2, scale * 3, -scale * 2); ctx.quadraticCurveTo(scale * 2, 0, 0, 0); ctx.fill(); ctx.closePath(); }
            ];

            class Petal {
                constructor() {
                    this.depth = Math.random();
                    this.size = ((this.depth * 8) + 5) * 7.5; 
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * -canvas.height;
                    this.speedY = (this.depth * 0.8) + 0.7;
                    this.angle = Math.random() * Math.PI * 2;
                    this.spin = Math.random() < 0.5 ? -1 : 1;
                    this.sway = Math.random() * 1.5 + 0.5;
                    this.color = `rgba(255, 192, 203, ${this.depth * 0.5 + 0.5})`;
                    this.shapeId = Math.floor(Math.random() * petalShapes.length);
                }
                update() {
                    this.y += this.speedY;
                    this.x += Math.sin(this.angle) * this.sway;
                    this.angle += 0.03 * this.spin;
                    if (this.y > canvas.height + this.size || this.x < -this.size || this.x > canvas.width + this.size) {
                        this.x = Math.random() * canvas.width;
                        this.y = -this.size;
                    }
                }
                draw() {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.angle);
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
                    ctx.shadowBlur = 5;
                    ctx.fillStyle = this.color;
                    petalShapes[this.shapeId](ctx, this.size);
                    ctx.restore();
                }
            }

            function initPetals() {
                const numberOfPetals = Math.floor(window.innerWidth / 38);
                for (let i = 0; i < numberOfPetals; i++) {
                    petals.push(new Petal());
                }
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < petals.length; i++) {
                    petals[i].update();
                    petals[i].draw();
                }
                requestAnimationFrame(animate);
            }

            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                petals = [];
                initPetals();
            });

            initPetals();
            animate();
        }

        // --- Application Initialization ---
        async function loadInitialData() {
            try {
                const [settings, categories, sites] = await Promise.all([
                    api.get('settings'),
                    api.get('categories'),
                    api.get('sites'),
                ]);
                
                if (settings && settings.value) {
                    DOMElements.body.style.backgroundImage = `url('${settings.value}')`;
                    DOMElements.body.style.backgroundSize = 'cover';
                    DOMElements.body.style.backgroundPosition = 'center';
                    DOMElements.body.style.backgroundAttachment = 'fixed';
                    DOMElements.backgroundUrlInput.value = settings.value;
                }
                state.categories = categories || [];
                state.sites = sites || [];
            } catch (error) {
                console.error("Failed to load initial data:", error);
                const errorMsg = `${translations[state.currentLanguage].dataLoadFailed} (Status: ${error.status || 'N/A'})`;
                customAlert(errorMsg, false);
            }
        }

        async function init() {
            lucide.createIcons();
            setupEventListeners();
            
            const savedDesktopSidebarState = localStorage.getItem('desktopSidebarState');
            if (savedDesktopSidebarState === 'collapsed') {
                DOMElements.appContainer.classList.add('sidebar-collapsed');
                const iconName = 'panel-right-close';
                DOMElements.desktopSidebarIcon.outerHTML = `<i data-lucide="${iconName}" id="desktop-sidebar-icon"></i>`;
                lucide.createIcons();
            }

            await loadInitialData();
            
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));
            
            const savedLang = localStorage.getItem('lang');
            const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
            setLanguage(savedLang || browserLang);

            initSakuraEffect();
        }

        init();
    </script>
</body>
</html>
