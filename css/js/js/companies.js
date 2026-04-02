// 公司列表页面专用JavaScript

// 页面状态
let pageState = {
    currentPage: 1,
    itemsPerPage: 24,
    totalItems: 0,
    currentView: 'grid',
    currentFilters: {
        category: '',
        location: '',
        sort: 'rating',
        search: ''
    }
};

// 由 data.js 的 onDataReady() 统一调用
function initCompaniesPage() {
    updateStats();
    populateLocationFilter();
    displayAllCompanies();
    bindCompaniesPageEvents();
    initFilters();
}

// 更新统计信息
function updateStats() {
    document.getElementById('total-companies').textContent = companiesData.length;
    const featuredCount = companiesData.filter(company => company.featured).length;
    document.getElementById('featured-count').textContent = featuredCount;
    const citySet = new Set(companiesData.map(c => c.city));
    document.getElementById('cities-count').textContent = citySet.size;
}

// 动态填充地点筛选
function populateLocationFilter() {
    const locationFilter = document.getElementById('location-filter');
    if (!locationFilter) return;
    // 统计每个城市的公司数量
    const cityCounts = {};
    companiesData.forEach(c => {
        cityCounts[c.city] = (cityCounts[c.city] || 0) + 1;
    });
    // 按数量排序
    const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
    // 保留已有的第一个option
    let optionsHTML = '<option value="">所有地点</option>';
    sortedCities.forEach(function(item) {
        optionsHTML += '<option value="' + item[0] + '">' + item[0] + ' (' + item[1] + ')</option>';
    });
    locationFilter.innerHTML = optionsHTML;
}

// 显示所有公司
function displayAllCompanies() {
    // 应用筛选
    let filteredCompanies = applyFilters(companiesData);
    
    // 更新结果计数
    updateResultsCount(filteredCompanies.length);
    
    // 更新分页
    updatePagination(filteredCompanies.length);
    
    // 获取当前页的公司
    const startIndex = (pageState.currentPage - 1) * pageState.itemsPerPage;
    const endIndex = startIndex + pageState.itemsPerPage;
    const currentPageCompanies = filteredCompanies.slice(startIndex, endIndex);
    
    // 显示公司
    displayCompanies(currentPageCompanies);
}

// 应用筛选
function applyFilters(companies) {
    let filtered = [...companies];
    
    // 分类筛选
    if (pageState.currentFilters.category) {
        filtered = filtered.filter(company => 
            company.categories.includes(pageState.currentFilters.category)
        );
    }
    
    // 地点筛选
    if (pageState.currentFilters.location) {
        filtered = filtered.filter(company =>
            company.city === pageState.currentFilters.location || company.location === pageState.currentFilters.location
        );
    }
    
    // 搜索筛选
    if (pageState.currentFilters.search) {
        const searchLower = pageState.currentFilters.search.toLowerCase();
        filtered = filtered.filter(company => 
            company.name.toLowerCase().includes(searchLower) ||
            company.description.toLowerCase().includes(searchLower) ||
            company.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
            company.city.toLowerCase().includes(searchLower)
        );
    }
    
    // 排序
    filtered.sort((a, b) => {
        switch (pageState.currentFilters.sort) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'founded':
                return b.founded - a.founded; // 最新的在前
            case 'featured':
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return b.rating - a.rating; // 评分高的在前
            case 'rating':
            default:
                return b.rating - a.rating; // 评分高的在前
        }
    });
    
    return filtered;
}

// 更新结果计数
function updateResultsCount(count) {
    const resultsElement = document.getElementById('results-count');
    if (resultsElement) {
        resultsElement.textContent = `显示${count}家公司`;
    }
}

