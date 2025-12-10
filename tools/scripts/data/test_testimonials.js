const fs = require('fs');

// testimonials.json 데이터 로드
const data = JSON.parse(fs.readFileSync('./data/testimonials.json', 'utf8'));

// 커리어 컨설팅 후기 필터링
const careerReviews = data.testimonials.filter(t => t.category === 'career_consulting');
const featuredReviews = careerReviews.filter(t => t.featured);

console.log('🔍 후기 시스템 검증 결과');
console.log('====================');
console.log(`전체 후기 수: ${data.testimonials.length}`);
console.log(`커리어 컨설팅 후기 수: ${careerReviews.length}`);
console.log(`추천 후기 수 (featured): ${featuredReviews.length}`);
console.log(`SCM 교육 후기 수: ${data.testimonials.filter(t => t.category === 'scm_course').length}`);

console.log('\n📝 최신 커리어 컨설팅 후기 (상위 5개):');
console.log('=====================================');

careerReviews.slice(0, 5).forEach((review, i) => {
    const featuredMark = review.featured ? '⭐' : '  ';
    console.log(`${i+1}${featuredMark} ${review.name} - ${review.achievement}`);
    console.log(`    날짜: ${review.date}, 평점: ${review.rating}/5`);
    console.log(`    "${review.content.substring(0, 100)}..."`);
    console.log('');
});

console.log('\n📊 통계 정보:');
console.log('============');
console.log(`평점 분포: ${JSON.stringify(data.summary.rating_distribution)}`);
console.log(`날짜 범위: ${data.summary.date_range.earliest} ~ ${data.summary.date_range.latest}`);

// JavaScript 로딩 시뮬레이션
console.log('\n🔧 JavaScript 시뮬레이션:');
console.log('=========================');

// TestimonialSystem 시뮬레이션
function simulateTestimonialLoad(category, limit = 3) {
    const filtered = data.testimonials
        .filter(t => t.category === category)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);
    
    console.log(`loadTestimonials('career-testimonials', '${category}', ${limit}) 시뮬레이션:`);
    filtered.forEach((review, i) => {
        console.log(`  [${i+1}] ${review.name} - ${review.achievement}`);
    });
    
    return filtered;
}

const loadedReviews = simulateTestimonialLoad('career_consulting', 3);

console.log('\n✅ 후기 시스템 검증 완료!');
console.log(`   커리어 컨설팅 후기가 ${careerReviews.length - 4}개 추가되었습니다.`);
console.log(`   웹사이트에서 ${loadedReviews.length}개의 후기가 표시될 예정입니다.`);