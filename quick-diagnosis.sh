#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 빠른 진단 스크립트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Git 상태
echo "1️⃣ Git 브랜치 및 커밋 상태:"
echo "   현재 브랜치: $(git branch --show-current)"
echo "   최근 커밋: $(git log -1 --oneline)"
echo ""

# 2. reviews.json 상태
echo "2️⃣ reviews.json 데이터 상태:"
if [ -f "data/reviews.json" ]; then
    echo "   마지막 업데이트: $(node -e "console.log(require('./data/reviews.json').lastUpdated)")"
    echo "   총 후기: $(node -e "console.log(require('./data/reviews.json').data.length)")"
    echo ""
    echo "   카테고리 분포:"
    node -e "
    const data = require('./data/reviews.json');
    const cats = {};
    data.data.forEach(r => cats[r.category] = (cats[r.category] || 0) + 1);
    Object.entries(cats).forEach(([k,v]) => console.log('     - ' + k + ': ' + v + '개'));
    "
    echo ""
    echo "   평점 분포:"
    node -e "
    const data = require('./data/reviews.json');
    const rats = {};
    data.data.forEach(r => rats[r.rating] = (rats[r.rating] || 0) + 1);
    Object.entries(rats).sort((a,b) => a[0] - b[0]).forEach(([k,v]) => console.log('     - ' + k + '점: ' + v + '개'));
    "
else
    echo "   ❌ reviews.json 파일이 없습니다!"
fi
echo ""

# 3. PR 상태 (GitHub CLI 있는 경우)
echo "3️⃣ GitHub 상태:"
if command -v gh &> /dev/null; then
    echo "   PR 상태:"
    gh pr list --head claude/fix-review-display-UhTCJ 2>/dev/null || echo "     (gh CLI로 확인 불가)"
else
    echo "   수동 확인 필요: https://github.com/TurtleLEE-teacher/scm-expert-website/pulls"
fi
echo ""

# 4. 분석 결과
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 분석 결과:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LAST_UPDATE=$(node -e "console.log(require('./data/reviews.json').lastUpdated)" 2>/dev/null)
CONSULTING_COUNT=$(node -e "const d=require('./data/reviews.json');console.log(d.data.filter(r=>r.category==='consulting').length)" 2>/dev/null)
LOW_RATING_COUNT=$(node -e "const d=require('./data/reviews.json');console.log(d.data.filter(r=>r.rating<5).length)" 2>/dev/null)

if [ "$CONSULTING_COUNT" = "0" ]; then
    echo "❌ 컨설팅 후기: 없음 (0개)"
else
    echo "✅ 컨설팅 후기: $CONSULTING_COUNT 개"
fi

if [ "$LOW_RATING_COUNT" = "0" ]; then
    echo "❌ 4점 이하 후기: 없음 (0개)"
else
    echo "✅ 4점 이하 후기: $LOW_RATING_COUNT 개"
fi

echo ""
echo "마지막 데이터 업데이트: $LAST_UPDATE"
echo ""

if [ "$CONSULTING_COUNT" = "0" ] || [ "$LOW_RATING_COUNT" = "0" ]; then
    echo "⚠️  문제 확인됨!"
    echo ""
    echo "다음을 확인하세요:"
    echo "1. GitHub Actions 실행 여부"
    echo "2. Notion DB에 실제 데이터 존재 여부"
    echo "3. Notion 필드 타입 (Select / Number)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
