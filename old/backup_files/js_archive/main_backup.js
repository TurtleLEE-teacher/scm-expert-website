// SCM Expert 메인 JavaScript - Enhanced Interactive Version

console.log('메인 JavaScript 로드됨 - Enhanced Version');

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 로드 완료');
    
    // 프리로더 제거
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 800);
    
    // 모바일 네비게이션 토글
    initMobileNavigation();
    
    // 스크롤 이벤트
    initScrollEvents();
    
    // 페이드인 애니메이션
    initFadeInAnimation();
    
    // 스무스 스크롤
    initSmoothScroll();
    
    // 패럴랙스 효과
    initParallaxEffect();
    
    // 마우스 추적 효과
    initMouseTracking();
    
    // 타이핑 애니메이션
    initTypingAnimation();
    
    // 카운트업 애니메이션
    initCountUpAnimation();
    
    // 다크모드 토글
    initDarkModeToggle();
    
    // Bento Grid 애니메이션
    initBentoGridAnimation();
    
    console.log('모든 초기화 완료');
});

// 모바일 네비게이션 초기화
function initMobileNavigation() {
    console.log('모바일 네비게이션 초기화');
    
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            console.log('네비게이션 토글 클릭');
            
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // body 스크롤 방지
            document.body.classList.toggle('nav-open');
        });
        
        // 메뉴 링크 클릭 시 메뉴 닫기
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('네비게이션 링크 클릭:', this.textContent);
                
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            });
        });
    }
}

// 스크롤 이벤트 초기화
function initScrollEvents() {
    console.log('스크롤 이벤트 초기화');
    
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 헤더 스타일 변경
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // 스크롤 방향 감지
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // 아래로 스크롤
            header.classList.add('hidden');
        } else {
            // 위로 스크롤
            header.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}

// 페이드인 애니메이션 초기화
function initFadeInAnimation() {
    console.log('페이드인 애니메이션 초기화');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('요소가 뷰포트에 진입:', entry.target.className);
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들에 fade-in 클래스 추가 및 관찰 시작
    const animateElements = document.querySelectorAll('.service-card, .feature, .section-title');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// 스무스 스크롤 초기화
function initSmoothScroll() {
    console.log('스무스 스크롤 초기화');
    
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                console.log('스무스 스크롤 대상:', href);
                
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

// 버튼 클릭 이벤트 로깅
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        console.log('버튼 클릭됨:', e.target.textContent, '- URL:', e.target.href);
    }
    
    if (e.target.classList.contains('service-link')) {
        console.log('서비스 링크 클릭됨:', e.target.textContent, '- URL:', e.target.href);
    }
});

// 폼 제출 이벤트 처리 (향후 사용)
function handleFormSubmit(formElement, callback) {
    console.log('폼 제출 핸들러 등록');
    
    formElement.addEventListener('submit', function(e) {
        e.preventDefault();
        
        console.log('폼 제출 시도');
        
        const formData = new FormData(this);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        console.log('폼 데이터:', data);
        
        if (callback && typeof callback === 'function') {
            callback(data, this);
        }
    });
}

// 에러 처리
window.addEventListener('error', function(e) {
    console.error('JavaScript 에러 발생:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
});

// 유틸리티 함수들
const Utils = {
    // 이메일 유효성 검사
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = re.test(email);
        console.log('이메일 유효성 검사:', email, '결과:', isValid);
        return isValid;
    },
    
    // 전화번호 유효성 검사
    validatePhone: function(phone) {
        const re = /^[\d\-\s\(\)]+$/;
        const isValid = re.test(phone) && phone.replace(/\D/g, '').length >= 10;
        console.log('전화번호 유효성 검사:', phone, '결과:', isValid);
        return isValid;
    },
    
    // 로딩 스피너 표시
    showLoading: function(element) {
        console.log('로딩 스피너 표시');
        element.classList.add('loading');
        element.disabled = true;
    },
    
    // 로딩 스피너 숨김
    hideLoading: function(element) {
        console.log('로딩 스피너 숨김');
        element.classList.remove('loading');
        element.disabled = false;
    },
    
    // 알림 메시지 표시
    showAlert: function(message, type = 'info') {
        console.log('알림 표시:', message, '타입:', type);
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 3000);
    }
};

// 패럴랙스 효과 초기화
function initParallaxEffect() {
    console.log('패럴랙스 효과 초기화');
    
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

// 마우스 추적 효과
function initMouseTracking() {
    console.log('마우스 추적 효과 초기화');
    
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
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// 타이핑 애니메이션
function initTypingAnimation() {
    console.log('타이핑 애니메이션 초기화');
    
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

// 카운트업 애니메이션
function initCountUpAnimation() {
    console.log('카운트업 애니메이션 초기화');
    
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

// 다크모드 토글
function initDarkModeToggle() {
    console.log('다크모드 토글 초기화');
    
    // 다크모드 버튼 생성
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '🌙';
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
    document.body.appendChild(darkModeToggle);
    
    // 로컬 스토리지에서 다크모드 설정 확인
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '☀️';
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.innerHTML = isDarkMode ? '☀️' : '🌙';
        console.log('다크모드 토글:', isDarkMode);
    });
}

// Bento Grid 애니메이션 초기화
function initBentoGridAnimation() {
    console.log('Bento Grid 애니메이션 초기화');
    
    const bentoBoxes = document.querySelectorAll('.bento-box');
    
    if (bentoBoxes.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                // 순차적 애니메이션을 위한 지연 시간
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);
    
    bentoBoxes.forEach(box => {
        observer.observe(box);
    });
    
    // 호버 효과 개선
    bentoBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.zIndex = 'auto';
        });
    });
}

// 전역 객체로 내보내기
window.SCMExpert = {
    Utils: Utils,
    handleFormSubmit: handleFormSubmit
};

console.log('SCM Expert JavaScript 모듈 로드 완료');
