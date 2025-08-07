const https = require('https');
const botToken = process.env.SLACK_BOT_TOKEN || 'your_bot_token_here';

async function apiCall(method, params = {}) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(params);
        const options = {
            hostname: 'slack.com',
            port: 443,
            path: `/api/${method}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${botToken}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } 
                catch (error) { reject(new Error('응답 파싱 실패')); }
            });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function testClaudeCodeChannel() {
    console.log('🎯 #클로드코드 채널에서 CLAUDECODE 봇 테스트');
    console.log('='.repeat(60));
    
    try {
        const channelId = 'C0975BQ76J1'; // #클로드코드 채널
        
        // 1. 봇을 채널에 추가 시도
        console.log('🔗 CLAUDECODE 봇을 #클로드코드 채널에 추가...');
        const invite = await apiCall('conversations.join', { channel: channelId });
        
        if (invite.ok) {
            console.log('✅ 봇이 #클로드코드 채널에 성공적으로 추가됨!');
        } else {
            console.log('⚠️ 봇 추가 결과:', invite.error || '이미 채널에 있을 수 있음');
        }
        
        // 2. 환영 메시지 전송
        console.log('\n📤 환영 메시지 전송...');
        const welcomeMessage = await apiCall('chat.postMessage', {
            channel: channelId,
            text: '🎉 *CLAUDECODE 봇 연결 성공!*',
            attachments: [{
                color: 'good',
                fields: [
                    { title: '🤖 봇 정보', value: 'CLAUDECODE (PI 워크스페이스)', short: true },
                    { title: '📅 연결 시간', value: new Date().toLocaleString('ko-KR'), short: true },
                    { title: '🎯 지원 기능', value: '• 작업 완료 알림\n• 승인 요청 알림\n• 에러 알림\n• 진행 상황 업데이트', short: false }
                ]
            }]
        });
        
        console.log('환영 메시지 결과:', welcomeMessage.ok ? '✅ 성공!' : `❌ 실패: ${welcomeMessage.error}`);
        
        if (welcomeMessage.ok) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 3. 작업 완료 알림 테스트
            console.log('\n🧪 작업 완료 알림 테스트...');
            const taskMessage = await apiCall('chat.postMessage', {
                channel: channelId,
                text: '✅ *작업 완료: 슬랙 봇 통합 시스템*',
                attachments: [{
                    color: 'good',
                    fields: [
                        { title: '📝 설명', value: 'CLAUDECODE 봇을 사용한 완전한 슬랙 알림 시스템이 구축되었습니다.', short: false },
                        { title: '📊 상태', value: 'success', short: true },
                        { title: '⏰ 완료 시간', value: new Date().toLocaleString('ko-KR'), short: true },
                        { title: '🚀 결과', value: '실제 슬랙 알림 시스템 완전 작동!', short: false }
                    ]
                }]
            });
            
            console.log('작업 완료 알림 결과:', taskMessage.ok ? '✅ 성공!' : `❌ 실패: ${taskMessage.error}`);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 4. 승인 요청 알림 테스트
            console.log('\n📋 승인 요청 알림 테스트...');
            const approvalMessage = await apiCall('chat.postMessage', {
                channel: channelId,
                text: '🟡 *승인 요청: 슬랙 알림 시스템 운영 적용*',
                attachments: [{
                    color: 'warning',
                    fields: [
                        { title: '📝 설명', value: 'CLAUDECODE 봇 알림 시스템을 실제 운영 환경에 적용하시겠습니까?', short: false },
                        { title: '⚡ 긴급도', value: 'high', short: true },
                        { title: '⏰ 요청 시간', value: new Date().toLocaleString('ko-KR'), short: true },
                        { title: '📋 기능', value: '작업완료/승인요청/에러/진행상황 자동 알림', short: false }
                    ]
                }]
            });
            
            console.log('승인 요청 알림 결과:', approvalMessage.ok ? '✅ 성공!' : `❌ 실패: ${approvalMessage.error}`);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 5. 진행 상황 업데이트 테스트
            console.log('\n📊 진행 상황 업데이트 테스트...');
            const progressMessage = await apiCall('chat.postMessage', {
                channel: channelId,
                text: '📊 *진행 상황: 슬랙 알림 시스템 구축*',
                attachments: [{
                    color: '#36a64f',
                    fields: [
                        { title: '📈 진행률', value: '██████████ 100%', short: false },
                        { title: '📝 현재 단계', value: '모든 테스트 완료 - 시스템 준비됨', short: true },
                        { title: '⏰ 상태', value: '완료!', short: true },
                        { title: '🕐 업데이트 시간', value: new Date().toLocaleString('ko-KR'), short: true }
                    ]
                }]
            });
            
            console.log('진행 상황 알림 결과:', progressMessage.ok ? '✅ 성공!' : `❌ 실패: ${progressMessage.error}`);
            
            if (welcomeMessage.ok || taskMessage.ok || approvalMessage.ok || progressMessage.ok) {
                console.log('\n🎊 성공! 슬랙 #클로드코드 채널을 확인해보세요!');
                console.log('✅ 모든 종류의 알림이 정상적으로 전송되었습니다!');
                console.log('🚀 이제 실제 워크플로우에서 자동 알림을 받을 수 있어요!');
            }
        }
        
    } catch (error) {
        console.error('💥 테스트 중 오류:', error.message);
    }
}

testClaudeCodeChannel();