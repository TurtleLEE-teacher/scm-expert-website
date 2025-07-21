// 모던 인터랙션 및 애니메이션 JavaScript

// 파티클 배경 생성
function createParticles() {
    const particleContainer = document.querySelector('.particle-bg');
    if (!particleContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle particle-move';
        particle.style.width = Math.random() * 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = Math.random() * 10 + 10 + 's';
        particleContainer.appendChild(particle);
    }
}

// 스크롤에 따른 헤더 변화
function handleScrollHeader() {
    const header = document.querySelector('.modern-header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 스크롤 트리거 애니메이션
function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    
    const revealOnScroll = () => {
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // 초기 실행
}

// 3D 카드 마우스 효과
function init3DCards() {
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// 타이핑 효과
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    element.classList.add('typing-text');
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// 카운터 애니메이션
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// 리플 효과
function initRippleEffect() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('ripple')) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = e.offsetX + 'px';
            ripple.style.top = e.offsetY + 'px';
            e.target.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        }
    });
}

// 스무스 스크롤 개선
function smoothScrollTo(target, duration = 1000) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();
    
    function animation(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // 이징 함수 (easeInOutCubic)
        const easing = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + distance * easing);
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// 노션 API 호출 함수
async function fetchNotionData(endpoint, method = 'GET', data = null) {
    try {
        const response = await fetch(`/api/notion/${endpoint}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : null
        });
        
        if (!response.ok) {
            throw new Error('Notion API 호출 실패');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Notion API 에러:', error);
        return null;
    }
}

// 노션 데이터베이스에 문의 저장
async function saveInquiryToNotion(formData) {
    const loadingBtn = document.querySelector('.btn-submit');
    loadingBtn.classList.add('loading');
    
    try {
        const result = await fetchNotionData('inquiries', 'POST', formData);
        
        if (result && result.success) {
            showNotification('문의가 성공적으로 접수되었습니다!', 'success');
            document.querySelector('.contact-form').reset();
        } else {
            throw new Error('저장 실패');
        }
    } catch (error) {
        console.error('문의 저장 오류:', error);
        showNotification('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
        loadingBtn.classList.remove('loading');
    }
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} slide-in-right`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 다크모드 토글
function initDarkMode() {
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '🌙';
    darkModeToggle.setAttribute('aria-label', '다크모드 전환');
    
    document.body.appendChild(darkModeToggle);
    
    // 저장된 설정 확인
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '☀️';
    }
    
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        darkModeToggle.innerHTML = isDark ? '☀️' : '🌙';
    });
}

// 로딩 상태 표시
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.innerHTML = '<div class="loader-modern"></div>';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loader-overlay');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 300);
    }
}

// 초기화 함수
document.addEventListener('DOMContentLoaded', () => {
    console.log('모던 인터랙션 초기화 시작');
    
    // 기본 기능 초기화
    createParticles();
    handleScrollHeader();
    initScrollReveal();
    init3DCards();
    initRippleEffect();
    initDarkMode();
    
    // 히어로 타이핑 효과
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 80);
    }
    
    // 통계 카운터 애니메이션
    const counters = document.querySelectorAll('.stat-number-modern');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        animateCounter(counter, target);
    });
    
    // 스무스 스크롤 링크 처리
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = anchor.getAttribute('href');
            smoothScrollTo(target);
        });
    });
    
    // 문의 폼 처리
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('문의 폼 제출');
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            await saveInquiryToNotion(data);
        });
    }
    
    console.log('모던 인터랙션 초기화 완료');
});

// 페이지 로드 완료 시 로딩 화면 제거
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.remove(), 500);
    }
});

// 다크모드 스타일
const darkModeStyles = `
    .dark-mode {
        --bg-color: #0a0a0a;
        --text-color: #e0e0e0;
        --surface-color: #1a1a1a;
        --border-color: rgba(255, 255, 255, 0.1);
    }
    
    .dark-mode body {
        background: var(--bg-color);
        color: var(--text-color);
    }
    
    .dark-mode .glass-effect {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--border-color);
    }
    
    .dark-mode .modern-header {
        background: rgba(26, 26, 26, 0.9);
    }
    
    .dark-mode .service-card-3d {
        background: rgba(255, 255, 255, 0.03);
    }
    
    .dark-mode .input-modern {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-color);
        border-color: var(--border-color);
    }
    
    .dark-mode .btn-modern {
        background: var(--primary-gradient);
        color: white;
    }
    
    .dark-mode-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .dark-mode-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
    }
    
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 10px;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        z-index: 2000;
        font-weight: 500;
    }
    
    .notification.success {
        border-color: #4caf50;
        color: #4caf50;
    }
    
    .notification.error {
        border-color: #f44336;
        color: #f44336;
    }
    
    .notification.info {
        border-color: #2196f3;
        color: #2196f3;
    }
    
    .fade-out {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .loader-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }
`;

// 다크모드 스타일 주입
const styleSheet = document.createElement('style');
styleSheet.textContent = darkModeStyles;
document.head.appendChild(styleSheet);