/**
 * 후기 시스템 동적 관리
 * testimonials.json 데이터를 기반으로 후기를 동적 렌더링
 */

class TestimonialSystem {
    constructor() {
        this.testimonials = [];
        this.loadedCategories = new Set();
        this.currentPage = {};
        this.itemsPerPage = 6;
        this.init();
    }

    async init() {
        try {
            await this.loadTestimonials();
            this.setupEventListeners();
        } catch (error) {
            // 에러 발생 시 조용히 실패 (사용자 경험 유지)
        }
    }

    /**
     * 후기 데이터 로드
     */
    async loadTestimonials() {
        try {
            const response = await fetch('./data/testimonials.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.testimonials = data.testimonials || [];
        } catch (error) {
            // 데이터 로드 실패 시 빈 배열로 초기화
            this.testimonials = [];
        }
    }

    /**
     * 카테고리별 후기 필터링
     */
    getTestimonialsByCategory(category, featuredOnly = false, limit = null) {
        let filtered = this.testimonials.filter(testimonial => {
            const categoryMatch = testimonial.category === category;
            const featuredMatch = !featuredOnly || testimonial.featured;
            return categoryMatch && featuredMatch;
        });

        // 날짜순 정렬 (최신순)
        filtered.sort((a, b) => b.date.localeCompare(a.date));

        if (limit) {
            filtered = filtered.slice(0, limit);
        }

        return filtered;
    }

    /**
     * 후기 카드 HTML 생성
     */
    renderTestimonialCard(testimonial) {
        const rating = '⭐'.repeat(testimonial.rating || 5);
        const achievement = testimonial.achievement || '';
        const company = testimonial.company || '';
        
        const companyText = company ? ` - ${company}` : '';
        const achievementBadge = achievement ? 
            `<span class="achievement-badge">${achievement}</span>` : '';
        
        return `
        <div class="testimonial-card card fade-in" data-category="${testimonial.category}" data-date="${testimonial.date}">
            <div class="testimonial-header">
                <div class="testimonial-rating">${rating}</div>
                <div class="testimonial-date">${this.formatDate(testimonial.date)}</div>
            </div>
            <div class="testimonial-content">
                <p class="testimonial-text">${testimonial.content}</p>
            </div>
            <div class="testimonial-author">
                <strong>${testimonial.name}님</strong>
                <span class="testimonial-title">${testimonial.title}${companyText}</span>
                ${achievementBadge}
            </div>
        </div>`;
    }

    /**
     * 특정 카테고리의 후기 섹션 렌더링
     */
    renderTestimonialSection(containerId, category, initialLimit = 6) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`후기 컨테이너를 찾을 수 없습니다: ${containerId}`);
            return;
        }

        const testimonials = this.getTestimonialsByCategory(category);
        
        if (testimonials.length === 0) {
            container.innerHTML = '<div class="no-testimonials">아직 후기가 없습니다.</div>';
            return;
        }

        // 초기 표시할 후기들
        const initialTestimonials = testimonials.slice(0, initialLimit);
        this.currentPage[category] = initialLimit;

        let html = '<div class="testimonials-grid">';
        initialTestimonials.forEach(testimonial => {
            html += this.renderTestimonialCard(testimonial);
        });
        html += '</div>';

        // 더보기 버튼
        if (testimonials.length > initialLimit) {
            const remaining = testimonials.length - initialLimit;
            html += `
            <div class="testimonials-load-more">
                <button class="btn btn-secondary load-more-btn" 
                        data-category="${category}" 
                        data-container="${containerId}">
                    더 많은 후기 보기 (+${remaining}개)
                </button>
            </div>`;
        }

        container.innerHTML = html;
        this.loadedCategories.add(category);

        // 애니메이션 트리거
        setTimeout(() => {
            container.querySelectorAll('.testimonial-card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 150);
            });
        }, 100);
    }

    /**
     * 더보기 기능
     */
    loadMoreTestimonials(category, containerId) {
        const container = document.getElementById(containerId);
        const grid = container.querySelector('.testimonials-grid');
        
        if (!grid) return;

        const allTestimonials = this.getTestimonialsByCategory(category);
        const currentCount = this.currentPage[category] || 3;
        const newCount = Math.min(currentCount + 3, allTestimonials.length);
        
        // 새로운 후기들 추가
        for (let i = currentCount; i < newCount; i++) {
            const cardHtml = this.renderTestimonialCard(allTestimonials[i]);
            const cardElement = document.createElement('div');
            cardElement.innerHTML = cardHtml;
            const card = cardElement.firstElementChild;
            
            // 애니메이션을 위한 초기 상태
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            grid.appendChild(card);
            
            // 애니메이션 트리거
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, (i - currentCount) * 150);
        }

        this.currentPage[category] = newCount;

        // 더보기 버튼 업데이트
        const loadMoreBtn = container.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            if (newCount >= allTestimonials.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                const remaining = allTestimonials.length - newCount;
                loadMoreBtn.textContent = `더 많은 후기 보기 (+${remaining}개)`;
            }
        }
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 더보기 버튼 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('load-more-btn')) {
                const category = e.target.dataset.category;
                const containerId = e.target.dataset.container;
                this.loadMoreTestimonials(category, containerId);
            }
        });

        // 후기 카드 호버 효과
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('testimonial-card')) {
                e.target.style.transform = 'translateY(-5px)';
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('testimonial-card')) {
                e.target.style.transform = 'translateY(0)';
            }
        }, true);
    }

    /**
     * 날짜 포맷팅
     */
    formatDate(dateStr) {
        try {
            const [year, month] = dateStr.split('-');
            return `${year}년 ${month}월`;
        } catch (error) {
            return dateStr;
        }
    }

    /**
     * 통계 정보 조회
     */
    getStatistics() {
        const stats = {
            total: this.testimonials.length,
            byCategory: {},
            averageRating: 0,
            latestDate: null
        };

        let totalRating = 0;
        let ratingCount = 0;

        this.testimonials.forEach(testimonial => {
            const category = testimonial.category;
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

            if (testimonial.rating) {
                totalRating += testimonial.rating;
                ratingCount++;
            }

            if (!stats.latestDate || testimonial.date > stats.latestDate) {
                stats.latestDate = testimonial.date;
            }
        });

        if (ratingCount > 0) {
            stats.averageRating = Math.round((totalRating / ratingCount) * 10) / 10;
        }

        return stats;
    }
}

