/**
 * 로컬에서 Notion 데이터를 가져와 schedule.json 생성
 * GitHub Actions와 동일한 로직 사용
 */

const fs = require('fs');
const { readFileSync } = require('fs');

// 설정 파일에서 API 키 읽기
let NOTION_API_KEY, NOTION_DATABASE_ID;
const NOTION_REVIEWS_DB_ID = '243951127368492d906a3d36861aacd2';

try {
    const configContent = readFileSync('./includes/config.php', 'utf8');
    const apiKeyMatch = configContent.match(/'NOTION_API_KEY'\s*=>\s*'([^']+)'/);
    const dbIdMatch = configContent.match(/'NOTION_COURSES_DB_ID'\s*=>\s*'([^']+)'/);

    if (apiKeyMatch && dbIdMatch) {
        NOTION_API_KEY = apiKeyMatch[1];
        NOTION_DATABASE_ID = dbIdMatch[1];
    }
} catch (error) {
    console.error('❌ config.php 파일을 읽을 수 없습니다:', error.message);
    process.exit(1);
}

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.error('❌ Notion API 키 또는 데이터베이스 ID가 설정되지 않았습니다.');
    process.exit(1);
}

async function generateScheduleJSON() {
    try {
        console.log('🔍 Notion 데이터 가져오는 중...');
        
        // Notion API 호출
        const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page_size: 50,
                sorts: [
                    { property: '개강일', direction: 'ascending' }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rawData = await response.json();
        console.log(`✅ ${rawData.results.length}개 강의 데이터 받음`);
        
        // 캘린더 형식으로 변환 (GitHub Actions와 동일한 로직)
        const calendarData = [];
        
        rawData.results.forEach((course, index) => {
            const props = course.properties;
            const title = props.강의명?.title?.[0]?.text?.content || `강의 ${index + 1}`;
            const category = props.카테고리?.select?.name || 'SCM 기초';
            const status = props.상태?.select?.name || '준비중';
            const startDate = props.개강일?.date?.start;
            const description = props.강의설명?.rich_text?.[0]?.text?.content || '';
            const maxStudents = props.최대인원?.number || 10;
            const currentStudents = props.현재등록인원?.number || 0;

            // 기수 번호 추출 (숫자 필드 또는 타이틀에서 추출)
            let batch = props.기수?.number;
            if (!batch) {
                // 기수 필드가 없으면 타이틀에서 숫자 추출
                const batchMatch = title.match(/(\d+)기/);
                batch = batchMatch ? parseInt(batchMatch[1]) : (index + 1);
            }

            // 삭제되지 않은 모든 강의 포함 (개강일 없어도 포함)
            if (!course.archived && !course.in_trash) {
                calendarData.push({
                    name: title,
                    date: startDate || null,
                    tags: [
                        title,
                        `카테고리: ${category}`,
                        description || '상세 설명 없음'
                    ],
                    status: status,
                    batch: batch,
                    maxStudents: maxStudents,
                    currentStudents: currentStudents,
                    notionData: {
                        id: course.id,
                        title,
                        category,
                        status,
                        startDate,
                        description,
                        batch,
                        maxStudents,
                        currentStudents
                    }
                });

                console.log(`📚 ${index + 1}. ${title} (${batch}기, ${status}) - ${startDate || '날짜 없음'}`);
            }
        });
        
        // 출력 데이터 구성
        const output = {
            success: true,
            data: calendarData,
            lastUpdated: new Date().toISOString(),
            totalCourses: calendarData.length
        };
        
        // data 디렉토리 생성
        if (!fs.existsSync('data')) {
            fs.mkdirSync('data');
        }
        
        // JSON 파일 저장
        fs.writeFileSync('data/schedule.json', JSON.stringify(output, null, 2));
        console.log(`✅ ${calendarData.length}개 강의 데이터가 data/schedule.json에 저장되었습니다.`);
        
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