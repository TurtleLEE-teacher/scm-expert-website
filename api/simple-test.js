// 가장 간단한 API 테스트
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    message: 'Vercel Functions is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}