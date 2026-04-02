// 主JavaScript文件 - 处理通用页面交互

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化动画效果
    initAnimations();
    
    // 初始化页面交互
    initPageInteractions();
});

// 移动端菜单功能
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            if (navLinks.style.display === 'flex') {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.backgroundColor = '#1a1a2e';
                navLinks.style.padding = '1rem';
                navLinks.style.gap = '1rem';
            }
        });
        
        // 窗口大小改变时调整菜单
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navLinks.style.display = '';
                navLinks.style.flexDirection = '';
                navLinks.style.position = '';
                navLinks.style.backgroundColor = '';
                navLinks.style.padding = '';
            }
        });
    }
}

// 动画效果初始化
function initAnimations() {
    // 滚动时显示元素
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 观察需要动画的元素
    document.querySelectorAll('.category-card, .feature-card, .company-card').forEach(el => {
        observer.observe(el);
    });
}

// 页面交互初始化
function initPageInteractions() {
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 分类卡片悬停效果
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // 公司卡片悬停效果
    document.querySelectorAll('.company-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // 快速筛选按钮效果
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除其他按钮的激活状态
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.style.background = 'rgba(255, 255, 255, 0.2)';
                b.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            });
            
            // 设置当前按钮激活状态
            this.style.background = 'rgba(255, 255, 255, 0.4)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.6)';
        });
    });
    
    // 地点标签效果
    document.querySelectorAll('.location-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            // 移除其他标签的激活状态
            document.querySelectorAll('.location-tag').forEach(t => {
                t.classList.remove('active');
            });
            
            // 设置当前标签激活状态
            this.classList.add('active');
        });
    });
}

// 工具函数：显示加载状态
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> 加载中...
            </div>
        `;
    }
}

// 工具函数：显示错误信息
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </div>
        `;
    }
}

// 工具函数：显示无结果
function showNoResults(containerId, message = '没有找到相关内容') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i> ${message}
            </div>
        `;
    }
}

// 工具函数：格式化数字
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// CSS动画类
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .loading {
        text-align: center;
        padding: 3rem;
        color: #666;
        font-size: 1.1rem;
    }
    
    .loading i {
        margin-right: 10px;
        color: #4361ee;
    }
    
    .error {
        text-align: center;
        padding: 3rem;
        color: #e74c3c;
        font-size: 1.1rem;
    }
    
    .error i {
        margin-right: 10px;
        font-size: 1.5rem;
    }
    
    .no-results {
        text-align: center;
        padding: 3rem;
        color: #666;
        font-size: 1.1rem;
        grid-column: 1 / -1;
    }
    
    .no-results i {
        margin-right: 10px;
        color: #95a5a6;
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .company-meta {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #666;
    }
    
    .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .meta-item i {
        color: #4361ee;
    }
    
    .category-tag {
        background: linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%);
        color: white !important;
    }
`;
document.head.appendChild(style);