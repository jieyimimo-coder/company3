// 数据加载层 - 优先使用内嵌数据，fallback 到 fetch JSON

let companiesData = [];
let categoriesData = {};
let citiesData = [];

// 当前筛选状态（首页用）
let currentFilters = {
    search: '',
    category: null,
    location: null
};

// 数据初始化（全局，所有页面共用）
function initData() {
    if (typeof COMPANIES_DATA !== 'undefined' && COMPANIES_DATA.length > 0) {
        companiesData = COMPANIES_DATA;
        categoriesData = typeof CATEGORIES !== 'undefined' ? CATEGORIES : {};
        citiesData = typeof CITIES !== 'undefined' ? CITIES : [];
        console.log('使用内嵌数据加载成功:', companiesData.length, '家公司');
        onDataReady();
        return true;
    }
    return false;
}

// 数据加载完成后的回调
function onDataReady() {
    // 首页逻辑
    if (typeof initPage === 'function') initPage();
    // 公司列表页逻辑
    if (typeof initCompaniesPage === 'function') initCompaniesPage();
}

// 异步加载（作为 fallback，需要 HTTP 服务器）
async function loadCompaniesDataFromJSON() {
    if (initData()) return;
    try {
        const response = await fetch('data/companies.json');
        const data = await response.json();
        companiesData = data.companies;
        categoriesData = data.categories;
        citiesData = data.cities || [];
        console.log('从JSON文件加载成功:', companiesData.length, '家公司');
        onDataReady();
    } catch (error) {
        console.error('加载公司数据失败:', error);
        const el = document.getElementById('featured-companies') || document.getElementById('companies-container');
        if (el) el.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> 数据加载失败，请刷新页面重试。</div>';
    }
}

// 生成星级评分
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

// 获取分类显示名称
function getCategoryName(catKey) {
    if (categoriesData && categoriesData[catKey]) {
        return categoriesData[catKey].icon + ' ' + categoriesData[catKey].name;
    }
    return catKey;
}

// 获取分类颜色
function getCategoryColor(catKey) {
    if (categoriesData && categoriesData[catKey]) {
        return categoriesData[catKey].color;
    }
    return '#4361ee';
}

// 创建公司卡片HTML
function createCompanyCard(company) {
    const tagsHTML = company.tags.map(tag => '<span class="tag">' + tag + '</span>').join('');
    const categoriesHTML = company.categories.map(cat => {
        const color = getCategoryColor(cat);
        return '<span class="tag category-tag" data-category="' + cat + '" style="border-left: 3px solid ' + color + ';">' + getCategoryName(cat) + '</span>';
    }).join('');
    const starsHTML = generateStarRating(company.rating);

    return '<div class="company-card" data-id="' + company.id + '">' +
        '<div class="company-header">' +
            '<div class="company-logo">' + company.logo + '</div>' +
            '<div class="company-info">' +
                '<h3>' + company.name + '</h3>' +
                '<div class="location"><i class="fas fa-map-marker-alt"></i> ' + company.city + (company.location !== company.city ? ', ' + company.location : '') + '</div>' +
            '</div>' +
        '</div>' +
        '<div class="company-body">' +
            '<p class="company-description">' + company.description + '</p>' +
            '<div class="company-tags">' + categoriesHTML + tagsHTML + '</div>' +
            '<div class="company-meta">' +
                '<div class="meta-item"><i class="fas fa-calendar-alt"></i><span>成立: ' + company.founded + '年</span></div>' +
                '<div class="meta-item"><i class="fas fa-users"></i><span>规模: ' + company.employees + '</span></div>' +
            '</div>' +
        '</div>' +
        '<div class="company-footer">' +
            '<div class="rating">' + starsHTML + ' <span>' + company.rating + '</span></div>' +
            '<button class="view-btn" onclick="viewCompanyDetail(' + company.id + ')">查看详情 <i class="fas fa-arrow-right"></i></button>' +
        '</div>' +
    '</div>';
}

