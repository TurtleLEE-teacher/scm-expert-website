const https = require('https');

const token = process.env.SLACK_EXTENDED_TOKEN || 'your_extended_token_here';

async function apiCall(method, params = {}) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(params);
        
        const options = {
            hostname: 'slack.com',
            port: 443,
            path: `/api/${method}`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (error) {
                    reject(new Error('응답 파싱 실패: ' + error.message));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error('네트워크 오류: ' + error.message));
        });

        req.write(postData);
        req.end();
    });
}

async function checkScopes() {
    console.log('🔍 토큰 스코프 및 권한 상세 분석');
    console.log('='.repeat(50));
    
    try {
        // 1. auth.test로 상세 정보 확인
        console.log('\n1️⃣ 토큰 정보 분석');
        const authTest = await apiCall('auth.test');
        console.log('전체 응답:', JSON.stringify(authTest, null, 2));
        
        // 2. 다양한 API 엔드포인트 시도해서 어떤 권한이 있는지 확인
        const endpoints = [
            'users.info',
            'team.info', 
            'conversations.list',
            'users.conversations',
            'chat.postMessage',
            'files.list',
            'search.messages',
            'usergroups.list',
            'emoji.list'
        ];
        
        console.log('\n2️⃣ 권한 테스트 (각 API 엔드포인트)');
        for (const endpoint of endpoints) {
            try {
                let params = {};
                
                // 필수 파라미터 추가
                if (endpoint === 'users.info') {
                    params.user = authTest.user_id;
                }
                if (endpoint === 'chat.postMessage') {
                    params.channel = authTest.user_id;
                    params.text = 'test';
                }
                
                const result = await apiCall(endpoint, params);
                
                if (result.ok) {
                    console.log(`✅ ${endpoint}: 권한 있음`);
                } else {
                    console.log(`❌ ${endpoint}: ${result.error}`);
                }
            } catch (error) {
                console.log(`💥 ${endpoint}: ${error.message}`);
            }
        }
        
        // 3. 대안 방법: 웹훅 URL 시도
        console.log('\n3️⃣ 웹훅 및 대안 방법 테스트');
        
        // incoming webhook 생성 시도
        try {
            const webhook = await apiCall('incoming-webhooks.list');
            console.log('✅ 웹훅 목록:', webhook);
        } catch (error) {
            console.log('❌ 웹훅 실패:', error.message);
        }
        
        // 4. 토큰 정보 디코딩 시도
        console.log('\n4️⃣ 토큰 분석');
        console.log('토큰 타입: Extended (xoxe.xoxp)');
        console.log('토큰 길이:', token.length);
        
        // 토큰을 base64 디코딩해서 정보 확인 시도
        const tokenParts = token.split('-');
        console.log('토큰 구성 요소:', tokenParts.length, '개');
        tokenParts.forEach((part, index) => {
            console.log(`  파트 ${index + 1}: ${part.substring(0, 20)}... (길이: ${part.length})`);
        });
        
    } catch (error) {
        console.error('💥 스코프 확인 중 오류:', error.message);
    }
}

checkScopes();