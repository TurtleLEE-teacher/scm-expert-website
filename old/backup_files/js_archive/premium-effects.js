/* Premium Effects JavaScript - 2025 */

// Particle Background Effect
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particleContainer.appendChild(particle);
    }
}

// Scroll Animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.scroll-fade-in, .scroll-scale-up, .scroll-slide-left, .scroll-slide-right');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Magnetic Hover Effect
function magneticHover() {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            elem.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        elem.addEventListener('mouseleave', () => {
            elem.style.transform = 'translate(0, 0)';
        });
    });
}

// Create Morphing Shapes
function createMorphingShapes() {
    const shapes = [
        { size: '300px', top: '10%', left: '5%', delay: '0s' },
        { size: '200px', top: '60%', right: '10%', delay: '5s' },
        { size: '250px', bottom: '20%', left: '30%', delay: '10s' }
    ];
    
    shapes.forEach(shape => {
        const morphShape = document.createElement('div');
        morphShape.className = 'morph-shape';
        morphShape.style.width = shape.size;
        morphShape.style.height = shape.size;
        morphShape.style.animationDelay = shape.delay;
        
        Object.keys(shape).forEach(key => {
            if (key !== 'size' && key !== 'delay') {
                morphShape.style[key] = shape[key];
            }
        });
        
        document.body.appendChild(morphShape);
    });
}

// 3D Card Tilt Effect
function card3DTilt() {
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Blob Animation
function createBlobs() {
    const blobContainer = document.createElement('div');
    blobContainer.style.position = 'fixed';
    blobContainer.style.top = '0';
    blobContainer.style.left = '0';
    blobContainer.style.width = '100%';
    blobContainer.style.height = '100%';
    blobContainer.style.pointerEvents = 'none';
    blobContainer.style.zIndex = '-2';
    document.body.appendChild(blobContainer);
    
    for (let i = 0; i < 3; i++) {
        const blob = document.createElement('div');
        blob.className = 'blob';
        blob.style.width = (200 + Math.random() * 200) + 'px';
        blob.style.height = blob.style.width;
        blob.style.left = Math.random() * 100 + '%';
        blob.style.top = Math.random() * 100 + '%';
        blob.style.animationDelay = i * 3 + 's';
        blobContainer.appendChild(blob);
    }
}

// Enhanced Preloader
function enhancePreloader() {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        // Replace existing loader with premium loader
        const loader = preloader.querySelector('.loader-modern');
        if (loader) {
            loader.className = 'loader-premium';
        }
        
        // Add fade out effect
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.pointerEvents = 'none';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 1000);
        });
    }
}

// Glitch Effect for Headers
function addGlitchEffect() {
    const headers = document.querySelectorAll('h1, h2');
    headers.forEach(header => {
        if (!header.classList.contains('glitch')) {
            header.setAttribute('data-text', header.textContent);
        }
    });
}

// Smooth Scroll with Offset
function smoothScrollWithOffset() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 100; // Header height
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Add Classes to Elements
function enhanceElements() {
    // Add glass-ultra class to cards
    document.querySelectorAll('.bento-card').forEach(card => {
        card.classList.add('glass-ultra');
        card.classList.add('card-3d');
        card.classList.add('hover-card');
    });
    
    // Add scroll animations to sections
    document.querySelectorAll('section').forEach((section, index) => {
        if (index % 2 === 0) {
            section.classList.add('scroll-fade-in');
        } else {
            section.classList.add('scroll-scale-up');
        }
    });
    
    // Add magnetic effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.add('magnetic');
    });
    
    // Add gradient text animation to titles
    document.querySelectorAll('.gradient-text').forEach(text => {
        text.classList.add('gradient-text-animated');
    });
    
    // Replace buttons with glow buttons
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.classList.add('btn-glow');
    });
    
    // Add floating animation to stats
    document.querySelectorAll('.stat-item').forEach((stat, index) => {
        stat.classList.add('floating');
        stat.style.animationDelay = index * 0.5 + 's';
    });
}

// Initialize all effects
function initPremiumEffects() {
    createParticles();
    createMorphingShapes();
    createBlobs();
    enhancePreloader();
    addGlitchEffect();
    smoothScrollWithOffset();
    enhanceElements();
    
    // Initialize interactions after DOM content loaded
    handleScrollAnimations();
    magneticHover();
    card3DTilt();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumEffects);
} else {
    initPremiumEffects();
}

// Export functions for external use
window.premiumEffects = {
    createParticles,
    handleScrollAnimations,
    magneticHover,
    card3DTilt,
    createBlobs,
    createMorphingShapes
};