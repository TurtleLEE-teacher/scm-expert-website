/**
 * SCM 부트캠프 수강 신청 처리 - Vercel Functions
 * PHP를 Node.js로 변환한 버전
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
    const requiredFields = ['name', 'email', 'phone', 'course_type', 'depositor_name', 'privacy_required'];
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
    
    // 과정 타입 검증
    const courseTypes = {
      'beginner': 'SCM 기초 완성 (5주)'
    };

    if (!courseTypes[input.course_type]) {
      throw new Error('유효하지 않은 과정입니다.');
    }

    // 가격 정보
    const priceInfo = {
      'beginner': { price: 169000, duration: '5주' }
    };
    
    const selectedPrice = priceInfo[input.course_type];
    
    // Notion API 키 확인
    const notionApiKey = process.env.NOTION_API_KEY;
    const studentsDbId = process.env.NOTION_STUDENTS_DB_ID;
    
    if (!notionApiKey || notionApiKey === 'your_notion_api_key_here') {
      throw new Error('Notion API 키가 설정되지 않았습니다.');
    }
    
    if (!studentsDbId) {
      throw new Error('학생 데이터베이스 ID가 설정되지 않았습니다.');
    }
    
    // Notion에 저장할 데이터 준비
    const notionData = {
      parent: { database_id: studentsDbId },
      properties: {
        '이름': {
          title: [{ text: { content: input.name } }]
        },
        '이메일': {
          email: input.email
        },
        '전화번호': {
          phone_number: input.phone
        },
        '회사명': {
          rich_text: [{ text: { content: input.company || '' } }]
        },
        '직책': {
          rich_text: [{ text: { content: input.position || '' } }]
        },
        '수강강의': {
          rich_text: [{ 
            text: { 
              content: `${courseTypes[input.course_type]} (${selectedPrice.duration})` 
            } 
          }]
        },
        '결제금액': {
          number: selectedPrice.price
        },
        '등록일': {
          date: { start: new Date().toISOString().split('T')[0] }
        },
        '결제상태': {
          select: { name: '결제대기' }
        },
        '특이사항': {
          rich_text: [{ 
            text: { 
              content: formatStudentDetails(input, selectedPrice)
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

    // 이메일 발송
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'SCM Labs <onboarding@resend.dev>',
            to: input.email.trim(),
            subject: `[SCM Labs] SCM 기초 완성 수강 신청이 접수되었습니다`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0071e3;">SCM 기초 완성 수강 신청 완료</h2>
                <p>${input.name}님, 안녕하세요!</p>
                <p>SCM 기초 완성 과정 수강 신청이 정상적으로 접수되었습니다.</p>

                <div style="background: #f5f5f7; padding: 20px; border-radius: 12px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #1d1d1f;">신청 내역</h3>
                  <p><strong>과정:</strong> ${courseTypes[input.course_type]}</p>
                  <p><strong>금액:</strong> ${selectedPrice.price.toLocaleString()}원</p>
                  <p><strong>일정:</strong> 매주 금요일 오후 8시-10시</p>
                </div>

                <div style="background: #fff3cd; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #ffc107;">
                  <h3 style="margin-top: 0; color: #856404;">입금 안내</h3>
                  <p><strong>은행:</strong> 우리은행</p>
                  <p><strong>계좌번호:</strong> 1002-383-122220</p>
                  <p><strong>예금주:</strong> 이민석</p>
                  <p><strong>입금자명:</strong> ${input.depositor_name}</p>
                </div>

                <p>입금 확인 후 강의 자료 및 상세 일정을 안내해드리겠습니다.</p>
                <p>문의사항이 있으시면 이 이메일로 회신해 주세요.</p>

                <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                <p style="color: #86868b; font-size: 12px;">SCM Labs | scmmaster2030@gmail.com</p>
              </div>
            `
          })
        });
      } catch (emailError) {
        console.error('이메일 발송 실패:', emailError);
      }
    }

    // 성공 응답
    const response = {
      success: true,
      message: '🎉 SCM 기초 완성 수강 신청이 성공적으로 접수되었습니다!\n\n📧 입금 안내 이메일을 발송해드렸습니다.\n💡 결제 완료 후 강의 자료 및 일정을 안내해드립니다.',
      application_id: result.id,
      course_info: {
        name: courseTypes[input.course_type],
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

// 학생 상세 정보 포맷팅 함수
function formatStudentDetails(input, priceInfo) {
  const details = [];
  
  if (input.experience_level) {
    const experienceLevels = {
      'entry': '신입 (1년 미만)',
      'junior': '주니어 (1-3년)',
      'mid': '미드 (3-5년)', 
      'senior': '시니어 (5년 이상)'
    };
    details.push(`경력수준: ${experienceLevels[input.experience_level] || input.experience_level}`);
  }
  
  if (input.learning_goals) {
    details.push(`학습목표: ${input.learning_goals}`);
  }
  
  if (input.depositor_name && input.depositor_name !== input.name) {
    details.push(`입금자명: ${input.depositor_name}`);
  }
  
  const marketingConsent = input.marketing_optional ? '동의' : '거부';
  details.push(`마케팅 수신: ${marketingConsent}`);
  
  details.push(`신청일시: ${new Date().toLocaleString('ko-KR')}`);
  
  return details.join(' | ');
}