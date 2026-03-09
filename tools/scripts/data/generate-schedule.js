/**
 * 로컬에서 Notion 데이터를 가져와 schedule.json 생성
 * GitHub Actions와 동일한 로직 사용
 */

const fs = require('fs');
const { readFileSync } = require('fs');

// 설정 파일에서 API 키 읽기
let NOTION_API_KEY;
const NOTION_COHORT_DB_ID = '23787a1932c481bba2c1d5f33256cc37';
const NOTION_LECTURE_DB_ID = '6f892938f4884cd0ba09b858e500e025';
const NOTION_REVIEWS_DB_ID = '243951127368492d906a3d36861aacd2';

try {
    const configContent = readFileSync('./includes/config.php', 'utf8');
    const apiKeyMatch = configContent.match(/'NOTION_API_KEY'\s*=>\s*'([^']+)'/);

    if (apiKeyMatch) {
        NOTION_API_KEY = apiKeyMatch[1];
    }
} catch (error) {
    console.error('❌ config.php 파일을 읽을 수 없습니다:', error.message);
    process.exit(1);
}

if (!NOTION_API_KEY) {
    console.error('❌ Notion API 키가 설정되지 않았습니다.');
    process.exit(1);
}

async function fetchNotionDB(dbId, label, pageSize = 50) {
    console.log(`🔍 ${label} 데이터 가져오는 중...`);
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page_size: pageSize })
    });
    if (!response.ok) throw new Error(`${label} HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    console.log(`✅ ${label}: ${data.results.length}개 레코드`);
    return data;
}

async function generateScheduleJSON() {
    try {
        // 1. Cohort Management 가져오기
        const cohortData = await fetchNotionDB(NOTION_COHORT_DB_ID, 'Cohort Management');

        // 2. Lecture Management 가져오기
        const lectureData = await fetchNotionDB(NOTION_LECTURE_DB_ID, 'Lecture Management', 100);

        // 3. Cohort 메타데이터 맵 구축 (ID → 기수 정보)
        const cohortMap = {};
        cohortData.results.forEach((course, index) => {
            if (course.archived || course.in_trash) return;
            const props = course.properties;
            const title = props.기수명?.title?.[0]?.text?.content || `강의 ${index + 1}`;
            const category = props.강의종류?.select?.name || 'SCM 기초';
            const status = props.상태?.select?.name || '준비중';
            const description = props.비고?.rich_text?.[0]?.text?.content || '';
            const price = props.수강료?.number || 0;
            const maxStudents = props.최대인원?.number || 20;
            const currentStudents = props.현재등록인원?.number || 0;
            let batch = props.기수?.number;
            if (!batch) {
                const batchMatch = title.match(/(\d+)기/);
                batch = batchMatch ? parseInt(batchMatch[1]) : (index + 1);
            }
            cohortMap[course.id] = {
                id: course.id, title, category, status, description,
                price, maxStudents, currentStudents, batch
            };
            console.log(`  ✓ 기수 등록: ${title} (${batch}기)`);
        });

        // 4. Lecture 데이터 → calendarData 변환
        const calendarData = [];

        if (lectureData.results && lectureData.results.length > 0) {
            lectureData.results.forEach((lecture) => {
                if (lecture.archived || lecture.in_trash) return;
                const p = lecture.properties;

                const lectureName = p.강의명?.title?.[0]?.text?.content || '';
                const lectureDate = p.강의일시?.date?.start;
                const weekNum = p.주차?.number || 0;
                const lectureType = p.유형?.select?.name || '';
                const cohortRelation = p.기수?.relation?.[0]?.id || '';

                if (!lectureDate) return;

                const cohort = cohortMap[cohortRelation] || {
                    id: cohortRelation, title: lectureName.split(' - ')[0] || '알 수 없음',
                    category: 'SCM 기초', status: '준비중', description: '',
                    price: 0, maxStudents: 20, currentStudents: 0, batch: 0
                };

                let overallWeek, label, type, hasAssignment;
                if (lectureType === '강의') {
                    type = 'lecture';
                    overallWeek = weekNum * 2 - 1;
                    hasAssignment = weekNum < 3;
                    if (weekNum === 1) label = '1주차 강의';
                    else if (weekNum === 2) label = '3주차 강의';
                    else if (weekNum === 3) label = '5주차 최종발표';
                    else label = `${overallWeek}주차 강의`;
                } else if (lectureType === '과제세션') {
                    type = 'assignment';
                    overallWeek = weekNum * 2;
                    hasAssignment = true;
                    if (weekNum === 1) label = '2주차 피드백';
                    else if (weekNum === 2) label = '4주차 피드백';
                    else label = `${overallWeek}주차 피드백`;
                } else {
                    type = 'lecture';
                    overallWeek = weekNum;
                    label = `${weekNum}주차`;
                    hasAssignment = false;
                }

                calendarData.push({
                    name: cohort.title, date: lectureDate, type, week: overallWeek,
                    label, hasAssignment, status: cohort.status, batch: cohort.batch,
                    maxStudents: cohort.maxStudents, currentStudents: cohort.currentStudents,
                    notionData: cohort
                });

                console.log(`  📅 ${lectureName} → ${lectureDate} (week ${overallWeek}, ${type})`);
            });
            console.log(`\n✅ Lecture Management에서 ${calendarData.length}개 세션 변환 완료`);
        } else {
            // Lecture Management 데이터가 없으면 Cohort의 날짜 필드로 폴백
            console.log('⚠️  Lecture 데이터 없음 → Cohort 날짜 필드로 폴백');
            Object.values(cohortMap).forEach(cohort => {
                const course = cohortData.results.find(r => r.id === cohort.id);
                if (!course) return;
                const props = course.properties;
                const dates = [
                    { key: '강의(1)', week: 1, type: 'lecture', label: '1주차 강의', hasAssignment: true },
                    { key: '과제세션(1)', week: 2, type: 'assignment', label: '2주차 피드백', hasAssignment: true },
                    { key: '강의(2)', week: 3, type: 'lecture', label: '3주차 강의', hasAssignment: true },
                    { key: '과제세션(2)', week: 4, type: 'assignment', label: '4주차 피드백', hasAssignment: true },
                    { key: '강의(3)', week: 5, type: 'lecture', label: '5주차 최종발표', hasAssignment: false }
                ];
                dates.forEach(d => {
                    const date = props[d.key]?.date?.start;
                    if (date) {
                        calendarData.push({
                            name: cohort.title, date, type: d.type, week: d.week,
                            label: d.label, hasAssignment: d.hasAssignment,
                            status: cohort.status, batch: cohort.batch,
                            maxStudents: cohort.maxStudents, currentStudents: cohort.currentStudents,
                            notionData: cohort
                        });
                    }
                });
            });
            console.log(`✅ Cohort 폴백으로 ${calendarData.length}개 세션 변환 완료`);
        }

        calendarData.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (!fs.existsSync('data')) fs.mkdirSync('data');

        const output = {
            success: true,
            data: calendarData,
            lastUpdated: new Date().toISOString(),
            totalSessions: calendarData.length
        };

        fs.writeFileSync('data/schedule.json', JSON.stringify(output, null, 2));
        console.log(`✅ ${calendarData.length}개 세션 데이터가 data/schedule.json에 저장되었습니다.`);

        return output;

    } catch (error) {
        console.error('❌ 스케줄 생성 실패:', error.message);
        process.exit(1);
    }
}

// 후기 데이터 생성
async function generateReviewsJSON() {
    try {
        console.log('\n🔍 Notion 후기 데이터 가져오는 중...');

        const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_REVIEWS_DB_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page_size: 100
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rawData = await response.json();
        console.log(`✅ ${rawData.results.length}개 후기 데이터 받음`);

        const reviews = [];

        rawData.results.forEach((review, index) => {
            if (review.archived || review.in_trash) return;

            const props = review.properties;

            // 첫 번째 항목에서 속성 목록 출력
            if (index === 0) {
                console.log('\n📋 후기 속성 목록:');
                Object.keys(props).forEach(key => {
                    console.log(`  - ${key} (${props[key].type})`);
                });
            }

            // 후기 내용 추출
            let content = '';
            const contentFields = ['후기내용', '후기', '내용', 'content', 'Content', 'Review'];
            for (const field of contentFields) {
                if (props[field]?.rich_text?.[0]?.text?.content) {
                    content = props[field].rich_text[0].text.content;
                    break;
                }
                if (props[field]?.title?.[0]?.text?.content) {
                    content = props[field].title[0].text.content;
                    break;
                }
            }

            // 별점 추출
            let rating = 5;
            const ratingFields = ['별점', 'rating', 'Rating', '평점'];
            for (const field of ratingFields) {
                if (props[field]?.number) {
                    rating = props[field].number;
                    break;
                }
                if (props[field]?.select?.name) {
                    rating = parseInt(props[field].select.name) || 5;
                    break;
                }
            }

            // 작성자 추출 (익명작성자 필드 우선 사용)
            let author = '';
            const authorFields = ['익명작성자', '익명 작성자', '작성자', '이름', 'author', 'Author', 'Name'];
            for (const field of authorFields) {
                if (props[field]?.rich_text?.[0]?.text?.content) {
                    author = props[field].rich_text[0].text.content;
                    break;
                }
                if (props[field]?.title?.[0]?.text?.content) {
                    author = props[field].title[0].text.content;
                    break;
                }
            }

            // 날짜 추출
            let date = '';
            const dateFields = ['날짜', '작성일', 'date', 'Date', '등록일'];
            for (const field of dateFields) {
                if (props[field]?.date?.start) {
                    const d = new Date(props[field].date.start);
                    date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
                    break;
                }
            }

            // 생성일 fallback
            if (!date && review.created_time) {
                const d = new Date(review.created_time);
                date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
            }

            if (content) {
                reviews.push({
                    id: review.id,
                    content: content,
                    rating: rating,
                    author: author,
                    date: date
                });
                console.log(`✓ 후기: ${author} (${rating}점) - ${content.substring(0, 30)}...`);
            }
        });

        // 날짜 역순 정렬 (최신순)
        reviews.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date.localeCompare(a.date);
        });

        const output = {
            success: true,
            data: reviews,
            lastUpdated: new Date().toISOString(),
            totalReviews: reviews.length
        };

        fs.writeFileSync('data/reviews.json', JSON.stringify(output, null, 2));
        console.log(`✅ ${reviews.length}개 후기 데이터가 data/reviews.json에 저장되었습니다.`);

        return output;

    } catch (error) {
        console.error('❌ 후기 생성 실패:', error.message);
        // 후기 생성 실패해도 스케줄은 유지
    }
}

// 스크립트 실행
async function main() {
    await generateScheduleJSON();
    await generateReviewsJSON();
}

main();