// CSS 스타일 동적 추가
const testimonialStyles = `
<style>
.testimonials-container {
    margin: 20px 0;
}

.testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 25px;
    margin-bottom: 30px;
}

.testimonial-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 25px;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(20px);
    position: relative;
    backdrop-filter: blur(10px);
}

.testimonial-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
}

.testimonial-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.testimonial-rating {
    font-size: 1.1rem;
}

.testimonial-date {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
}

.testimonial-content {
    margin-bottom: 20px;
}

.testimonial-text {
    font-size: 1.1rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.9);
    font-style: italic;
    position: relative;
    padding-left: 20px;
}

.testimonial-text::before {
    content: '"';
    position: absolute;
    left: 0;
    top: -5px;
    font-size: 2rem;
    color: #667eea;
    opacity: 0.5;
}

.testimonial-author {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.testimonial-author strong {
    color: #667eea;
    font-size: 1.1rem;
}

.testimonial-title {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
}

.achievement-badge {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 4px 12px;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 8px;
    display: inline-block;
    max-width: fit-content;
}

.testimonials-load-more {
    text-align: center;
    margin-top: 30px;
}

.load-more-btn {
    padding: 12px 30px;
    background: rgba(102, 126, 234, 0.1);
    border: 2px solid #667eea;
    color: #667eea;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 600;
}

.load-more-btn:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
}

.no-testimonials {
    text-align: center;
    padding: 50px;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
}

.fade-in {
    animation: fadeInUp 0.6s ease-out forwards;
}

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

/* 모바일 최적화 - 3단계 브레이크포인트 */
@media (max-width: 768px) {
    .testimonials-grid {
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 0 10px;
    }
    
    .testimonial-card {
        padding: 18px;
        margin-bottom: 10px;
    }
    
    .testimonial-text {
        font-size: 0.95rem;
        line-height: 1.6;
        padding-left: 15px;
    }
    
    .testimonial-header {
        margin-bottom: 12px;
    }
    
    .testimonial-rating {
        font-size: 1rem;
    }
    
    .achievement-badge {
        font-size: 0.75rem;
        padding: 3px 10px;
    }
    
    .load-more-btn {
        padding: 14px 25px;
        font-size: 0.9rem;
        min-height: 44px;
    }
}

@media (max-width: 480px) {
    .testimonials-grid {
        gap: 12px;
        padding: 0 5px;
    }
    
    .testimonial-card {
        padding: 15px;
        border-radius: 12px;
    }
    
    .testimonial-text {
        font-size: 0.9rem;
        line-height: 1.5;
        padding-left: 12px;
    }
    
    .testimonial-text::before {
        font-size: 1.5rem;
        top: -3px;
    }
    
    .testimonial-author strong {
        font-size: 1rem;
    }
    
    .testimonial-title {
        font-size: 0.85rem;
    }
    
    .achievement-badge {
        font-size: 0.7rem;
        padding: 2px 8px;
        margin-top: 6px;
    }
    
    .load-more-btn {
        padding: 16px 20px;
        font-size: 0.85rem;
        width: 100%;
        max-width: 280px;
        margin: 0 auto;
        display: block;
    }
}

@media (max-width: 360px) {
    .testimonial-card {
        padding: 12px;
        border-radius: 10px;
    }
    
    .testimonial-text {
        font-size: 0.85rem;
        line-height: 1.4;
        padding-left: 10px;
    }
    
    .testimonial-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
        margin-bottom: 10px;
    }
    
    .testimonial-content {
        margin-bottom: 15px;
    }
    
    .testimonial-author {
        gap: 3px;
    }
    
    .testimonial-author strong {
        font-size: 0.95rem;
    }
    
    .testimonial-title {
        font-size: 0.8rem;
    }
    
    .achievement-badge {
        font-size: 0.65rem;
        padding: 2px 6px;
        margin-top: 4px;
    }
}
</style>
`;