// 显示热门公司（首页用）
function displayFeaturedCompanies() {
    const container = document.getElementById('featured-companies');
    if (!container) return;
    const featuredCompanies = companiesData.filter(company => company.featured);
    if (featuredCompanies.length === 0) {
        container.innerHTML = '<div class="no-results">暂无热门公司</div>';
        return;
    }
    container.innerHTML = featuredCompanies.map(company => createCompanyCard(company)).join('');
}

// 更新分类计数（首页用）
function updateCategoryCounts() {
    const counts = {};
    companiesData.forEach(c => c.categories.forEach(cat => { counts[cat] = (counts[cat] || 0) + 1; }));
    document.querySelectorAll('.category-card').forEach(card => {
        const cat = card.dataset.category;
        const countEl = card.querySelector('.count');
        if (countEl) countEl.textContent = (counts[cat] || 0) + '家公司';
    });
}

// 首页初始化
function initPage() {
    displayFeaturedCompanies();
    updateCategoryCounts();
    updateLocationTags();
    bindHomePageEvents();
}

// 更新地点标签
function updateLocationTags() {
    const container = document.getElementById('location-tags');
    if (!container) return;
    // 统计每个地点的公司数量
    const locationCounts = {};
    companiesData.forEach(c => {
        const loc = c.city;
        locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    // 按数量排序，取前8个
    const topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    // 生成标签
    container.innerHTML = '<span class="location-tag active" data-location="all">全部</span>' +
        topLocations.map(function(item) {
            return '<span class="location-tag" data-location="' + item[0] + '">' + item[0] + ' (' + item[1] + ')</span>';
        }).join('');
}

// 查看公司详情
function viewCompanyDetail(companyId) {
    const company = companiesData.find(c => c.id === companyId);
    if (!company) return;
    showCompanyModal(company);
}

// 显示公司详情模态框
function showCompanyModal(company) {
    const starsHTML = generateStarRating(company.rating);
    const categoriesHTML = company.categories.map(cat => {
        const color = getCategoryColor(cat);
        return '<span class="tag category-tag" style="border-left: 3px solid ' + color + ';">' + getCategoryName(cat) + '</span>';
    }).join('');
    const projectsHTML = company.projects.map(p => '<li>' + p + '</li>').join('');
    const servicesHTML = company.services.map(s => '<li>' + s + '</li>').join('');

    const websiteHTML = company.website ?
        '<div class="info-item"><span class="info-label">官方网站</span><span class="info-value"><a href="' + company.website + '" target="_blank">' + company.website + '</a></span></div>' :
        '';

    const contactHTML = company.contact && (company.contact.email || company.contact.phone) ?
        '<div class="modal-section"><h3><i class="fas fa-envelope"></i> 联系方式</h3><div class="modal-contact">' +
        (company.contact.email ? '<div class="info-item"><span class="info-label">邮箱</span><span class="info-value">' + company.contact.email + '</span></div>' : '') +
        (company.contact.phone ? '<div class="info-item"><span class="info-label">电话</span><span class="info-value">' + company.contact.phone + '</span></div>' : '') +
        '</div></div>' : '';

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML =
        '<div class="modal-content">' +
            '<button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()"><i class="fas fa-times"></i></button>' +
            '<div class="modal-header">' +
                '<div class="company-logo-lg">' + company.logo + '</div>' +
                '<div>' +
                    '<h2>' + company.name + '</h2>' +
                    '<div class="modal-location"><i class="fas fa-map-marker-alt"></i> ' + company.city + (company.location !== company.city ? ', ' + company.location : '') + '</div>' +
                    '<div class="rating">' + starsHTML + ' <span>' + company.rating + '</span></div>' +
                '</div>' +
            '</div>' +
            '<div class="modal-body">' +
                '<p>' + company.description + '</p>' +
                '<div class="modal-section">' +
                    '<h3><i class="fas fa-tags"></i> 业务分类</h3>' +
                    '<div class="company-tags">' + categoriesHTML +
                    company.tags.map(t => '<span class="tag">' + t + '</span>').join('') +
                    '</div>' +
                '</div>' +
                '<div class="modal-section">' +
                    '<h3><i class="fas fa-info-circle"></i> 基本信息</h3>' +
                    '<div class="modal-info-grid">' +
                        '<div class="info-item"><span class="info-label">成立时间</span><span class="info-value">' + company.founded + '年</span></div>' +
                        '<div class="info-item"><span class="info-label">公司规模</span><span class="info-value">' + company.employees + '人</span></div>' +
                        websiteHTML +
                    '</div>' +
                '</div>' +
                '<div class="modal-section">' +
                    '<h3><i class="fas fa-trophy"></i> 代表作品</h3>' +
                    '<ul class="modal-list">' + projectsHTML + '</ul>' +
                '</div>' +
                '<div class="modal-section">' +
                    '<h3><i class="fas fa-cogs"></i> 服务项目</h3>' +
                    '<ul class="modal-list">' + servicesHTML + '</ul>' +
                '</div>' +
                contactHTML +
            '</div>' +
        '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') modal.remove(); });
}

