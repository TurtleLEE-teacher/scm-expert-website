/**
 * Notion 후기 데이터 동적 렌더링
 * data/reviews.json에서 후기를 로드하여 표시
 */

(function() {
    'use strict';

    const REVIEWS_JSON_PATH = './data/reviews.json';
    const STAR_SVG = '<svg viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>';

    // 별점 HTML 생성
    function createStarsHtml(rating) {
        const count = Math.min(Math.max(rating || 5, 1), 5);
        return '<div class="review-stars">' + STAR_SVG.repeat(count) + '</div>';
    }

    // 후기 카드 HTML 생성
    function createReviewCard(review, isSlide = false) {
        const starsHtml = createStarsHtml(review.rating);
        const dateStr = review.date || '';
        const authorName = review.author || '수강생';
        const content = review.content || '';

        return `
            <div class="review-card${isSlide ? ' fade-up' : ''}">
                ${starsHtml}
                <p>"${content}"</p>
                <span class="review-author">${authorName}${dateStr ? `<span class="review-badge">${dateStr}</span>` : ''}</span>
            </div>
        `;
    }

    // 컨설팅 후기 렌더링 (그리드 형태)
    function renderConsultingReviews(reviews) {
        const container = document.getElementById('consultingReviews');
        if (!container) return;

        // 컨설팅 카테고리 우선 표시, 없으면 모든 후기 표시
        let consultingReviews = reviews.filter(r => r.category === 'consulting');

        // 컨설팅 후기가 없으면 모든 후기 표시
        if (consultingReviews.length === 0) {
            console.log('컨설팅 후기가 없어 모든 후기를 표시합니다.');
            consultingReviews = reviews;
        }

        if (consultingReviews.length === 0) {
            container.innerHTML = '<div class="reviews-empty">아직 등록된 후기가 없습니다.</div>';
            return;
        }

        const cardsHtml = consultingReviews.slice(0, 6).map(r => createReviewCard(r, true)).join('');
        container.innerHTML = cardsHtml;
    }

    // 부트캠프 후기 렌더링 (슬라이드 형태)
    function renderBootcampReviews(reviews) {
        const container = document.getElementById('reviewsTrack');
        const expandedContainer = document.getElementById('reviewsGridExpanded');
        const expandBtn = document.getElementById('reviewsExpandBtn');

        if (!container) return;

        // 부트캠프 카테고리 우선 표시, 없으면 모든 후기 표시
        let bootcampReviews = reviews.filter(r => r.category === 'bootcamp' || !r.category);

        // 부트캠프 후기가 없으면 모든 후기 표시
        if (bootcampReviews.length === 0) {
            console.log('부트캠프 후기가 없어 모든 후기를 표시합니다.');
            bootcampReviews = reviews;
        }

        if (bootcampReviews.length === 0) {
            container.innerHTML = '<div class="reviews-empty">아직 등록된 후기가 없습니다.</div>';
            return;
        }

        // 슬라이드에 표시할 후기 (최대 15개)
        const slideReviews = bootcampReviews.slice(0, 15);
        const slideCardsHtml = slideReviews.map(r => createReviewCard(r, true)).join('');
        container.innerHTML = slideCardsHtml;

        // 15개 이상이면 더보기 버튼 표시
        if (bootcampReviews.length > 15 && expandedContainer && expandBtn) {
            const remainingReviews = bootcampReviews.slice(15);
            const expandedCardsHtml = remainingReviews.map(r => createReviewCard(r, false)).join('');
            expandedContainer.innerHTML = expandedCardsHtml;
            expandBtn.style.display = 'block';

            // 더보기 버튼 이벤트
            expandBtn.onclick = function() {
                expandedContainer.classList.toggle('show');
                this.classList.toggle('expanded');
                this.querySelector('span').textContent =
                    expandedContainer.classList.contains('show') ? '접기' : '후기 전체보기';
            };
        }

        // 무한 스크롤 애니메이션 시작
        initInfiniteScroll();
    }

    // 통계 업데이트
    function updateStats(reviews) {
        const countEl = document.getElementById('reviewsCount');
        const ratingEl = document.getElementById('reviewsRating');

        if (countEl) {
            countEl.textContent = reviews.length > 0 ? `${reviews.length}+` : '-';
        }

        if (ratingEl && reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length;
            ratingEl.textContent = avgRating.toFixed(1);
        }
    }

    // 무한 스크롤 애니메이션
    function initInfiniteScroll() {
        const track = document.getElementById('reviewsTrack');
        if (!track || track.dataset.initialized) return;

        const cards = Array.from(track.children);
        if (cards.length < 2) return;

        // 카드 복제하여 무한 스크롤 효과
        const originalHTML = track.innerHTML;
        track.innerHTML = originalHTML + originalHTML;

        // 모든 카드에 visible 클래스 추가
        track.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));

        // 초기화 완료 표시
        track.dataset.initialized = 'true';

        let scrollPos = 0;
        const speed = 1;
        let isPaused = false;

        function animate() {
            if (!isPaused) {
                scrollPos += speed;
                const halfWidth = track.scrollWidth / 2;
                if (scrollPos >= halfWidth) {
                    scrollPos = 0;
                }
                track.style.transform = `translateX(-${scrollPos}px)`;
            }
            requestAnimationFrame(animate);
        }

        // 호버 시 일시정지
        track.addEventListener('mouseenter', () => { isPaused = true; });
        track.addEventListener('mouseleave', () => { isPaused = false; });

        // 애니메이션 시작
        requestAnimationFrame(animate);
    }

    // 후기 데이터 로드
    async function loadReviews() {
        try {
            const response = await fetch(REVIEWS_JSON_PATH);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const reviews = data.data || [];

            if (reviews.length === 0) {
                // 데이터가 없을 때 빈 상태 표시
                showEmptyState();
                return;
            }

            renderConsultingReviews(reviews);
            renderBootcampReviews(reviews);
            updateStats(reviews);

        } catch (error) {
            console.warn('후기 데이터 로드 실패:', error);
            showEmptyState();
        }
    }

    // 빈 상태 표시
    function showEmptyState() {
        const consultingContainer = document.getElementById('consultingReviews');
        const bootcampContainer = document.getElementById('reviewsTrack');
        const countEl = document.getElementById('reviewsCount');
        const ratingEl = document.getElementById('reviewsRating');

        const emptyHtml = '<div class="reviews-empty">후기 데이터를 불러오는 중입니다...</div>';

        if (consultingContainer) consultingContainer.innerHTML = emptyHtml;
        if (bootcampContainer) bootcampContainer.innerHTML = emptyHtml;
        if (countEl) countEl.textContent = '-';
        if (ratingEl) ratingEl.textContent = '-';
    }

    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadReviews);
    } else {
        loadReviews();
    }
})();
