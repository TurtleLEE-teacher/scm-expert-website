/**
 * Notion 후기 데이터 동적 렌더링 (디버깅 버전)
 * data/reviews.json에서 후기를 로드하여 표시
 */

(function() {
    'use strict';

    console.log('🚀 [REVIEWS] 스크립트 시작');

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
        console.log('🔍 [CONSULTING] renderConsultingReviews 호출됨');
        console.log('   - 전체 후기 수:', reviews.length);

        const container = document.getElementById('consultingReviews');
        console.log('   - 컨테이너 찾기:', container ? '✅ 존재' : '❌ 없음!');

        if (!container) {
            console.error('❌ [CONSULTING] consultingReviews 컨테이너를 찾을 수 없습니다!');
            console.error('   - DOM이 준비되지 않았거나 HTML에 해당 ID가 없습니다.');
            return;
        }

        // 컨설팅 카테고리 우선 표시, 없으면 모든 후기 표시
        let consultingReviews = reviews.filter(r => r.category === 'consulting');
        console.log('   - 컨설팅 필터링 결과:', consultingReviews.length + '개');

        if (consultingReviews.length > 0) {
            console.log('   - 컨설팅 후기 목록:');
            consultingReviews.slice(0, 6).forEach((r, i) => {
                console.log(`     ${i+1}. ${r.author} (${r.rating}점) - category: "${r.category}"`);
            });
        }

        // 컨설팅 후기가 없으면 모든 후기 표시
        if (consultingReviews.length === 0) {
            console.warn('⚠️ [CONSULTING] 컨설팅 후기가 없어 모든 후기를 표시합니다.');
            consultingReviews = reviews;
        }

        if (consultingReviews.length === 0) {
            console.warn('⚠️ [CONSULTING] 표시할 후기가 없습니다.');
            container.innerHTML = '<div class="reviews-empty">아직 등록된 후기가 없습니다.</div>';
            return;
        }

        const displayCount = Math.min(consultingReviews.length, 6);
        console.log(`   - HTML 생성 중 (${displayCount}개 표시)`);

        try {
            const cardsHtml = consultingReviews.slice(0, 6).map(r => createReviewCard(r, true)).join('');
            console.log(`   - 생성된 HTML 길이: ${cardsHtml.length} 문자`);

            container.innerHTML = cardsHtml;

            // 🔥 FIX: fade-up 애니메이션을 즉시 visible로 만들기
            setTimeout(() => {
                container.querySelectorAll('.fade-up').forEach(card => {
                    card.classList.add('visible');
                });
                console.log('   - fade-up 애니메이션 활성화 완료');
            }, 10);

            console.log('✅ [CONSULTING] 렌더링 완료!');
            console.log('   - 컨테이너 자식 요소 수:', container.children.length);
        } catch (error) {
            console.error('❌ [CONSULTING] 렌더링 오류:', error);
        }
    }

    // 부트캠프 후기 렌더링 (기존 코드 유지, 로깅만 추가)
    function renderBootcampReviews(reviews) {
        console.log('🔍 [BOOTCAMP] renderBootcampReviews 호출됨');
        const container = document.getElementById('reviewsTrack');
        console.log('   - reviewsTrack 컨테이너:', container ? '✅ 존재' : '❌ 없음');

        if (!container) {
            console.error('❌ [BOOTCAMP] reviewsTrack 컨테이너를 찾을 수 없습니다!');
            return;
        }

        let bootcampReviews = reviews.filter(r => r.category === 'bootcamp' || !r.category);
        console.log('   - 부트캠프 필터링 결과:', bootcampReviews.length + '개');

        if (bootcampReviews.length === 0) {
            bootcampReviews = reviews;
        }

        if (bootcampReviews.length === 0) {
            container.innerHTML = '<div class="reviews-empty">아직 등록된 후기가 없습니다.</div>';
            return;
        }

        const slideReviews = bootcampReviews.slice(0, 15);
        const slideCardsHtml = slideReviews.map(r => createReviewCard(r, true)).join('');
        container.innerHTML = slideCardsHtml;

        // fade-up 애니메이션을 즉시 visible로 만들기
        setTimeout(() => {
            container.querySelectorAll('.fade-up').forEach(card => {
                card.classList.add('visible');
            });
            console.log('   - fade-up 애니메이션 활성화 완료');
        }, 10);

        console.log('✅ [BOOTCAMP] 슬라이드 렌더링 완료 (15개)');

        // 페이지네이션은 생략 (기존 코드 그대로 사용)
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

    function showEmptyState() {
        console.warn('⚠️ [EMPTY] 빈 상태 표시');
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

    // 후기 데이터 로드
    async function loadReviews() {
        console.log('📥 [LOAD] 후기 데이터 로드 시작');
        console.log('   - URL:', REVIEWS_JSON_PATH);
        console.log('   - document.readyState:', document.readyState);

        try {
            const response = await fetch(REVIEWS_JSON_PATH);
            console.log('   - HTTP Status:', response.status, response.ok ? '✅' : '❌');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const reviews = data.data || [];

            console.log('✅ [LOAD] 데이터 로드 성공');
            console.log('   - 총 후기 수:', reviews.length);
            console.log('   - lastUpdated:', data.lastUpdated);

            // 카테고리별 분포 확인
            const cats = {};
            reviews.forEach(r => cats[r.category] = (cats[r.category] || 0) + 1);
            console.log('   - 카테고리 분포:', JSON.stringify(cats));

            if (reviews.length === 0) {
                console.warn('⚠️ [LOAD] 후기 데이터가 비어있습니다.');
                showEmptyState();
                return;
            }

            console.log('🎨 [RENDER] 렌더링 시작...');
            renderConsultingReviews(reviews);
            renderBootcampReviews(reviews);
            updateStats(reviews);
            console.log('🎉 [RENDER] 모든 렌더링 완료!');

        } catch (error) {
            console.error('❌ [LOAD] 후기 데이터 로드 실패:', error);
            console.error('   - 에러 상세:', error.stack);
            showEmptyState();
        }
    }

    // DOM 로드 후 실행
    console.log('📋 [INIT] DOM 상태 확인:', document.readyState);
    if (document.readyState === 'loading') {
        console.log('   - DOMContentLoaded 이벤트 대기 중...');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('✅ [INIT] DOMContentLoaded 이벤트 발생!');
            loadReviews();
        });
    } else {
        console.log('   - DOM 이미 준비됨, 즉시 실행');
        loadReviews();
    }

    console.log('🏁 [REVIEWS] 스크립트 초기화 완료\n');
})();