// 首页事件绑定
function bindHomePageEvents() {
    var searchInput = document.getElementById('search-input');
    var searchBtn = document.getElementById('search-btn');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentFilters.search = this.value.trim();
            filterCompanies();
        });
        searchInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') filterCompanies(); });
    }
    if (searchBtn) searchBtn.addEventListener('click', filterCompanies);

    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            currentFilters.category = this.dataset.category;
            filterCompanies();
        });
    });
    document.querySelectorAll('.location-tag').forEach(function(tag) {
        tag.addEventListener('click', function() {
            var loc = this.dataset.location;
            currentFilters.location = loc === 'all' ? null : loc;
            filterCompanies();
            document.querySelectorAll('.location-tag').forEach(function(t) { t.classList.remove('active'); });
            if (loc === 'all') this.classList.add('active');
            else this.classList.add('active');
        });
    });
    document.querySelectorAll('.category-card').forEach(function(card) {
        card.addEventListener('click', function() {
            currentFilters.category = this.dataset.category;
            currentFilters.search = '';
            if (searchInput) searchInput.value = '';
            filterCompanies();
            document.querySelectorAll('.filter-btn').forEach(function(b) {
                b.style.background = 'rgba(255,255,255,0.2)';
                b.style.borderColor = 'rgba(255,255,255,0.3)';
            });
            this.style.background = 'rgba(255,255,255,0.3)';
        });
    });
}

// 首页筛选逻辑
function filterCompanies() {
    var filtered = companiesData.slice();
    if (currentFilters.search) {
        var q = currentFilters.search.toLowerCase();
        filtered = filtered.filter(function(c) {
            return c.name.toLowerCase().indexOf(q) !== -1 ||
                c.description.toLowerCase().indexOf(q) !== -1 ||
                c.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }) ||
                c.city.toLowerCase().indexOf(q) !== -1 ||
                c.location.toLowerCase().indexOf(q) !== -1 ||
                c.projects.some(function(p) { return p.toLowerCase().indexOf(q) !== -1; });
        });
    }
    if (currentFilters.category) {
        filtered = filtered.filter(function(c) { return c.categories.indexOf(currentFilters.category) !== -1; });
    }
    if (currentFilters.location) {
        filtered = filtered.filter(function(c) {
            return c.city === currentFilters.location || c.location === currentFilters.location;
        });
    }
    var container = document.getElementById('featured-companies');
    if (!container) return;
    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-results"><i class="fas fa-search" style="font-size:2rem;display:block;margin-bottom:1rem;"></i>没有找到符合条件的公司</div>';
        return;
    }
    container.innerHTML = filtered.map(function(c) { return createCompanyCard(c); }).join('');
}

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    if (!initData()) {
        loadCompaniesDataFromJSON();
    }
});
