console.log('Main JavaScript loaded');  
  
document.addEventListener('DOMContentLoaded', function() {  
    console.log('DOM ready');  
    
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
    
    const cards = document.querySelectorAll('.bento-card');  
    console.log('Found cards:', cards.length);  
    cards.forEach(function(card) {  
        card.style.transition = 'all 0.3s ease';  
        card.addEventListener('mouseenter', function() {  
            this.style.transform = 'scale(1.05)';  
        });  
        card.addEventListener('mouseleave', function() {  
            this.style.transform = 'scale(1)';  
        });  
    });  
});  
  
window.SCMExpert = { test: true }; 

// 안전망: window.load 이벤트에서도 프리로더 제거
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    if (preloader && !preloader.classList.contains('hidden')) {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}); 
