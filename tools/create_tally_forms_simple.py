#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tally API를 사용한 신청 폼 자동 생성 도구
SCM 부트캠프와 커리어 컨설팅 폼을 생성합니다.
"""

import requests
import json
import time
import uuid
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
    
    def create_scm_bootcamp_form(self) -> Dict:
        """SCM 부트캠프 신청 폼 생성"""
        print("\nSCM 부트캠프 신청 폼 생성 중...")
        
        form_data = {
            "title": "SCM(ERP) 부트캠프 수강 신청",
            "description": "글로벌 빅4 컨설팅펌 현직자와 함께하는 SCM/ERP 실무 교육 신청서입니다.",
            "status": "PUBLISHED",
            "blocks": [
                {
                    "uuid": str(uuid.uuid4()),
                    "type": "INPUT_TEXT",
                    "ref": "name",
                    "properties": {
                        "label": "성명",
                        "required": True,
                        "placeholder": "홍길동"
                    }
                },
                {
                    "uuid": str(uuid.uuid4()),
                    "type": "INPUT_EMAIL",
                    "ref": "email", 
                    "properties": {
                        "label": "이메일",
                        "required": True,
                        "placeholder": "example@email.com"
                    }
                },
                {
                    "uuid": str(uuid.uuid4()),
                    "type": "INPUT_PHONE",
                    "ref": "phone",
                    "properties": {
                        "label": "연락처",
                        "required": True,
                        "placeholder": "010-0000-0000"
                    }
                }
            ]
        }
        
        return self._create_form(form_data)
    
    def create_career_consulting_form(self) -> Dict:
        """커리어 컨설팅 신청 폼 생성"""
        print("\n커리어 컨설팅 신청 폼 생성 중...")
        
        form_data = {
            "title": "커리어 컨설팅 서비스 신청",
            "description": "이력서부터 면접까지 완벽하게 준비해드리는 1:1 맞춤 컨설팅 서비스입니다.",
            "status": "PUBLISHED",
            "blocks": [
                {
                    "uuid": str(uuid.uuid4()),
                    "type": "INPUT_TEXT",
                    "ref": "name",
                    "properties": {
                        "label": "성명",
                        "required": True,
                        "placeholder": "홍길동"
                    }
                },
                {
                    "uuid": str(uuid.uuid4()),
                    "type": "INPUT_EMAIL",
                    "ref": "email",
                    "properties": {
                        "label": "이메일",
                        "required": True,
                        "placeholder": "example@email.com"
                    }
                }
            ]
        }
        
        return self._create_form(form_data)
    
    def _create_form(self, form_data: Dict) -> Dict:
        """실제 폼 생성 API 호출"""
        try:
            print(f"폼 생성 요청 중: {form_data['title']}")
            
            response = requests.post(
                f"{self.base_url}/forms",
                headers=self.headers,
                json=form_data,
                timeout=30
            )
            
            print(f"응답 상태: {response.status_code}")
            print(f"응답 내용: {response.text}")
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"폼 생성 성공!")
                print(f"폼 ID: {result.get('id', 'N/A')}")
                return result
            else:
                print(f"폼 생성 실패: {response.status_code}")
                return {"error": response.text, "status_code": response.status_code}
                
        except requests.RequestException as e:
            print(f"요청 오류: {e}")
            return {"error": str(e)}

def main():
    """메인 실행 함수"""
    api_key = "tly-nbXzUXtNj8URBKLx2B4Sk8PhYEVxwzex"
    
    print("Tally Form Creator 시작")
    print("=" * 50)
    
    creator = TallyFormCreator(api_key)
    
    # 1. API 연결 테스트
    if not creator.test_api_connection():
        print("API 연결에 실패했습니다. 프로그램을 종료합니다.")
        return
    
    # 2. SCM 부트캠프 폼 생성 테스트
    scm_form = creator.create_scm_bootcamp_form()
    
    # 3. 커리어 컨설팅 폼 생성 테스트  
    time.sleep(3)
    career_form = creator.create_career_consulting_form()
    
    print("\n" + "=" * 50)
    print("테스트 완료!")

if __name__ == "__main__":
    main()