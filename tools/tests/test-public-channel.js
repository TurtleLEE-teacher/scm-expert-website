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

async function testPublicChannel() {
    console.log('🔍 공개 채널 직접 테스트');
    console.log('='.repeat(50));
    
    try {
        // 1. 채널 목록 확인
        const channels = await apiCall('conversations.list', {
            types: 'public_channel',
            limit: 20
        });
        
        console.log('📋 사용 가능한 공개 채널:');
        if (channels.channels) {
            channels.channels.forEach((channel, index) => {
                console.log(`  ${index + 1}. #${channel.name} (${channel.id})`);
                console.log(`     멤버: ${channel.num_members}명, 생성: ${new Date(channel.created * 1000).toLocaleDateString()}`);
            });
        }
        
        // 2. general 채널 찾기
        const generalChannel = channels.channels?.find(ch => ch.name === 'general');
        
        if (generalChannel) {
            console.log(`\\n🎯 #general 채널 발견: ${generalChannel.id}`);
            
            // 3. 봇을 채널에 초대 시도
            console.log('🔗 봇을 #general 채널에 추가 시도...');
            const invite = await apiCall('conversations.join', {
                channel: generalChannel.id
            });
            
            if (invite.ok) {
                console.log('✅ 봇이 #general 채널에 성공적으로 추가됨!');
                
                // 4. 메시지 전송 테스트
                console.log('📤 환영 메시지 전송...');
                const message = await apiCall('chat.postMessage', {
                    channel: generalChannel.id,
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
                                    value: 'Bot Token으로 성공적으로 연결됨',
                                    short: true
                                },
                                {
                                    title: '📅 연결 시간',
                                    value: new Date().toLocaleString('ko-KR'),
                                    short: true
                                },
                                {
                                    title: '🎯 지원 기능',
                                    value: '• 작업 완료 알림\\n• 승인 요청 알림\\n• 에러 알림\\n• 진행 상황 업데이트',
                                    short: false
                                }
                            ]
                        }
                    ]
                });
                
                if (message.ok) {
                    console.log('🎊 메시지 전송 성공!');
                    console.log('📱 슬랙 #general 채널을 확인해보세요!');
                    
                    // 5. 추가 테스트 메시지
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    console.log('\\n🧪 작업 완료 알림 테스트...');
                    const taskMessage = await apiCall('chat.postMessage', {
                        channel: generalChannel.id,
                        text: '✅ *작업 완료: 슬랙 봇 통합 시스템*',
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
                                        title: '🚀 결과',
                                        value: '실제 슬랙 알림 시스템 완전 작동!',
                                        short: false
                                    }
                                ]
                            }
                        ]
                    });
                    
                    if (taskMessage.ok) {
                        console.log('🎉 작업 완료 알림도 성공!');
                        console.log('');
                        console.log('🚀 완벽한 슬랙 알림 시스템이 구축되었습니다!');
                        console.log('💡 이제 모든 작업에서 자동으로 #general 채널로 알림을 받을 수 있어요!');
                    }
                    
                } else {
                    console.log('❌ 메시지 전송 실패:', message.error);
                }
                
            } else {
                console.log('❌ 봇 채널 추가 실패:', invite.error);
                console.log('💡 수동으로 #general 채널에서 \"/invite @claudecode\" 를 실행해보세요.');
            }
            
        } else {
            console.log('❌ #general 채널을 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('💥 테스트 중 오류:', error.message);
    }
}

testPublicChannel();