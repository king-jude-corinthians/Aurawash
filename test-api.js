const http = require('http');
const https = require('https');
const url = require('url');

function req(method, path, data) {
  return new Promise((resolve, reject) => {
    const u = url.parse(path);
    const lib = u.protocol === 'https:' ? https : http;
    const opts = { hostname: u.hostname, port: u.port, path: u.path, method, headers: {} };
    if (data) {
      const s = JSON.stringify(data);
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(s);
    }
    const r = lib.request(opts, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null }); }
        catch (e) { resolve({ status: res.statusCode, body }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

(async () => {
  try {
    console.log('Checking health...');
    const health = await req('GET', 'http://localhost:3000/api/health');
    console.log('Health:', health);

    const random = Math.floor(Math.random()*100000);
    const email = `tester+${random}@example.com`;
    console.log('Attempting signup with', email);
    const signup = await req('POST', 'http://localhost:3000/api/auth/signup', { name: 'Test User', email, password: 'Password123!' });
    console.log('Signup:', signup);
  } catch (err) {
    console.error('Error:', err);
  }
})();
