#!/usr/bin/env python3
"""
testimonials.json 업데이트 도구
새로 생성된 커리어 컨설팅 후기를 기존 testimonials.json에 통합
"""

import json
import os
from pathlib import Path

def update_testimonials():
    """새 후기를 testimonials.json에 추가"""
    
    # 파일 경로 설정
    base_dir = Path("C:/Users/ahfif/SuperClaude/Project_SCM_Site")
    testimonials_file = base_dir / "data" / "testimonials.json"
    new_reviews_file = base_dir / "data" / "new_career_reviews_20250808_085427.json"
    
    print("📝 testimonials.json 업데이트 시작...")
    
    # 기존 testimonials.json 로드
    with open(testimonials_file, 'r', encoding='utf-8') as f:
        testimonials_data = json.load(f)
    
    # 새로운 후기 데이터 로드
    with open(new_reviews_file, 'r', encoding='utf-8') as f:
        new_reviews = json.load(f)
    
    print(f"기존 후기 수: {len(testimonials_data['testimonials'])}")
    print(f"추가할 새 후기 수: {len(new_reviews)}")
    
    # 기존 커리어 컨설팅 후기 ID 수집 (중복 방지)
    existing_ids = set()
    career_count_before = 0
    
    for testimonial in testimonials_data['testimonials']:
        existing_ids.add(testimonial['id'])
        if testimonial['category'] == 'career_consulting':
            career_count_before += 1
    
    print(f"기존 커리어 컨설팅 후기 수: {career_count_before}")
    
    # 새로운 후기 추가 (중복 제거)
    added_count = 0
    for new_review in new_reviews:
        if new_review['id'] not in existing_ids:
            testimonials_data['testimonials'].append(new_review)
            added_count += 1
            print(f"✅ 추가됨: {new_review['name']} - {new_review['achievement']}")
        else:
            print(f"⚠️  중복 건너뜀: {new_review['id']}")
    
    # 날짜순으로 정렬 (최신순)
    testimonials_data['testimonials'].sort(key=lambda x: x['date'], reverse=True)
    
    # 통계 정보 업데이트
    total_count = len(testimonials_data['testimonials'])
    career_count = sum(1 for t in testimonials_data['testimonials'] if t['category'] == 'career_consulting')
    scm_count = sum(1 for t in testimonials_data['testimonials'] if t['category'] == 'scm_course')
    featured_count = sum(1 for t in testimonials_data['testimonials'] if t.get('featured', False))
    
    # 평점 분포 계산
    rating_distribution = {}
    for rating in range(1, 6):
        rating_distribution[str(rating)] = sum(1 for t in testimonials_data['testimonials'] if t.get('rating', 5) == rating)
    
    # 날짜 범위 계산
    dates = [t['date'] for t in testimonials_data['testimonials'] if 'date' in t]
    earliest_date = min(dates) if dates else None
    latest_date = max(dates) if dates else None
    
    # summary 섹션 업데이트
    testimonials_data['summary'] = {
        "total_count": total_count,
        "scm_course_count": scm_count,
        "career_consulting_count": career_count,
        "rating_distribution": rating_distribution,
        "featured_count": featured_count,
        "date_range": {
            "earliest": earliest_date,
            "latest": latest_date
        }
    }
    
    # 백업 생성
    backup_file = testimonials_file.with_suffix('.json.backup')
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(testimonials_data, f, ensure_ascii=False, indent=2)
    print(f"💾 백업 파일 생성: {backup_file}")
    
    # 업데이트된 파일 저장
    with open(testimonials_file, 'w', encoding='utf-8') as f:
        json.dump(testimonials_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n📊 업데이트 완료!")
    print(f"총 후기 수: {career_count_before} → {career_count} (+{career_count - career_count_before})")
    print(f"전체 후기 수: {total_count}")
    print(f"추천 후기 수: {featured_count}")
    print(f"평점 분포: {rating_distribution}")
    print(f"날짜 범위: {earliest_date} ~ {latest_date}")
    
    return True

if __name__ == "__main__":
    try:
        update_testimonials()
        print("\n🎉 testimonials.json 업데이트 성공!")
    except Exception as e:
        print(f"❌ 오류 발생: {e}")