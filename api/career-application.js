/**
 * 커리어 컨설팅 신청 처리 - Vercel Functions
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
    const data = req.body;
    
    // 필수 필드 검증
    const requiredFields = ['name', 'email', 'phone', 'consulting_type', 'privacy_required'];
    for (const field of requiredFields) {
      if (field !== 'privacy_required' && !data[field]) {
        throw new Error(`필수 필드가 누락되었습니다: ${field}`);
      }
      if (field === 'privacy_required' && !data[field]) {
        throw new Error('개인정보 수집·이용 동의가 필요합니다.');
      }
    }
    
    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('유효하지 않은 이메일 주소입니다.');
    }
    
    // 컨설팅 타입 검증
    const consultingTypes = {
      'resume': '이력서 컨설팅',
      'interview': '면접 컨설팅',
      'comprehensive': '종합 패키지'
    };
    
    if (!consultingTypes[data.consulting_type]) {
      throw new Error('유효하지 않은 컨설팅 유형입니다.');
    }
    
    // 가격 정보
    const priceInfo = {
      'resume': 150000,
      'interview': 200000,
      'comprehensive': 350000
    };
    
    const consultingType = consultingTypes[data.consulting_type];
    const consultingPrice = priceInfo[data.consulting_type];
    
    // Notion API 키 확인
    const notionApiKey = process.env.NOTION_API_KEY;
    const inquiriesDbId = process.env.NOTION_INQUIRIES_DB_ID;
    
    if (!notionApiKey || notionApiKey === 'your_notion_api_key_here') {
      throw new Error('Notion API 키가 설정되지 않았습니다.');
    }
    
    if (!inquiriesDbId) {
      throw new Error('문의 데이터베이스 ID가 설정되지 않았습니다.');
    }
    
    // Notion에 저장할 데이터 준비
    const notionData = {
      parent: { database_id: inquiriesDbId },
      properties: {
        '이름': {
          title: [{ text: { content: data.name } }]
        },
        '이메일': {
          email: data.email
        },
        '전화번호': {
          rich_text: [{ text: { content: data.phone } }]
        },
        '문의유형': {
          select: { name: '커리어 컨설팅' }
        },
        '문의내용': {
          rich_text: [{ 
            text: { 
              content: `컨설팅 유형: ${consultingType}\n현재 직책: ${data.current_position || '미입력'}\n희망 분야: ${data.target_field || '미입력'}\n경력 년수: ${data.experience_years || '미입력'}년\n상세 요청사항: ${data.detailed_request || '미입력'}`
            } 
          }]
        },
        '처리상태': {
          select: { name: '접수됨' }
        },
        '접수일': {
          date: { start: new Date().toISOString().split('T')[0] }
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
      message: `🎉 커리어 컨설팅 신청이 성공적으로 접수되었습니다!\n\n📧 24시간 내에 담당자가 연락드립니다.\n💼 상세한 컨설팅 일정을 안내해드리겠습니다.\n\n📋 신청 정보:\n- 컨설팅 유형: ${consultingType}\n- 상담료: ${consultingPrice.toLocaleString()}원`,
      application_id: result.id,
      consulting_info: {
        type: consultingType,
        price: `${consultingPrice.toLocaleString()}원`
      }
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}