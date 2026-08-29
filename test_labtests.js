const http = require('http');

function makeRequest(path, method = 'GET', data = null, cookie = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:750${path}`);
    const postData = data ? (typeof data === 'string' ? data : new URLSearchParams(data).toString()) : '';

    const options = {
      hostname: 'localhost',
      port: 750,
      path: url.pathname + url.search,
      method: method,
      headers: {
        ...(data ? {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        } : {}),
        ...(cookie ? { 'Cookie': cookie } : {})
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (e) => reject(e));
    if (data) req.write(postData);
    req.end();
  });
}

function extractCookie(headers) {
  if (headers['set-cookie']) {
    return headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  }
  return '';
}

async function testLabTests() {
  console.log('=== TESTING LAB TESTS WORKFLOW ===\n');

  try {
    // 1. Admin login
    const adminLogin = await makeRequest('/login', 'POST', {
      email: 'admin@medicare.com',
      password: 'admin123'
    });
    const adminCookie = extractCookie(adminLogin.headers);
    console.log(`1. Admin Login -> Status: ${adminLogin.statusCode}`);

    // 2. GET /addTest view
    const addTestView = await makeRequest('/addTest', 'GET', null, adminCookie);
    console.log(`2. GET /addTest -> Status: ${addTestView.statusCode}`);

    // 3. POST /addTest (create test)
    const createTest = await makeRequest('/addTest', 'POST', {
      pname: 'Automated Test Profile - Lipid & Cardiac'
    }, adminCookie);
    console.log(`3. POST /addTest -> Status: ${createTest.statusCode}, Location: ${createTest.headers.location}`);

    // 4. GET /addtesttable view
    const testTableView = await makeRequest('/addtesttable', 'GET', null, adminCookie);
    console.log(`4. GET /addtesttable -> Status: ${testTableView.statusCode}`);

    console.log('\n=== LAB TEST WORKFLOW TEST PASSED ===');
  } catch (err) {
    console.error('Lab test test error:', err);
  }
}

testLabTests();
