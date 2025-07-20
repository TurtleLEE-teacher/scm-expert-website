// SCM Expert 메인 JavaScript - Enhanced Interactive Version

console.log('메인 JavaScript 로드??- Enhanced Version');

// DOM 로드 ?�료 ???�행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 ?�료');
    
    // ?�리로더 ?�거
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 800);
    
    // 모바???�비게이???��?
    initMobileNavigation();
    
    // ?�크�??�벤??    initScrollEvents();
    
    // ?�이?�인 ?�니메이??    initFadeInAnimation();
    
    // ?�무???�크�?    initSmoothScroll();
    
    // ?�럴?�스 ?�과
    initParallaxEffect();
    
    // 마우??추적 ?�과
    initMouseTracking();
    
    // ?�?�핑 ?�니메이??    initTypingAnimation();
    
    // 카운?�업 ?�니메이??    initCountUpAnimation();
    
    // ?�크모드 ?��?
    initDarkModeToggle();
    
    // Bento Grid ?�니메이??    initBentoGridAnimation();
    
    console.log('모든 초기???�료');
});

// 모바???�비게이??초기??function initMobileNavigation() {
    console.log('모바???�비게이??초기??);
    
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            console.log('?�비게이???��? ?�릭');
            
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // body ?�크�?방�?
            document.body.classList.toggle('nav-open');
        });
        
        // 메뉴 링크 ?�릭 ??메뉴 ?�기
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('?�비게이??링크 ?�릭:', this.textContent);
                
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            });
        });
    }
}

// ?�크�??�벤??초기??function initScrollEvents() {
    console.log('?�크�??�벤??초기??);
    
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // ?�더 ?��???변�?        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // ?�크�?방향 감�?
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // ?�래�??�크�?            header.classList.add('hidden');
        } else {
            // ?�로 ?�크�?            header.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}

// ?�이?�인 ?�니메이??초기??function initFadeInAnimation() {
    console.log('?�이?�인 ?�니메이??초기??);
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('?�소가 뷰포?�에 진입:', entry.target.className);
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // ?�니메이???�???�소?�에 fade-in ?�래??추�? �?관�??�작
    const animateElements = document.querySelectorAll('.service-card, .feature, .section-title');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ?�무???�크�?초기??function initSmoothScroll() {
    console.log('?�무???�크�?초기??);
    
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                console.log('?�무???�크�??�??', href);
                
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 버튼 ?�릭 ?�벤??로깅
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        console.log('버튼 ?�릭??', e.target.textContent, '- URL:', e.target.href);
    }
    
    if (e.target.classList.contains('service-link')) {
        console.log('?�비??링크 ?�릭??', e.target.textContent, '- URL:', e.target.href);
    }
});

// ???�출 ?�벤??처리 (?�후 ?�용)
function handleFormSubmit(formElement, callback) {
    console.log('???�출 ?�들???�록');
    
    formElement.addEventListener('submit', function(e) {
        e.preventDefault();
        
        console.log('???�출 ?�도');
        
        const formData = new FormData(this);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        console.log('???�이??', data);
        
        if (callback && typeof callback === 'function') {
            callback(data, this);
        }
    });
}

// ?�러 처리
window.addEventListener('error', function(e) {
    console.error('JavaScript ?�러 발생:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
});

// ?�틸리티 ?�수??const Utils = {
    // ?�메???�효??검??    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = re.test(email);
        console.log('?�메???�효??검??', email, '결과:', isValid);
        return isValid;
    },
    
    // ?�화번호 ?�효??검??    validatePhone: function(phone) {
        const re = /^[\d\-\s\(\)]+$/;
        const isValid = re.test(phone) && phone.replace(/\D/g, '').length >= 10;
        console.log('?�화번호 ?�효??검??', phone, '결과:', isValid);
        return isValid;
    },
    
    // 로딩 ?�피???�시
    showLoading: function(element) {
        console.log('로딩 ?�피???�시');
        element.classList.add('loading');
        element.disabled = true;
    },
    
    // 로딩 ?�피???��?
    hideLoading: function(element) {
        console.log('로딩 ?�피???��?');
        element.classList.remove('loading');
        element.disabled = false;
    },
    
    // ?�림 메시지 ?�시
    showAlert: function(message, type = 'info') {
        console.log('?�림 ?�시:', message, '?�??', type);
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        // 3�????�동 ?�거
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 3000);
    }
};

// ?�럴?�스 ?�과 초기??function initParallaxEffect() {
    console.log('?�럴?�스 ?�과 초기??);
    
    const parallaxElements = document.querySelectorAll('.hero, .section-title');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// 마우??추적 ?�과
function initMouseTracking() {
    console.log('마우??추적 ?�과 초기??);
    
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(`${rotateX}deg / 2) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(`0 / 2) rotateY(0) scale(1)';
        });
    });
}

// ?�?�핑 ?�니메이??function initTypingAnimation() {
    console.log('?�?�핑 ?�니메이??초기??);
    
    const typingElements = document.querySelectorAll('.typing-effect');
    
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.visibility = 'visible';
        
        let index = 0;
        const typing = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typing);
            }
        }, 100);
    });
}

// 카운?�업 ?�니메이??function initCountUpAnimation() {
    console.log('카운?�업 ?�니메이??초기??);
    
    const countElements = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-count'));
                animateCount(target, 0, endValue, 2000);
                target.classList.add('counted');
            }
        });
    }, observerOptions);
    
    countElements.forEach(element => {
        observer.observe(element);
    });
}

function animateCount(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// ?�크모드 ?��?
function initDarkModeToggle() {
    console.log('?�크모드 ?��? 초기??);
    
    // ?�크모드 버튼 ?�성
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '?��';
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
    document.body.appendChild(darkModeToggle);
    
    // 로컬 ?�토리�??�서 ?�크모드 ?�정 ?�인
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '?��?;
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.innerHTML = isDarkMode ? '?��? : '?��';
        console.log('?�크모드 ?��?:', isDarkMode);
    });
}

// Bento Grid ?�니메이??초기??function initBentoGridAnimation() {
    console.log('Bento Grid ?�니메이??초기??);
    
    const bentoBoxes = document.querySelectorAll('.bento-box');
    
    if (bentoBoxes.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                // ?�차???�니메이?�을 ?�한 지???�간
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);
    
    bentoBoxes.forEach(box => {
        observer.observe(box);
    });
    
    // ?�버 ?�과 개선
    bentoBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.zIndex = 'auto';
        });
    });
}

// ?�역 객체�??�보?�기
window.SCMExpert = {
    Utils: Utils,
    handleFormSubmit: handleFormSubmit
};

console.log('SCM Expert JavaScript 모듈 로드 ?�료');