// 페이지 로드 시 스타일 추가
if (!document.head.querySelector('style[data-testimonials]')) {
    document.head.insertAdjacentHTML('beforeend', testimonialStyles.replace('<style>', '<style data-testimonials>'));
}

// 전역 인스턴스 생성
let testimonialSystem;

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        testimonialSystem = new TestimonialSystem();
    });
} else {
    testimonialSystem = new TestimonialSystem();
}

// 전역 함수들 (HTML에서 직접 호출 가능)
window.loadTestimonials = function(containerId, category, limit = 6) {
    if (testimonialSystem) {
        testimonialSystem.renderTestimonialSection(containerId, category, limit);
    }
};

window.getTestimonialStats = function() {
    return testimonialSystem ? testimonialSystem.getStatistics() : null;
};

// TestimonialSystem 클래스에 렌더링 메서드 추가
TestimonialSystem.prototype.renderTestimonialSection = function(containerId, category, initialLimit = 6) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`후기 컨테이너를 찾을 수 없습니다: ${containerId}`);
        return;
    }

    const testimonials = this.getTestimonialsByCategory(category);
    
    if (testimonials.length === 0) {
        container.innerHTML = '<div class="no-testimonials">아직 후기가 없습니다.</div>';
        return;
    }

    // 초기 표시할 후기들
    const initialTestimonials = testimonials.slice(0, initialLimit);
    this.currentPage[category] = initialLimit;

    let html = '<div class="testimonials-grid">';
    initialTestimonials.forEach(testimonial => {
        html += this.renderTestimonialCard(testimonial);
    });
    html += '</div>';

    // 더보기 버튼
    if (testimonials.length > initialLimit) {
        const remaining = testimonials.length - initialLimit;
        html += `
        <div class="testimonials-load-more">
            <button class="btn btn-secondary load-more-btn" 
                    data-category="${category}" 
                    data-container="${containerId}">
                더 많은 후기 보기 (+${remaining}개)
            </button>
        </div>`;
    }

    container.innerHTML = html;
    this.loadedCategories.add(category);

    // 애니메이션 트리거
    setTimeout(() => {
        container.querySelectorAll('.testimonial-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }, 100);
};

TestimonialSystem.prototype.renderTestimonialCard = function(testimonial) {
    const rating = '⭐'.repeat(testimonial.rating || 5);
    const achievement = testimonial.achievement || '';
    const company = testimonial.company || '';
    
    const companyText = company ? ` - ${company}` : '';
    const achievementBadge = achievement ? 
        `<span class="achievement-badge">${achievement}</span>` : '';
    
    return `
    <div class="testimonial-card card fade-in" data-category="${testimonial.category}" data-date="${testimonial.date}">
        <div class="testimonial-header">
            <div class="testimonial-rating">${rating}</div>
            <div class="testimonial-date">${this.formatDate(testimonial.date)}</div>
        </div>
        <div class="testimonial-content">
            <p class="testimonial-text">${testimonial.content}</p>
        </div>
        <div class="testimonial-author">
            <strong>${testimonial.name}님</strong>
            <span class="testimonial-title">${testimonial.title}${companyText}</span>
            ${achievementBadge}
        </div>
    </div>`;
};

TestimonialSystem.prototype.loadMoreTestimonials = function(category, containerId) {
    const container = document.getElementById(containerId);
    const grid = container.querySelector('.testimonials-grid');
    
    if (!grid) return;

    const allTestimonials = this.getTestimonialsByCategory(category);
    const currentCount = this.currentPage[category] || 3;
    const newCount = Math.min(currentCount + 3, allTestimonials.length);
    
    // 새로운 후기들 추가
    for (let i = currentCount; i < newCount; i++) {
        const cardHtml = this.renderTestimonialCard(allTestimonials[i]);
        const cardElement = document.createElement('div');
        cardElement.innerHTML = cardHtml;
        const card = cardElement.firstElementChild;
        
        // 애니메이션을 위한 초기 상태
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        grid.appendChild(card);
        
        // 애니메이션 트리거
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, (i - currentCount) * 150);
    }

    this.currentPage[category] = newCount;

    // 더보기 버튼 업데이트
    const loadMoreBtn = container.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        if (newCount >= allTestimonials.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            const remaining = allTestimonials.length - newCount;
            loadMoreBtn.textContent = `더 많은 후기 보기 (+${remaining}개)`;
        }
    }
};

TestimonialSystem.prototype.formatDate = function(dateStr) {
    try {
        const [year, month] = dateStr.split('-');
        return `${year}년 ${month}월`;
    } catch (error) {
        return dateStr;
    }
};