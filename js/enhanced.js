/**
 * SCM Expert Website - Enhanced JavaScript
 * 성능 최적화 및 UX 개선을 위한 통합 스크립트
 */

class SCMWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.optimizePerformance();
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // DOM 로드 완료 시
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }

        // 윈도우 로드 완료 시
        window.addEventListener('load', () => this.onWindowLoad());

        // 스크롤 이벤트 (throttled)
        window.addEventListener('scroll', this.throttle(this.onScroll.bind(this), 16));

        // 리사이즈 이벤트 (debounced)
        window.addEventListener('resize', this.debounce(this.onResize.bind(this), 250));
    }

    // DOM 준비 완료 시 실행
    onDOMReady() {
        this.initNavigation();
        this.initParticles();
        this.initScrollSpy();
        this.initLazyLoading();
        this.initContactForm();
        this.initAccessibility();
    }

    // 윈도우 로드 완료 시 실행
    onWindowLoad() {
        this.removePreloader();
        this.initIntersectionObserver();
        this.preloadCriticalResources();
    }

    // 프리로더 제거
    removePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
                document.body.classList.add('loaded');
            }, 500);
        }
    }

    // 네비게이션 초기화
    initNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const navLinks = document.querySelectorAll('.nav-link');

        // 모바일 메뉴 토글
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', (e) => {
                e.preventDefault();
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // 접근성: aria-expanded 속성 업데이트
                const isExpanded = navToggle.classList.contains('active');
                navToggle.setAttribute('aria-expanded', isExpanded);
                
                // 포커스 관리
                if (isExpanded) {
                    navMenu.querySelector('.nav-link')?.focus();
                }
            });
        }

        // 네비게이션 링크 클릭
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollTo(href);
                    
                    // 모바일 메뉴 닫기
                    if (navMenu && navToggle) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', false);
                    }
                }
            });
        });

        // ESC 키로 모바일 메뉴 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle?.classList.remove('active');
                navToggle?.setAttribute('aria-expanded', false);
                navToggle?.focus();
            }
        });
    }

    // 부드러운 스크롤
    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = document.getElementById('navbar')?.offsetHeight || 80;
            const targetPosition = element.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // 스크롤 이벤트 처리
    onScroll() {
        this.updateNavbarState();
        this.updateActiveNavLink();
    }

    // 네비게이션 바 상태 업데이트
    updateNavbarState() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            const scrollY = window.scrollY;
            navbar.classList.toggle('scrolled', scrollY > 50);
        }
    }

    // 활성 네비게이션 링크 업데이트
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const scrollY = window.scrollY;
        const headerHeight = 100;

        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight;
            const sectionHeight = section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // 파티클 애니메이션 초기화 (성능 최적화)
    initParticles() {
        const particleBg = document.getElementById('particleBg');
        if (!particleBg) return;

        // 디바이스 성능에 따라 파티클 수 조정
        const isMobile = window.innerWidth <= 768;
        const isLowEnd = navigator.hardwareConcurrency <= 2;
        const particleCount = isMobile ? 30 : isLowEnd ? 40 : 60;

        // 파티클 생성
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            fragment.appendChild(particle);
        }
        
        particleBg.appendChild(fragment);

        // 성능 모니터링
        this.monitorParticlePerformance();
    }

    // 파티클 성능 모니터링
    monitorParticlePerformance() {
        let frameCount = 0;
        let lastTime = performance.now();

        const checkFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // FPS가 30 이하이면 파티클 비활성화
                if (fps < 30) {
                    document.getElementById('particleBg')?.classList.add('low-performance');
                }
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        requestAnimationFrame(checkFPS);
    }

    // Intersection Observer 초기화
    initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // 애니메이션 대상 요소들 관찰
        document.querySelectorAll('.fade-in-up, .card, .section-title').forEach(el => {
            observer.observe(el);
        });
    }

    // 이미지 지연 로딩
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // 문의 폼 초기화
    initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            try {
                // 로딩 상태
                submitBtn.textContent = '전송 중...';
                submitBtn.disabled = true;
                
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                // 폼 검증
                if (!this.validateForm(data)) {
                    throw new Error('입력 정보를 확인해주세요.');
                }
                
                // API 호출 (실제 구현 시 백엔드 엔드포인트 연결)
                await this.submitContactForm(data);
                
                // 성공 메시지
                this.showNotification('문의가 성공적으로 전송되었습니다!', 'success');
                form.reset();
                
            } catch (error) {
                console.error('Form submission error:', error);
                this.showNotification(error.message || '전송 중 오류가 발생했습니다.', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // 폼 검증
    validateForm(data) {
        const { name, email, service, message } = data;
        
        if (!name || name.length < 2) {
            this.showNotification('이름을 2자 이상 입력해주세요.', 'error');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
            return false;
        }
        
        if (!service) {
            this.showNotification('관심 서비스를 선택해주세요.', 'error');
            return false;
        }
        
        if (!message || message.length < 10) {
            this.showNotification('문의 내용을 10자 이상 입력해주세요.', 'error');
            return false;
        }
        
        return true;
    }

    // 이메일 유효성 검사
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // 문의 폼 제출 (Notion API 연동)
    async submitContactForm(data) {
        const response = await fetch('./api/contact-form.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '서버 오류가 발생했습니다.');
        }
        
        return result;
    }

    // 알림 메시지 표시
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 접근성: role과 aria-live 속성 추가
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(notification);
        
        // 애니메이션
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 자동 제거
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // 접근성 개선
    initAccessibility() {
        // 키보드 네비게이션 개선
        this.improveKeyboardNavigation();
        
        // 고대비 모드 감지
        this.detectHighContrastMode();
        
        // 스크린 리더 지원
        this.enhanceScreenReaderSupport();
    }

    // 키보드 네비게이션 개선
    improveKeyboardNavigation() {
        // 포커스 가능한 요소들
        const focusableElements = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
        
        document.addEventListener('keydown', (e) => {
            // Tab 키 트래핑 (모달 등에서 사용)
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
            
            // Enter 키로 버튼 활성화
            if (e.key === 'Enter' && e.target.matches('.btn, .card')) {
                e.target.click();
            }
        });
    }

    // 고대비 모드 감지
    detectHighContrastMode() {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }

    // 스크린 리더 지원 강화
    enhanceScreenReaderSupport() {
        // 현재 페이지 정보 알림
        const pageTitle = document.querySelector('h1')?.textContent;
        if (pageTitle) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-label', `현재 페이지: ${pageTitle}`);
            announcement.className = 'sr-only';
            document.body.appendChild(announcement);
        }
    }

    // 성능 최적화
    optimizePerformance() {
        // 이미지 최적화
        this.optimizeImages();
        
        // 중요하지 않은 리소스 지연 로딩
        this.deferNonCriticalResources();
        
        // 메모리 누수 방지
        this.preventMemoryLeaks();
    }

    // 이미지 최적화
    optimizeImages() {
        // WebP 지원 확인 및 적용
        const supportsWebP = this.checkWebPSupport();
        
        if (supportsWebP) {
            document.querySelectorAll('img[data-webp]').forEach(img => {
                img.src = img.dataset.webp;
            });
        }
    }

    // WebP 지원 확인
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // 중요하지 않은 리소스 지연 로딩
    deferNonCriticalResources() {
        // 아이콘 폰트 지연 로딩
        setTimeout(() => {
            const iconFont = document.createElement('link');
            iconFont.rel = 'stylesheet';
            iconFont.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(iconFont);
        }, 1000);
    }

    // 메모리 누수 방지
    preventMemoryLeaks() {
        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', () => {
            // 애니메이션 정지
            document.querySelectorAll('.particle').forEach(particle => {
                particle.style.animationPlayState = 'paused';
            });
            
            // 이벤트 리스너 정리
            this.cleanup();
        });
    }

    // 정리 작업
    cleanup() {
        // 타이머 정리
        if (this.scrollTimer) clearTimeout(this.scrollTimer);
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
    }

    // 유틸리티 함수들
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    onResize() {
        // 리사이즈 시 처리
        this.updateParticleCount();
    }

    updateParticleCount() {
        const particleBg = document.getElementById('particleBg');
        if (!particleBg) return;

        const isMobile = window.innerWidth <= 768;
        const particles = particleBg.querySelectorAll('.particle');
        
        particles.forEach((particle, index) => {
            if (isMobile && index > 25) {
                particle.style.display = 'none';
            } else {
                particle.style.display = 'block';
            }
        });
    }

    initScrollSpy() {
        // 스크롤 스파이 구현
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // 스크롤 위치에 따른 네비게이션 활성화는 updateActiveNavLink에서 처리
    }

    preloadCriticalResources() {
        // 중요 리소스 사전 로딩
        const criticalImages = document.querySelectorAll('img[data-preload]');
        criticalImages.forEach(img => {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            preloadLink.href = img.src;
            document.head.appendChild(preloadLink);
        });
    }
}

// 웹사이트 초기화
new SCMWebsite();