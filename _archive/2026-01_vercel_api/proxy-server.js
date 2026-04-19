// 간단한 CORS 프록시 서버
// 실행: node proxy-server.js

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API 프록시: /api/* -> api.sanai.im/*
    if (req.url.startsWith('/api/')) {
        const apiPath = req.url.replace('/api/', '');
        const targetUrl = `https://api.sanai.im/${apiPath}`;

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const urlObj = new URL(targetUrl);
            const options = {
                hostname: urlObj.hostname,
                port: 443,
                path: urlObj.pathname + urlObj.search,
                method: req.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            const proxyReq = https.request(options, proxyRes => {
                res.writeHead(proxyRes.statusCode, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                proxyRes.pipe(res);
            });

            proxyReq.on('error', err => {
                res.writeHead(500);
                res.end(JSON.stringify({ error: err.message }));
            });

            if (body) proxyReq.write(body);
            proxyReq.end();
        });
        return;
    }

    // 정적 파일 서빙
    let filePath = req.url === '/' ? '/sangwon_analysis.html' : req.url;
    filePath = path.join(__dirname, filePath.split('?')[0]);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`
========================================
  프록시 서버 실행 중: http://localhost:${PORT}
========================================

  sangwon_analysis.html 열기:
  http://localhost:${PORT}/sangwon_analysis.html

  API 프록시 경로:
  /api/v1/maps/* -> api.sanai.im/v1/maps/*

========================================
`);
});