// 更新分页
function updatePagination(totalItems) {
    const paginationElement = document.getElementById('pagination');
    if (!paginationElement) return;
    
    const totalPages = Math.ceil(totalItems / pageState.itemsPerPage);
    
    if (totalPages <= 1) {
        paginationElement.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // 上一页按钮
    html += `<button class="page-btn ${pageState.currentPage === 1 ? 'disabled' : ''}" 
              onclick="goToPage(${pageState.currentPage - 1})">
              <i class="fas fa-chevron-left"></i> 上一页
            </button>`;
    
    // 页码
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pageState.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === pageState.currentPage ? 'active' : ''}" 
                  onclick="goToPage(${i})">${i}</button>`;
    }
    
    // 下一页按钮
    html += `<button class="page-btn ${pageState.currentPage === totalPages ? 'disabled' : ''}" 
              onclick="goToPage(${pageState.currentPage + 1})">
              下一页 <i class="fas fa-chevron-right"></i>
            </button>`;
    
    paginationElement.innerHTML = html;
}

// 跳转到指定页面
function goToPage(page) {
    const totalItems = applyFilters(companiesData).length;
    const totalPages = Math.ceil(totalItems / pageState.itemsPerPage);
    
    if (page < 1 || page > totalPages || page === pageState.currentPage) {
        return;
    }
    
    pageState.currentPage = page;
    displayAllCompanies();
    
    // 滚动到列表顶部
    document.querySelector('.companies-list').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// 显示公司
function displayCompanies(companies) {
    const container = document.getElementById('companies-container');
    if (!container) return;
    
    if (companies.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i> 没有找到符合条件的公司
                <p>请尝试调整筛选条件或搜索关键词</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    if (pageState.currentView === 'grid') {
        // 网格视图
        html = '<div class="companies-grid">';
        companies.forEach(company => {
            html += createCompanyCard(company);
        });
        html += '</div>';
    } else {
        // 列表视图
        html = '<div class="companies-list-view">';
        companies.forEach(company => {
            html += createCompanyListItem(company);
        });
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// 创建公司列表项（列表视图）
function createCompanyListItem(company) {
    const categoriesHTML = company.categories.map(cat => {
        const color = getCategoryColor(cat);
        return '<span class="tag category-tag" data-category="' + cat + '" style="border-left: 3px solid ' + color + ';">' + getCategoryName(cat) + '</span>';
    }).join('');

    const starsHTML = generateStarRating(company.rating);

    return `
        <div class="company-list-item" data-id="${company.id}">
            <div class="list-item-header">
                <div class="company-logo-small">${company.logo}</div>
                <div class="list-item-info">
                    <h3>${company.name}</h3>
                    <div class="location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${company.city}${company.location !== company.city ? ', ' + company.location : ''}
                        <span class="founded">成立: ${company.founded}</span>
                    </div>
                </div>
                <div class="list-item-rating">
                    <div class="rating">
                        ${starsHTML}
                        <span>${company.rating}</span>
                    </div>
                    ${company.featured ? '<span class="featured-badge">推荐</span>' : ''}
                </div>
            </div>
            <div class="list-item-body">
                <p class="company-description">${company.description}</p>
                <div class="company-tags">
                    ${categoriesHTML}
                </div>
            </div>
            <div class="list-item-footer">
                <div class="company-meta">
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${company.employees}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tags"></i>
                        <span>${company.tags.slice(0, 3).join('、')}</span>
                    </div>
                </div>
                <button class="view-btn" onclick="viewCompanyDetail(${company.id})">
                    查看详情 <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

// 初始化筛选器
function initFilters() {
    // 分类筛选器
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.value = pageState.currentFilters.category;
        categoryFilter.addEventListener('change', function() {
            pageState.currentFilters.category = this.value;
            pageState.currentPage = 1; // 重置到第一页
            displayAllCompanies();
        });
    }
    
    // 地点筛选器
    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) {
        locationFilter.value = pageState.currentFilters.location;
        locationFilter.addEventListener('change', function() {
            pageState.currentFilters.location = this.value;
            pageState.currentPage = 1;
            displayAllCompanies();
        });
    }
    
    // 排序筛选器
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.value = pageState.currentFilters.sort;
        sortFilter.addEventListener('change', function() {
            pageState.currentFilters.sort = this.value;
            displayAllCompanies();
        });
    }
    
    // 重置筛选按钮
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            pageState.currentFilters = {
                category: '',
                location: '',
                sort: 'rating',
                search: ''
            };
            
            if (categoryFilter) categoryFilter.value = '';
            if (locationFilter) locationFilter.value = '';
            if (sortFilter) sortFilter.value = 'rating';
            
            const searchInput = document.getElementById('company-search');
            if (searchInput) searchInput.value = '';
            
            pageState.currentPage = 1;
            displayAllCompanies();
        });
    }
    
    // 搜索功能
    const searchInput = document.getElementById('company-search');
    const searchBtn = document.getElementById('company-search-btn');
    
    if (searchInput) {
        searchInput.value = pageState.currentFilters.search;
        searchInput.addEventListener('input', function() {
            pageState.currentFilters.search = this.value.trim();
            pageState.currentPage = 1;
            displayAllCompanies();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                pageState.currentPage = 1;
                displayAllCompanies();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            pageState.currentPage = 1;
            displayAllCompanies();
        });
    }
}

