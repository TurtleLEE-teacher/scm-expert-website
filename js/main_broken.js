// SCM Expert ë©”ì¸ JavaScript - Enhanced Interactive Version

console.log('ë©”ì¸ JavaScript ë¡œë“œ??- Enhanced Version');

// DOM ë¡œë“œ ?„ë£Œ ???¤í–‰
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ë¡œë“œ ?„ë£Œ');
    
    // ?„ë¦¬ë¡œë” ?œê±°
    setTimeout(() => {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 800);
    
    // ëª¨ë°”???¤ë¹„ê²Œì´??? ê?
    initMobileNavigation();
    
    // ?¤í¬ë¡??´ë²¤??    initScrollEvents();
    
    // ?˜ì´?œì¸ ? ë‹ˆë©”ì´??    initFadeInAnimation();
    
    // ?¤ë¬´???¤í¬ë¡?    initSmoothScroll();
    
    // ?¨ëŸ´?™ìŠ¤ ?¨ê³¼
    initParallaxEffect();
    
    // ë§ˆìš°??ì¶”ì  ?¨ê³¼
    initMouseTracking();
    
    // ?€?´í•‘ ? ë‹ˆë©”ì´??    initTypingAnimation();
    
    // ì¹´ìš´?¸ì—… ? ë‹ˆë©”ì´??    initCountUpAnimation();
    
    // ?¤í¬ëª¨ë“œ ? ê?
    initDarkModeToggle();
    
    // Bento Grid ? ë‹ˆë©”ì´??    initBentoGridAnimation();
    
    console.log('ëª¨ë“  ì´ˆê¸°???„ë£Œ');
});

// ëª¨ë°”???¤ë¹„ê²Œì´??ì´ˆê¸°??function initMobileNavigation() {
    console.log('ëª¨ë°”???¤ë¹„ê²Œì´??ì´ˆê¸°??);
    
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            console.log('?¤ë¹„ê²Œì´??? ê? ?´ë¦­');
            
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // body ?¤í¬ë¡?ë°©ì?
            document.body.classList.toggle('nav-open');
        });
        
        // ë©”ë‰´ ë§í¬ ?´ë¦­ ??ë©”ë‰´ ?«ê¸°
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                console.log('?¤ë¹„ê²Œì´??ë§í¬ ?´ë¦­:', this.textContent);
                
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('nav-open');
            });
        });
    }
}

// ?¤í¬ë¡??´ë²¤??ì´ˆê¸°??function initScrollEvents() {
    console.log('?¤í¬ë¡??´ë²¤??ì´ˆê¸°??);
    
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // ?¤ë” ?¤í???ë³€ê²?        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // ?¤í¬ë¡?ë°©í–¥ ê°ì?
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // ?„ë˜ë¡??¤í¬ë¡?            header.classList.add('hidden');
        } else {
            // ?„ë¡œ ?¤í¬ë¡?            header.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop;
    });
}

// ?˜ì´?œì¸ ? ë‹ˆë©”ì´??ì´ˆê¸°??function initFadeInAnimation() {
    console.log('?˜ì´?œì¸ ? ë‹ˆë©”ì´??ì´ˆê¸°??);
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('?”ì†Œê°€ ë·°í¬?¸ì— ì§„ì…:', entry.target.className);
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // ? ë‹ˆë©”ì´???€???”ì†Œ?¤ì— fade-in ?´ë˜??ì¶”ê? ë°?ê´€ì°??œì‘
    const animateElements = document.querySelectorAll('.service-card, .feature, .section-title');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// ?¤ë¬´???¤í¬ë¡?ì´ˆê¸°??function initSmoothScroll() {
    console.log('?¤ë¬´???¤í¬ë¡?ì´ˆê¸°??);
    
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                console.log('?¤ë¬´???¤í¬ë¡??€??', href);
                
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

// ë²„íŠ¼ ?´ë¦­ ?´ë²¤??ë¡œê¹…
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        console.log('ë²„íŠ¼ ?´ë¦­??', e.target.textContent, '- URL:', e.target.href);
    }
    
    if (e.target.classList.contains('service-link')) {
        console.log('?œë¹„??ë§í¬ ?´ë¦­??', e.target.textContent, '- URL:', e.target.href);
    }
});

// ???œì¶œ ?´ë²¤??ì²˜ë¦¬ (?¥í›„ ?¬ìš©)
function handleFormSubmit(formElement, callback) {
    console.log('???œì¶œ ?¸ë“¤???±ë¡');
    
    formElement.addEventListener('submit', function(e) {
        e.preventDefault();
        
        console.log('???œì¶œ ?œë„');
        
        const formData = new FormData(this);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        console.log('???°ì´??', data);
        
        if (callback && typeof callback === 'function') {
            callback(data, this);
        }
    });
}

