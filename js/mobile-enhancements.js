/**
 * 모바일 UI/UX 개선 스크립트
 * 터치 피드백, 햅틱 반응, 로딩 상태 관리
 */

class MobileEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.addTouchFeedback();
        this.addHapticFeedback();
        this.addLoadingStates();
        // this.addKeyboardHandling(); // 스크롤 간섭 방지 위해 비활성화
        // this.addSwipeGestures(); // 스크롤 간섭 방지 위해 비활성화
    }

    // 터치 피드백 개선
    addTouchFeedback() {
        const touchableElements = document.querySelectorAll('.btn, .card, .nav-item, .testimonial-card');
        
        touchableElements.forEach(element => {
            element.addEventListener('touchstart', (e) => {
                element.style.transform = 'scale(0.95)';
                element.style.filter = 'brightness(0.9)';
                element.style.transition = 'all 0.1s ease';
            }, { passive: true });

            element.addEventListener('touchend', (e) => {
                setTimeout(() => {
                    element.style.transform = '';
                    element.style.filter = '';
                    element.style.transition = 'all 0.3s ease';
                }, 100);
            }, { passive: true });

            element.addEventListener('touchcancel', (e) => {
                element.style.transform = '';
                element.style.filter = '';
            }, { passive: true });
        });
    }

    // 햅틱 피드백 (진동)
    addHapticFeedback() {
        const buttons = document.querySelectorAll('.btn, button[type="submit"]');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                // 가벼운 진동 (안드로이드)
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
                
                // iOS 햅틱 피드백 시뮬레이션
                if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
                    this.simulateHaptic(button);
                }
            }, { passive: true });
        });
    }

    simulateHaptic(element) {
        // 시각적 햅틱 피드백 시뮬레이션
        element.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.8)';
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 150);
    }

    // 로딩 상태 관리
    addLoadingStates() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"], .btn-primary');
                if (submitBtn) {
                    this.showLoadingState(submitBtn);
                }
            });
        });

        // AJAX 요청이나 페이지 이동 시 로딩
        const links = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"])');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                this.showLoadingState(link);
            });
        });
    }

    showLoadingState(element) {
        const originalText = element.textContent;
        element.innerHTML = `
            <span class="loading-spinner"></span>
            <span>로딩중...</span>
        `;
        element.disabled = true;
        element.style.opacity = '0.7';

        // 3초 후 원복 (실제로는 페이지 이동이나 응답에 따라 처리)
        setTimeout(() => {
            element.innerHTML = originalText;
            element.disabled = false;
            element.style.opacity = '1';
        }, 3000);
    }

    // 가상 키보드 핸들링 (스크롤 간섭 최소화)
    addKeyboardHandling() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // 포커스 시 자동 스크롤 제거 (사용자가 직접 스크롤하도록)
            // input.addEventListener('focus', (e) => {
            //     setTimeout(() => {
            //         e.target.scrollIntoView({ 
            //             behavior: 'smooth', 
            //             block: 'center',
            //             inline: 'nearest'
            //         });
            //     }, 300);
            // });

            // iOS에서 확대 방지만 유지
            input.addEventListener('touchstart', (e) => {
                if (input.style.fontSize !== '16px') {
                    input.style.fontSize = '16px';
                }
            }, { passive: true });
        });

        // 뷰포트 변화 감지 비활성화 (스크롤 위치 간섭 방지)
        // 대신 CSS의 100dvh와 env(keyboard-inset-height) 사용
        /*
        let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                const currentHeight = window.visualViewport.height;
                const heightDiff = initialViewportHeight - currentHeight;
                
                if (heightDiff > 150) {
                    document.body.style.paddingBottom = `${heightDiff}px`;
                } else {
                    document.body.style.paddingBottom = '0';
                }
            });
        }
        */
    }

    // 스와이프 제스처 추가
    addSwipeGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });
    }

    handleSwipe() {
        const swipeThreshold = 100;
        const swipeX = touchEndX - touchStartX;
        const swipeY = touchEndY - touchStartY;

        // 수평 스와이프가 수직 스와이프보다 클 때만 처리
        if (Math.abs(swipeX) > Math.abs(swipeY)) {
            if (swipeX > swipeThreshold) {
                // 오른쪽 스와이프
                this.handleRightSwipe();
            } else if (swipeX < -swipeThreshold) {
                // 왼쪽 스와이프
                this.handleLeftSwipe();
            }
        }
    }

    handleRightSwipe() {
        // 이전 페이지나 메뉴 열기 등
        // 네비게이션이 닫혀있으면 열기
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        
        if (navMenu && hamburger && !navMenu.classList.contains('active')) {
            hamburger.click();
        }
    }

    handleLeftSwipe() {
        // 다음 페이지나 메뉴 닫기 등
        // 네비게이션이 열려있으면 닫기
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        
        if (navMenu && hamburger && navMenu.classList.contains('active')) {
            hamburger.click();
        }
    }
}

// 로딩 스피너 CSS 추가
const loadingCSS = `
.loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 0.8s ease-in-out infinite;
    margin-right: 8px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* 스켈레톤 로딩 */
.skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading-skeleton 1.5s infinite;
    border-radius: 4px;
}

@keyframes loading-skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
`;

// CSS 스타일 동적 추가
const style = document.createElement('style');
style.textContent = loadingCSS;
document.head.appendChild(style);

// 모바일 향상 기능 초기화
document.addEventListener('DOMContentLoaded', () => {
    new MobileEnhancer();
});

// 터치 스와이프를 위한 전역 변수
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;