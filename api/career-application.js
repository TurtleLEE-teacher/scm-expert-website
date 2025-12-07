/**
 * 커리어 컨설팅 신청 처리 - Vercel Functions
 * PHP를 Node.js로 변환한 버전 (파일 업로드 제외)
 */

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // CORS 프리플라이트 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.status(405).json({ error: '허용되지 않은 메소드' });
    return;
  }

  try {
    const input = req.body;

    // 필수 필드 검증
    const requiredFields = ['name', 'email', 'phone', 'consulting_type', 'depositor_name', 'privacy_required'];
    for (const field of requiredFields) {
      if (field !== 'privacy_required' && !input[field]) {
        throw new Error(`필수 필드가 누락되었습니다: ${field}`);
      }
      if (field === 'privacy_required' && !input[field]) {
        throw new Error('개인정보 수집·이용 동의가 필요합니다.');
      }
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('유효하지 않은 이메일 주소입니다.');
    }

    // 컨설팅 타입 검증
    const consultingTypes = {
      'resume': '이력서 컨설팅',
      'interview': '면접 컨설팅',
      'comprehensive': '종합 패키지'
    };

    if (!consultingTypes[input.consulting_type]) {
      throw new Error('유효하지 않은 컨설팅 유형입니다.');
    }

    // 가격 정보
    const priceInfo = {
      'resume': { price: 150000, duration: '작업일 3일' },
      'interview': { price: 250000, duration: '2회 코칭' },
      'comprehensive': { price: 350000, duration: '총 4회 세션' }
    };

    const selectedPrice = priceInfo[input.consulting_type];

    // Notion API 키 확인
    const notionApiKey = process.env.NOTION_API_KEY;
    const inquiriesDbId = process.env.NOTION_INQUIRIES_DB_ID;

    if (!notionApiKey || notionApiKey === 'your_notion_api_key_here') {
      throw new Error('Notion API 키가 설정되지 않았습니다.');
    }

    if (!inquiriesDbId) {
      throw new Error('문의 데이터베이스 ID가 설정되지 않았습니다.');
    }

    // 현재 상황 라벨
    const statusLabels = {
      'employed': '재직중',
      'job_seeking': '구직중',
      'preparing_transition': '이직 준비중'
    };

    // 경력 라벨
    const experienceLabels = {
      'entry': '신입 (1년 미만)',
      'junior': '주니어 (1-3년)',
      'mid': '미드 (3-5년)',
      'senior': '시니어 (5년 이상)'
    };

    // Notion에 저장할 데이터 준비 (문의사항 DB 구조)
    const notionData = {
      parent: { database_id: inquiriesDbId },
      properties: {
        '이름': {
          title: [{ text: { content: input.name.trim() } }]
        },
        '이메일': {
          email: input.email.trim()
        },
        '전화번호': {
          phone_number: input.phone.trim()
        },
        '회사명': {
          rich_text: [{ text: { content: input.current_company || '' } }]
        },
        '문의유형': {
          select: { name: '커리어 컨설팅' }
        },
        '상태': {
          select: { name: '새 문의' }
        },
        '우선순위': {
          select: { name: '보통' }
        },
        '문의내용': {
          rich_text: [{
            text: {
              content: formatConsultingDetails(input, consultingTypes[input.consulting_type], selectedPrice, statusLabels, experienceLabels)
            }
          }]
        }
      }
    };

    // Notion API 호출
    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(notionData)
    });

    if (!notionResponse.ok) {
      const errorData = await notionResponse.text();
      throw new Error(`Notion API 오류: ${notionResponse.status} - ${errorData}`);
    }

    const result = await notionResponse.json();

    // 성공 응답
    const response = {
      success: true,
      message: '🎉 커리어 컨설팅 신청이 성공적으로 접수되었습니다!\n\n📧 24시간 내에 결제 안내 및 일정 조율 이메일을 발송해드립니다.\n💼 결제 완료 후 담당 컨설턴트가 직접 연락드립니다.',
      application_id: result.id,
      consulting_info: {
        type: consultingTypes[input.consulting_type],
        price: `${selectedPrice.price.toLocaleString()}원`,
        duration: selectedPrice.duration
      }
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}

// 컨설팅 상세 정보 포맷팅 함수
function formatConsultingDetails(input, consultingType, priceInfo, statusLabels, experienceLabels) {
  const details = [];

  // 기본 컨설팅 정보
  details.push('=== 컨설팅 정보 ===');
  details.push(`유형: ${consultingType}`);
  details.push(`비용: ${priceInfo.price.toLocaleString()}원`);
  details.push(`기간: ${priceInfo.duration}`);
  details.push('');

  // 신청자 상세 정보
  details.push('=== 신청자 정보 ===');
  if (input.current_company) {
    details.push(`현재 회사: ${input.current_company.trim()}`);
  }
  if (input.current_position) {
    details.push(`현재 직책: ${input.current_position.trim()}`);
  }

  // 현재 상황
  if (input.current_status) {
    details.push(`현재 상황: ${statusLabels[input.current_status] || input.current_status}`);
  }

  // 목표 및 경력
  if (input.target_company) {
    details.push(`목표 업계/기업: ${input.target_company.trim()}`);
  }
  if (input.experience_years) {
    details.push(`경력 년수: ${experienceLabels[input.experience_years] || input.experience_years}`);
  }

  details.push('');

  // 추가 요청사항
  if (input.additional_requests) {
    details.push('=== 추가 요청사항 ===');
    details.push(input.additional_requests.trim());
    details.push('');
  }

  // 결제 정보
  details.push('=== 결제 정보 ===');
  details.push(`입금자명: ${input.depositor_name.trim()}`);

  // 추가 정보
  const marketingConsent = input.marketing_optional ? '동의' : '거부';
  details.push(`마케팅 수신: ${marketingConsent}`);
  details.push(`신청일시: ${new Date().toLocaleString('ko-KR')}`);

  return details.join('\n');
}
