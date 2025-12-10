#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tally API 최소한의 테스트
"""

import requests
import json

def test_tally_api():
    api_key = "tly-nbXzUXtNj8URBKLx2B4Sk8PhYEVxwzex"
    base_url = "https://api.tally.so"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    print("=== Tally API 테스트 ===")
    
    # 1. 기존 폼 조회
    print("\n1. 기존 폼 조회 중...")
    response = requests.get(f"{base_url}/forms", headers=headers)
    print(f"상태: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"폼 개수: {len(data.get('data', []))}")
        
        # 기존 폼이 있다면 그 구조를 확인
        if data.get('data'):
            first_form = data['data'][0]
            print(f"첫 번째 폼 ID: {first_form.get('id')}")
            print(f"첫 번째 폼 제목: {first_form.get('title')}")
            
            # 상세 폼 정보 조회
            form_id = first_form.get('id')
            if form_id:
                print(f"\n2. 폼 {form_id} 상세 정보 조회...")
                detail_response = requests.get(f"{base_url}/forms/{form_id}", headers=headers)
                print(f"상세 조회 상태: {detail_response.status_code}")
                
                if detail_response.status_code == 200:
                    detail_data = detail_response.json()
                    print("폼 구조:")
                    print(json.dumps(detail_data, indent=2, ensure_ascii=False))
    
    # 3. 간단한 폼 생성 시도
    print("\n3. 간단한 폼 생성 시도...")
    minimal_form = {
        "title": "테스트 폼",
        "status": "DRAFT"
    }
    
    create_response = requests.post(f"{base_url}/forms", headers=headers, json=minimal_form)
    print(f"생성 시도 상태: {create_response.status_code}")
    print(f"생성 응답: {create_response.text}")

if __name__ == "__main__":
    test_tally_api()