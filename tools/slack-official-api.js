const https = require('https');

class OfficialSlackNotifier {
    constructor(token) {
        this.token = token || process.env.SLACK_BOT_TOKEN;
        this.baseUrl = 'slack.com';
        this.defaultChannel = process.env.SLACK_DEFAULT_CHANNEL || 'C0975BQ76J1'; // #클로드코드
    }

    async apiCall(method, params = {}) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(params);
            
            const options = {
                hostname: this.baseUrl,
                port: 443,
                path: `/api/${method}`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
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

    async sendTaskCompletionNotification(data) {
        const color = data.status === 'success' ? 'good' : data.status === 'error' ? 'danger' : 'warning';
        const emoji = data.status === 'success' ? '✅' : data.status === 'error' ? '❌' : '⚠️';
        
        const message = await this.apiCall('chat.postMessage', {
            channel: this.defaultChannel,
            text: `${emoji} *작업 완료: ${data.taskName}*`,
            attachments: [{
                color: color,
                fields: [
                    { title: '📝 설명', value: data.description, short: false },
                    { title: '📊 상태', value: data.status, short: true },
                    { title: '⏰ 완료 시간', value: new Date().toLocaleString('ko-KR'), short: true },
                    ...(data.details ? [{ title: '🔧 세부 정보', value: JSON.stringify(data.details, null, 2), short: false }] : [])
                ]
            }]
        });
        
        return message.ok;
    }

    async sendApprovalRequestNotification(data) {
        const urgencyEmoji = data.urgency === 'critical' ? '🔴' : data.urgency === 'high' ? '🟡' : '🟢';
        
        const message = await this.apiCall('chat.postMessage', {
            channel: this.defaultChannel,
            text: `${urgencyEmoji} *승인 요청: ${data.requestType}*`,
            attachments: [{
                color: 'warning',
                fields: [
                    { title: '📝 설명', value: data.description, short: false },
                    { title: '⚡ 긴급도', value: data.urgency, short: true },
                    { title: '⏰ 요청 시간', value: new Date().toLocaleString('ko-KR'), short: true },
                    ...(data.context ? [{ title: '📋 상세 정보', value: JSON.stringify(data.context, null, 2), short: false }] : [])
                ]
            }]
        });
        
        return message.ok;
    }

    async sendErrorNotification(data) {
        const severityEmoji = data.severity === 'high' ? '🚨' : data.severity === 'medium' ? '⚠️' : '💡';
        
        const message = await this.apiCall('chat.postMessage', {
            channel: this.defaultChannel,
            text: `${severityEmoji} *에러 발생: ${data.errorType}*`,
            attachments: [{
                color: 'danger',
                fields: [
                    { title: '📝 메시지', value: data.message, short: false },
                    { title: '⚡ 심각도', value: data.severity, short: true },
                    { title: '⏰ 발생 시간', value: new Date().toLocaleString('ko-KR'), short: true },
                    ...(data.context ? [{ title: '🔧 상세 정보', value: JSON.stringify(data.context, null, 2), short: false }] : [])
                ]
            }]
        });
        
        return message.ok;
    }
}

module.exports = OfficialSlackNotifier;