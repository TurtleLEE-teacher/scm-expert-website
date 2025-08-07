const OfficialSlackNotifier = require('./slack-official-api.js');

async function finalVerificationTest() {
    console.log('🔥 슬랙 알림 시스템 최종 검증 테스트');
    console.log('='.repeat(60));
    console.log('간소화된 시스템: 꼭 필요한 3가지 알림만');
    console.log('');
    
    const botToken = process.env.SLACK_BOT_TOKEN || 'your_bot_token_here';
    
    try {
        const notifier = new OfficialSlackNotifier(botToken);
        
        // 초기화 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🧪 간소화된 알림 시스템 테스트 시작...\n');
        
        // 1. 작업 완료 알림 (핵심!)
        console.log('1️⃣ 작업 완료 알림 테스트...');
        const result1 = await notifier.sendTaskCompletionNotification({
            taskName: '✅ 최종 검증: 슬랙 알림 시스템 완성',
            description: '간소화된 알림 시스템이 완벽하게 작동합니다! 이제 꼭 필요한 알림만 받게 됩니다.',
            status: 'success',
            details: {
                활성화된알림: '작업완료, 승인요청, 에러발생',
                비활성화된알림: '진행상황, 작업시작',
                상태: '최종 검증 완료',
                시간: new Date().toLocaleString('ko-KR')
            }
        });
        console.log('결과:', result1 ? '✅ 성공!' : '❌ 실패');
        
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // 2. 승인 요청 알림 (핵심!)
        console.log('\n2️⃣ 승인 요청 알림 테스트...');
        const result2 = await notifier.sendApprovalRequestNotification({
            requestType: '간소화된 슬랙 알림 시스템 최종 승인',
            description: '불필요한 알림을 제거하고 꼭 필요한 3가지 알림만 남긴 시스템을 운영 환경에 적용하시겠습니까?',
            urgency: 'medium',
            context: {
                변경사항: '진행상황 알림 제거, 작업시작 알림 제거',
                남은알림: ['작업완료', '승인요청', '에러발생'],
                장점: '깔끔한 알림, 필요한 정보만',
                권장사항: '즉시 적용'
            }
        });
        console.log('결과:', result2 ? '✅ 성공!' : '❌ 실패');
        
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // 3. 에러 알림 (핵심!)
        console.log('\n3️⃣ 에러 알림 테스트...');
        const result3 = await notifier.sendErrorNotification({
            errorType: '테스트 에러 (시뮬레이션)',
            message: '이것은 에러 알림 테스트입니다. 실제 에러 발생 시에만 이런 알림을 받게 됩니다.',
            severity: 'low',
            context: {
                목적: '에러 알림 기능 검증',
                상태: '테스트용 시뮬레이션',
                실제상황: '문제 발생 시에만 알림',
                조치: '테스트이므로 무시하세요'
            }
        });
        console.log('결과:', result3 ? '✅ 성공!' : '❌ 실패');
        
        console.log('\n' + '='.repeat(60));
        
        const successCount = [result1, result2, result3].filter(Boolean).length;
        if (successCount === 3) {
            console.log('🎊 완벽한 성공! 3/3개 핵심 알림 모두 전송됨!');
            console.log('');
            console.log('✅ 검증 완료된 기능:');
            console.log('   - 작업 완료 시 슬랙 알림 ✅');
            console.log('   - 승인 요청 시 슬랙 알림 ✅'); 
            console.log('   - 에러 발생 시 슬랙 알림 ✅');
            console.log('');
            console.log('❌ 제거된 불필요한 알림:');
            console.log('   - 진행 상황 알림 (너무 많아서 제거)');
            console.log('   - 작업 시작 알림 (불필요해서 제거)');
            console.log('');
            console.log('🚀 최종 결론: 완벽한 슬랙 알림 시스템 구축 완료!');
            console.log('📱 이제 슬랙에서 깔끔한 알림을 확인해보세요!');
        } else {
            console.log(`⚠️ ${successCount}/3개 알림 성공`);
            if (successCount > 0) {
                console.log('부분적으로 작동하고 있습니다.');
            }
        }
        
    } catch (error) {
        console.error('💥 최종 검증 중 오류:', error.message);
    }
}

finalVerificationTest();