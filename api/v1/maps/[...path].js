// Vercel Serverless Function - 상권분석 API 프록시
// /api/v1/maps/* -> api.sanai.im/v1/maps/*

export default async function handler(req, res) {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const pathSegments = req.query.path || [];
        const apiPath = pathSegments.join('/');

        // 쿼리스트링 추출
        const url = new URL(req.url, `https://${req.headers.host}`);
        const queryString = url.search;

        const targetUrl = `https://api.sanai.im/v1/maps/${apiPath}${queryString}`;

        console.log('Proxying to:', targetUrl);

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
}
