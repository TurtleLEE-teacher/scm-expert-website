#!/usr/bin/env python3
"""
Tally API를 사용한 신청 폼 자동 생성 도구
SCM 부트캠프와 커리어 컨설팅 폼을 생성합니다.
"""

import requests
import json
import time
from typing import Dict, List, Any

class TallyFormCreator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.tally.so"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def test_api_connection(self) -> bool:
        """API 연결 테스트"""
        try:
            print("Tally API 연결 테스트 중...")
            response = requests.get(f"{self.base_url}/forms", headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                print("API 연결 성공!")
                data = response.json()
                print(f"현재 폼 개수: {len(data.get('data', []))}")
                return True
            else:
                print(f"API 연결 실패: {response.status_code}")
                print(f"응답: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"연결 오류: {e}")
            return False
    
    def get_available_block_types(self) -> List[str]:
        """사용 가능한 블록(필드) 타입들을 확인"""
        # API 문서를 통해 확인할 수 있는 일반적인 블록 타입들
        return [
            "INPUT_TEXT",
            "INPUT_EMAIL", 
            "INPUT_PHONE",
            "TEXTAREA",
            "SELECT",
            "CHECKBOX",
            "FILE_UPLOAD"
        ]
    
    def create_scm_bootcamp_form(self) -> Dict:
        """SCM 부트캠프 신청 폼 생성"""
        print("\n📝 SCM 부트캠프 신청 폼 생성 중...")
        
        form_data = {
            "title": "SCM(ERP) 부트캠프 수강 신청",
            "description": "글로벌 빅4 컨설팅펌 현직자와 함께하는 SCM/ERP 실무 교육 신청서입니다.",
            "blocks": [
                {
                    "type": "LAYOUT_HEADER",
                    "ref": "header1",
                    "properties": {
                        "title": "SCM 부트캠프 수강 신청",
                        "description": "아래 정보를 입력해주세요. 신청서 검토 후 24시간 내에 연락드리겠습니다."
                    }
                },
                {
                    "type": "INPUT_TEXT",
                    "ref": "name",
                    "properties": {
                        "label": "성명",
                        "required": True,
                        "placeholder": "홍길동"
                    }
                },
                {
                    "type": "INPUT_EMAIL",
                    "ref": "email", 
                    "properties": {
                        "label": "이메일",
                        "required": True,
                        "placeholder": "example@email.com"
                    }
                },
                {
                    "type": "INPUT_PHONE",
                    "ref": "phone",
                    "properties": {
                        "label": "연락처",
                        "required": True,
                        "placeholder": "010-0000-0000"
                    }
                },
                {
                    "type": "SELECT",
                    "ref": "course_type",
                    "properties": {
                        "label": "관심 과정",
                        "required": True,
                        "options": [
                            {"label": "초급반 (5주 과정)", "value": "beginner"},
                            {"label": "심화반 (8주 과정)", "value": "advanced"}
                        ]
                    }
                },
                {
                    "type": "SELECT",
                    "ref": "experience_level",
                    "properties": {
                        "label": "현재 경력 수준",
                        "required": False,
                        "options": [
                            {"label": "신입 (1년 미만)", "value": "entry"},
                            {"label": "주니어 (1-3년)", "value": "junior"},
                            {"label": "미드 (3-5년)", "value": "mid"},
                            {"label": "시니어 (5년 이상)", "value": "senior"}
                        ]
                    }
                },
                {
                    "type": "TEXTAREA",
                    "ref": "learning_goals",
                    "properties": {
                        "label": "학습 목표",
                        "required": False,
                        "placeholder": "SCM 학습을 통해 달성하고 싶은 목표를 간단히 작성해주세요."
                    }
                },
                {
                    "type": "INPUT_TEXT",
                    "ref": "depositor_name",
                    "properties": {
                        "label": "입금자명",
                        "required": True,
                        "placeholder": "홍길동 (수강생과 다른 경우 입력)"
                    }
                },
                {
                    "type": "CHECKBOX",
                    "ref": "privacy_agreement",
                    "properties": {
                        "label": "개인정보 수집·이용에 동의합니다. (필수)",
                        "required": True,
                        "description": "수강 신청 처리 및 교육 서비스 제공을 위해 개인정보를 수집·이용합니다."
                    }
                },
                {
                    "type": "CHECKBOX",
                    "ref": "marketing_agreement",
                    "properties": {
                        "label": "마케팅 정보 수신에 동의합니다. (선택)",
                        "required": False,
                        "description": "새로운 강의 및 이벤트 소식을 이메일로 받아보실 수 있습니다."
                    }
                }
            ]
        }
        
        return self._create_form(form_data)
    
    def create_career_consulting_form(self) -> Dict:
        """커리어 컨설팅 신청 폼 생성"""
        print("\n📝 커리어 컨설팅 신청 폼 생성 중...")
        
        form_data = {
            "title": "커리어 컨설팅 서비스 신청",
            "description": "이력서부터 면접까지 완벽하게 준비해드리는 1:1 맞춤 컨설팅 서비스입니다.",
            "blocks": [
                {
                    "type": "LAYOUT_HEADER",
                    "ref": "header1",
                    "properties": {
                        "title": "커리어 컨설팅 신청",
                        "description": "현직 컨설턴트의 1:1 맞춤 컨설팅을 통해 취업/이직 성공률을 높여보세요."
                    }
                },
                {
                    "type": "INPUT_TEXT",
                    "ref": "name",
                    "properties": {
                        "label": "성명",
                        "required": True,
                        "placeholder": "홍길동"
                    }
                },
                {
                    "type": "INPUT_EMAIL",
                    "ref": "email",
                    "properties": {
                        "label": "이메일",
                        "required": True,
                        "placeholder": "example@email.com"
                    }
                },
                {
                    "type": "INPUT_PHONE",
                    "ref": "phone",
                    "properties": {
                        "label": "연락처",
                        "required": True,
                        "placeholder": "010-0000-0000"
                    }
                },
                {
                    "type": "SELECT",
                    "ref": "consulting_type",
                    "properties": {
                        "label": "컨설팅 유형",
                        "required": True,
                        "options": [
                            {"label": "이력서 컨설팅 (15만원)", "value": "resume"},
                            {"label": "면접 컨설팅 (25만원)", "value": "interview"},
                            {"label": "종합 패키지 (35만원)", "value": "comprehensive"}
                        ]
                    }
                },
                {
                    "type": "SELECT",
                    "ref": "current_status",
                    "properties": {
                        "label": "현재 상황",
                        "required": False,
                        "options": [
                            {"label": "재직중", "value": "employed"},
                            {"label": "구직중", "value": "job_seeking"},
                            {"label": "이직 준비중", "value": "preparing_transition"}
                        ]
                    }
                },
                {
                    "type": "INPUT_TEXT",
                    "ref": "target_company",
                    "properties": {
                        "label": "목표 업계/기업",
                        "required": False,
                        "placeholder": "예: 컨설팅업계, 삼성전자, 물류업계 등"
                    }
                },
                {
                    "type": "SELECT",
                    "ref": "experience_years",
                    "properties": {
                        "label": "경력 년수",
                        "required": False,
                        "options": [
                            {"label": "신입 (1년 미만)", "value": "entry"},
                            {"label": "주니어 (1-3년)", "value": "junior"},
                            {"label": "미드 (3-5년)", "value": "mid"},
                            {"label": "시니어 (5년 이상)", "value": "senior"}
                        ]
                    }
                },
                {
                    "type": "TEXTAREA",
                    "ref": "additional_requests",
                    "properties": {
                        "label": "추가 요청사항",
                        "required": False,
                        "placeholder": "특별히 집중하고 싶은 부분이나 궁금한 점을 자유롭게 작성해주세요."
                    }
                },
                {
                    "type": "FILE_UPLOAD",
                    "ref": "current_resume",
                    "properties": {
                        "label": "현재 이력서 (선택)",
                        "required": False,
                        "description": "PDF 또는 Word 파일로 업로드해주세요. 더 정확한 컨설팅이 가능합니다."
                    }
                },
                {
                    "type": "INPUT_TEXT",
                    "ref": "depositor_name",
                    "properties": {
                        "label": "입금자명",
                        "required": True,
                        "placeholder": "홍길동 (신청자와 다른 경우 입력)"
                    }
                },
                {
                    "type": "CHECKBOX",
                    "ref": "privacy_agreement",
                    "properties": {
                        "label": "개인정보 수집·이용에 동의합니다. (필수)",
                        "required": True,
                        "description": "컨설팅 서비스 제공을 위해 개인정보를 수집·이용합니다."
                    }
                },
                {
                    "type": "CHECKBOX",
                    "ref": "marketing_agreement",
                    "properties": {
                        "label": "마케팅 정보 수신에 동의합니다. (선택)",
                        "required": False,
                        "description": "새로운 서비스 및 이벤트 소식을 이메일로 받아보실 수 있습니다."
                    }
                }
            ]
        }
        
        return self._create_form(form_data)
    
    def _create_form(self, form_data: Dict) -> Dict:
        """실제 폼 생성 API 호출"""
        try:
            print(f"📤 폼 생성 요청 중: {form_data['title']}")
            
            response = requests.post(
                f"{self.base_url}/forms",
                headers=self.headers,
                json=form_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"✅ 폼 생성 성공!")
                print(f"📋 폼 ID: {result.get('id', 'N/A')}")
                print(f"🔗 폼 URL: {result.get('url', 'N/A')}")
                return result
            else:
                print(f"❌ 폼 생성 실패: {response.status_code}")
                print(f"응답: {response.text}")
                return {"error": response.text, "status_code": response.status_code}
                
        except requests.RequestException as e:
            print(f"❌ 요청 오류: {e}")
            return {"error": str(e)}
    
    def save_form_info(self, forms_info: List[Dict]):
        """생성된 폼 정보를 파일로 저장"""
        output_file = "C:/Users/ahfif/SuperClaude/Project_SCM_Site/data/tally_forms_info.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(forms_info, f, ensure_ascii=False, indent=2)
        
        print(f"💾 폼 정보 저장 완료: {output_file}")

def main():
    """메인 실행 함수"""
    api_key = "tly-nbXzUXtNj8URBKLx2B4Sk8PhYEVxwzex"
    
    print("Tally Form Creator 시작")
    print("=" * 50)
    
    creator = TallyFormCreator(api_key)
    
    # 1. API 연결 테스트
    if not creator.test_api_connection():
        print("❌ API 연결에 실패했습니다. 프로그램을 종료합니다.")
        return
    
    # 2. 사용 가능한 블록 타입 확인
    print("\n📋 사용 가능한 필드 타입들:")
    block_types = creator.get_available_block_types()
    for block_type in block_types:
        print(f"  - {block_type}")
    
    # 잠깐 대기
    time.sleep(2)
    
    forms_info = []
    
    # 3. SCM 부트캠프 폼 생성
    scm_form = creator.create_scm_bootcamp_form()
    if 'error' not in scm_form:
        forms_info.append({
            "name": "SCM 부트캠프 수강 신청",
            "type": "scm_bootcamp",
            "form_id": scm_form.get('id'),
            "url": scm_form.get('url'),
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        })
    
    # 잠깐 대기 (API 율한계 고려)
    time.sleep(3)
    
    # 4. 커리어 컨설팅 폼 생성
    career_form = creator.create_career_consulting_form()
    if 'error' not in career_form:
        forms_info.append({
            "name": "커리어 컨설팅 서비스 신청",
            "type": "career_consulting", 
            "form_id": career_form.get('id'),
            "url": career_form.get('url'),
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        })
    
    # 5. 폼 정보 저장
    if forms_info:
        creator.save_form_info(forms_info)
        
        print("\n" + "=" * 50)
        print("🎉 모든 폼 생성 완료!")
        print("\n📋 생성된 폼 목록:")
        
        for form in forms_info:
            print(f"\n📝 {form['name']}")
            print(f"   🆔 ID: {form['form_id']}")
            print(f"   🔗 URL: {form['url']}")
    else:
        print("\n❌ 생성된 폼이 없습니다.")

if __name__ == "__main__":
    main()