// SCM Expert 모던 JavaScript - 디자인 업그레이드 버전

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SCM Expert 사이트 초기화');
    
    // 모든 초기화 함수 실행
    initializeAnimations();
    initializeScrollEffects();
    initializeDarkMode();
    initializeInteractiveElements();
    initializeFormEffects();
    initializeParallax();
    initializeTypewriter();
    initializeCounters();
});

// 스크롤 애니메이션 초기화
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // 특별한 애니메이션 효과
                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
                
                if (entry.target.classList.contains('progress-bar')) {
                    animateProgressBar(entry.target);
                }
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들 관찰
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
    animatedElements.forEach(el => observer.observe(el));
}

// 스크롤 효과
function initializeScrollEffects() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // 헤더 스크롤 효과
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // 패럴랙스 효과
        updateParallax(currentScroll);
        
        // 스크롤 방향 감지
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('scroll-down');
        } else {
            header.classList.remove('scroll-down');
        }
        
        lastScroll = currentScroll;
    });
}

// 다크모드 초기화
function initializeDarkMode() {
    // 다크모드 토글 버튼 생성
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '🌙';
    darkModeToggle.setAttribute('aria-label', '다크모드 토글');
    document.body.appendChild(darkModeToggle);
    
    // 저장된 테마 확인
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = '☀️';
    }
    
    // 토글 이벤트
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        darkModeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        
        // 트랜지션 효과
        darkModeToggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            darkModeToggle.style.transform = 'scale(1.1)';
        }, 150);
        setTimeout(() => {
            darkModeToggle.style.transform = 'scale(1)';
        }, 300);
        
        console.log(`🎨 테마 변경: ${newTheme}`);
    });
}

// 인터랙티브 요소 초기화
function initializeInteractiveElements() {
    // 서비스 카드 3D 효과
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
    
    // 버튼 리플 효과
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
            
            console.log(`🔘 버튼 클릭: ${this.textContent}`);
        });
    });
    
    // FAQ 아코디언
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            
            // 다른 FAQ 닫기
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('open');
                }
            });
            
            // 현재 FAQ 토글
            item.classList.toggle('open');
            
            // 애니메이션
            if (!isOpen) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
            
            console.log(`❓ FAQ 토글: ${question.textContent.trim()}`);
        });
    });
}

// 폼 효과 초기화
function initializeFormEffects() {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea, select');
        const label = group.querySelector('label');
        
        if (input) {
            // 포커스 효과
            input.addEventListener('focus', () => {
                group.classList.add('focused');
                console.log(`📝 폼 포커스: ${input.name || input.id}`);
            });
            
            input.addEventListener('blur', () => {
                group.classList.remove('focused');
                if (input.value) {
                    group.classList.add('has-value');
                } else {
                    group.classList.remove('has-value');
                }
            });
            
            // 입력 효과
            input.addEventListener('input', () => {
                if (input.value) {
                    group.classList.add('has-value');
                } else {
                    group.classList.remove('has-value');
                }
            });
        }
    });
    
    // 폼 제출 효과
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.innerHTML = '<span class="loading-spinner"></span> 처리중...';
            }
            console.log(`📮 폼 제출: ${this.id || '익명 폼'}`);
        });
    });
}

// 패럴랙스 효과
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// 타이핑 효과
function initializeTypewriter() {
    const typewriterElements = document.querySelectorAll('[data-typewriter]');
    
    typewriterElements.forEach(element => {
        const text = element.textContent;
        const speed = element.dataset.typewriterSpeed || 100;
        element.textContent = '';
        element.style.visibility = 'visible';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        };
        
        // 요소가 화면에 보일 때 시작
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                typeWriter();
                observer.disconnect();
            }
        });
        
        observer.observe(element);
    });
}

// 카운터 애니메이션
function animateCounter(element) {
    const target = parseInt(element.dataset.target || element.textContent);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
}

// 프로그레스 바 애니메이션
function animateProgressBar(element) {
    const target = element.dataset.progress || 0;
    element.style.width = '0%';
    
    setTimeout(() => {
        element.style.width = target + '%';
    }, 100);
}

// 패럴랙스 업데이트
function updateParallax(scrollPosition) {
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrollPosition * 0.5}px)`;
    }
}

// 스무스 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            console.log(`📍 스크롤 이동: ${this.getAttribute('href')}`);
        }
    });
});

// 모바일 메뉴 토글
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        // 햄버거 메뉴 애니메이션
        const spans = navToggle.querySelectorAll('span');
        if (navToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'rotate(0) translate(0, 0)';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'rotate(0) translate(0, 0)';
        }
        
        console.log(`📱 모바일 메뉴 토글: ${navToggle.classList.contains('active') ? '열림' : '닫힘'}`);
    });
}

// 토스트 알림 함수
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'i'}</div>
        <div class="toast-message">${message}</div>
    `;
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => toast.classList.add('show'), 100);
    
    // 자동 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    console.log(`💬 토스트 알림 (${type}): ${message}`);
}

// 전역 함수로 노출
window.showToast = showToast;

// 페이지 로드 완료 시
window.addEventListener('load', () => {
    // 로딩 화면 제거
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 500);
    }
    
    // 페이지 트랜지션
    document.body.classList.add('page-transition');
    
    console.log('✅ 페이지 로드 완료');
});

// 마우스 커서 효과
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.addEventListener('mousedown', () => cursor.classList.add('click'));
document.addEventListener('mouseup', () => cursor.classList.remove('click'));

// 링크 호버 시 커서 확대
document.querySelectorAll('a, button').forEach(element => {
    element.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    element.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});