const http = require('http');
const https = require('https');
const url = require('url');

function httpRequest(method, fullUrl, headers, body = null) {
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(fullUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
            path: parsedUrl.path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        for (let k of Object.keys(headers)) {
            options.headers[k] = headers[k];
        }

        if (body) {
            options.headers['Content-Length'] = Buffer.from(body).length;
        }

        const req = protocol.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: responseData,
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(body);
        }

        req.end();
    });
}

function post(fullUrl, headers, body = null) {
    return httpRequest("POST", fullUrl, headers, body);
}

function get(fullUrl, headers) {
    return httpRequest("GET", fullUrl, headers);
}

module.exports = {
    post,
    get
};
