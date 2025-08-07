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
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(new Error('응답 파싱 실패'));
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function testBotDM() {
    console.log('🤖 CLAUDECODE 봇 DM 테스트');
    console.log('='.repeat(50));
    
    try {
        // 1. 봇 정보 확인
        const authTest = await apiCall('auth.test');
        console.log('✅ 봇 인증 성공:', authTest.user);
        console.log('🏢 워크스페이스:', authTest.team);
        
        // 2. 사용자와 DM 채널 열기
        console.log('\n📂 ahfifa와 DM 채널 열기...');
        const dmChannel = await apiCall('conversations.open', {
            users: 'U02NNUP64JY'  // ahfifa의 user_id
        });
        
        if (dmChannel.ok) {
            console.log('✅ DM 채널 생성 성공:', dmChannel.channel.id);
            
            // 3. 환영 메시지 전송
            console.log('\n📨 환영 메시지 전송...');
            const message = await apiCall('chat.postMessage', {
                channel: dmChannel.channel.id,
                text: '🎉 *CLAUDECODE 봇 연결 성공!*',
                attachments: [
                    {
                        color: 'good',
                        fields: [
                            {
                                title: '🤖 봇 정보',
                                value: 'CLAUDECODE (PI 워크스페이스)',
                                short: true
                            },
                            {
                                title: '✅ 연결 상태',
                                value: 'Bot Token 연결 성공',
                                short: true
                            },
                            {
                                title: '📅 연결 시간',
                                value: new Date().toLocaleString('ko-KR'),
                                short: true
                            },
                            {
                                title: '🎯 지원 기능',
                                value: '• 작업 완료 알림\n• 승인 요청 알림\n• 에러 알림\n• 진행 상황 업데이트',
                                short: false
                            },
                            {
                                title: '🚀 다음 단계',
                                value: '이제 모든 Claude 작업에서 자동으로 슬랙 알림을 받을 수 있습니다!',
                                short: false
                            }
                        ]
                    }
                ]
            });
            
            if (message.ok) {
                console.log('🎊 DM 메시지 전송 성공!');
                console.log('📱 슬랙 DM을 확인해보세요!');
                
                // 4. 추가 테스트: 작업 완료 알림 시뮬레이션
                console.log('\n🧪 작업 완료 알림 테스트...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const taskNotification = await apiCall('chat.postMessage', {
                    channel: dmChannel.channel.id,
                    text: '✅ *작업 완료: 슬랙 봇 통합 시스템 구축*',
                    attachments: [
                        {
                            color: 'good',
                            fields: [
                                {
                                    title: '📝 설명',
                                    value: 'CLAUDECODE 봇을 사용한 완전한 슬랙 알림 시스템이 구축되었습니다.',
                                    short: false
                                },
                                {
                                    title: '📊 상태',
                                    value: 'success',
                                    short: true
                                },
                                {
                                    title: '⏰ 완료 시간',
                                    value: new Date().toLocaleString('ko-KR'),
                                    short: true
                                },
                                {
                                    title: '🔧 구현 기능',
                                    value: 'Bot Token 인증, DM 알림, 자동 워크플로우 통합',
                                    short: true
                                },
                                {
                                    title: '🎯 결과',
                                    value: '실제 슬랙 알림 시스템 완전 작동',
                                    short: true
                                }
                            ]
                        }
                    ]
                });
                
                if (taskNotification.ok) {
                    console.log('🎉 작업 완료 알림도 성공!');
                    console.log('');
                    console.log('🚀 완벽한 슬랙 알림 시스템이 구축되었습니다!');
                    console.log('💡 이제 모든 작업에서 자동으로 DM 알림을 받을 수 있어요!');
                }
                
            } else {
                console.log('❌ 메시지 전송 실패:', message.error);
            }
            
        } else {
            console.log('❌ DM 채널 생성 실패:', dmChannel.error);
        }
        
    } catch (error) {
        console.error('💥 테스트 중 오류:', error.message);
    }
}

testBotDM();