// 绑定公司列表页面事件
function bindCompaniesPageEvents() {
    // 视图切换
    const viewButtons = document.querySelectorAll('.view-btn[data-view]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // 更新按钮状态
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新视图
            pageState.currentView = view;
            displayAllCompanies();
        });
    });
    
    // 分类链接点击
    document.querySelectorAll('a[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            
            // 设置筛选器
            pageState.currentFilters.category = category;
            pageState.currentPage = 1;
            
            // 更新筛选器UI
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) categoryFilter.value = category;
            
            displayAllCompanies();
        });
    });
}

// 添加列表视图的CSS
const listViewStyles = document.createElement('style');
listViewStyles.textContent = `
    .companies-list-view {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .company-list-item {
        background: white;
        border-radius: 15px;
        padding: 1.5rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        transition: all 0.3s;
    }
    
    .company-list-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .list-item-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .company-logo-small {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    .list-item-info {
        flex: 1;
    }
    
    .list-item-info h3 {
        margin-bottom: 5px;
        font-size: 1.2rem;
    }
    
    .location {
        color: #666;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .founded {
        background: #f0f0f0;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.8rem;
    }
    
    .list-item-rating {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 5px;
    }
    
    .featured-badge {
        background: linear-gradient(135deg, #ffb74d 0%, #ff9800 100%);
        color: white;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .list-item-body {
        margin-bottom: 1rem;
    }
    
    .list-item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
    
    .filter-toolbar {
        background: white;
        padding: 1.5rem 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
    }
    
    .filter-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: center;
    }
    
    .filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .filter-group label {
        font-weight: 500;
        color: #333;
    }
    
    .filter-group select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: white;
        font-size: 0.95rem;
        min-width: 150px;
    }
    
    .reset-btn {
        background: #f0f0f0;
        color: #666;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .reset-btn:hover {
        background: #e0e0e0;
    }
    
    .search-box.compact {
        max-width: 600px;
        margin: 0;
    }
    
    .search-box.compact .search-input {
        background: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 10px;
    }
    
    .page-header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        padding: 3rem 0;
        text-align: center;
    }
    
    .page-header h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    
    .page-stats {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 2rem;
        margin-top: 2rem;
    }
    
    .stat-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 1.5rem;
        border-radius: 15px;
        min-width: 150px;
        text-align: center;
        backdrop-filter: blur(10px);
    }
    
    .stat-number {
        font-size: 2.5rem;
        font-weight: 700;
        color: #4cc9f0;
        margin-bottom: 0.5rem;
    }
    
    .stat-label {
        font-size: 1rem;
        color: #b8c1ec;
    }
    
    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .view-toggle {
        display: flex;
        gap: 0.5rem;
    }
    
    .view-toggle .view-btn {
        background: #f0f0f0;
        color: #666;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.3s;
    }
    
    .view-toggle .view-btn.active {
        background: #4361ee;
        color: white;
    }
    
    .view-toggle .view-btn:hover:not(.active) {
        background: #e0e0e0;
    }
    
    .pagination {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 3rem;
    }
    
    .page-btn {
        padding: 8px 16px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        min-width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }
    
    .page-btn:hover:not(.disabled):not(.active) {
        background: #f0f0f0;
    }
    
    .page-btn.active {
        background: #4361ee;
        color: white;
        border-color: #4361ee;
    }
    
    .page-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
        .filter-controls {
            flex-direction: column;
            align-items: stretch;
        }
        
        .filter-group {
            justify-content: space-between;
        }
        
        .page-stats {
            gap: 1rem;
        }
        
        .stat-card {
            min-width: 120px;
            padding: 1rem;
        }
        
        .stat-number {
            font-size: 2rem;
        }
        
        .list-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
        
        .list-item-header {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .list-item-rating {
            align-items: flex-start;
        }
        
        .list-item-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }
    }
`;
document.head.appendChild(listViewStyles);