// ?ëŸ¬ ì²˜ë¦¬
window.addEventListener('error', function(e) {
    console.error('JavaScript ?ëŸ¬ ë°œìƒ:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
});

// ? í‹¸ë¦¬í‹° ?¨ìˆ˜??const Utils = {
    // ?´ë©”??? íš¨??ê²€??    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = re.test(email);
        console.log('?´ë©”??? íš¨??ê²€??', email, 'ê²°ê³¼:', isValid);
        return isValid;
    },
    
    // ?„í™”ë²ˆí˜¸ ? íš¨??ê²€??    validatePhone: function(phone) {
        const re = /^[\d\-\s\(\)]+$/;
        const isValid = re.test(phone) && phone.replace(/\D/g, '').length >= 10;
        console.log('?„í™”ë²ˆí˜¸ ? íš¨??ê²€??', phone, 'ê²°ê³¼:', isValid);
        return isValid;
    },
    
    // ë¡œë”© ?¤í”¼???œì‹œ
    showLoading: function(element) {
        console.log('ë¡œë”© ?¤í”¼???œì‹œ');
        element.classList.add('loading');
        element.disabled = true;
    },
    
    // ë¡œë”© ?¤í”¼???¨ê?
    hideLoading: function(element) {
        console.log('ë¡œë”© ?¤í”¼???¨ê?');
        element.classList.remove('loading');
        element.disabled = false;
    },
    
    // ?Œë¦¼ ë©”ì‹œì§€ ?œì‹œ
    showAlert: function(message, type = 'info') {
        console.log('?Œë¦¼ ?œì‹œ:', message, '?€??', type);
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        // 3ì´????ë™ ?œê±°
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 3000);
    }
};

// ?¨ëŸ´?™ìŠ¤ ?¨ê³¼ ì´ˆê¸°??function initParallaxEffect() {
    console.log('?¨ëŸ´?™ìŠ¤ ?¨ê³¼ ì´ˆê¸°??);
    
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

// ë§ˆìš°??ì¶”ì  ?¨ê³¼
function initMouseTracking() {
    console.log('ë§ˆìš°??ì¶”ì  ?¨ê³¼ ì´ˆê¸°??);
    
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

// ?€?´í•‘ ? ë‹ˆë©”ì´??function initTypingAnimation() {
    console.log('?€?´í•‘ ? ë‹ˆë©”ì´??ì´ˆê¸°??);
    
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

// ì¹´ìš´?¸ì—… ? ë‹ˆë©”ì´??function initCountUpAnimation() {
    console.log('ì¹´ìš´?¸ì—… ? ë‹ˆë©”ì´??ì´ˆê¸°??);
    
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

// ?¤í¬ëª¨ë“œ ? ê?
function initDarkModeToggle() {
    console.log('?¤í¬ëª¨ë“œ ? ê? ì´ˆê¸°??);
    
    // ?¤í¬ëª¨ë“œ ë²„íŠ¼ ?ì„±
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '?Œ™';
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
    document.body.appendChild(darkModeToggle);
    
    // ë¡œì»¬ ?¤í† ë¦¬ì??ì„œ ?¤í¬ëª¨ë“œ ?¤ì • ?•ì¸
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '?€ï¸?;
    }
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        this.innerHTML = isDarkMode ? '?€ï¸? : '?Œ™';
        console.log('?¤í¬ëª¨ë“œ ? ê?:', isDarkMode);
    });
}

// Bento Grid ? ë‹ˆë©”ì´??ì´ˆê¸°??function initBentoGridAnimation() {
    console.log('Bento Grid ? ë‹ˆë©”ì´??ì´ˆê¸°??);
    
    const bentoBoxes = document.querySelectorAll('.bento-box');
    
    if (bentoBoxes.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                // ?œì°¨??? ë‹ˆë©”ì´?˜ì„ ?„í•œ ì§€???œê°„
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);
    
    bentoBoxes.forEach(box => {
        observer.observe(box);
    });
    
    // ?¸ë²„ ?¨ê³¼ ê°œì„ 
    bentoBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.zIndex = 'auto';
        });
    });
}

// ?„ì—­ ê°ì²´ë¡??´ë³´?´ê¸°
window.SCMExpert = {
    Utils: Utils,
    handleFormSubmit: handleFormSubmit
};

console.log('SCM Expert JavaScript ëª¨ë“ˆ ë¡œë“œ ?„ë£Œ');
