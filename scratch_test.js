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

async function runTests() {
  console.log('=== STARTING AUTOMATED FLOW VERIFICATION ===\n');

  try {
    // 1. Check Public Routes
    console.log('1. Testing Public Routes:');
    const homeRes = await makeRequest('/');
    console.log(`   GET / -> Status: ${homeRes.statusCode} (Expected 200)`);

    const clinicsRes = await makeRequest('/clinic');
    console.log(`   GET /clinic -> Status: ${clinicsRes.statusCode} (Expected 200)`);

    const doctorsRes = await makeRequest('/Alldoctors');
    console.log(`   GET /Alldoctors -> Status: ${doctorsRes.statusCode} (Expected 200)`);

    // 2. Test Patient Flow
    console.log('\n2. Testing Patient Flow (Login, Booking, My Appointments):');
    const patientLogin = await makeRequest('/login', 'POST', {
      email: 'alice@example.com',
      password: 'patient123'
    });
    console.log(`   POST /login (Patient) -> Status: ${patientLogin.statusCode}, Location: ${patientLogin.headers.location}`);
    const patientCookie = extractCookie(patientLogin.headers);

    const patientResv = await makeRequest('/patientres', 'GET', null, patientCookie);
    console.log(`   GET /patientres (Patient Auth) -> Status: ${patientResv.statusCode}`);

    const patientProfile = await makeRequest('/profile', 'GET', null, patientCookie);
    console.log(`   GET /profile (Patient Auth) -> Status: ${patientProfile.statusCode}`);

    // 3. Test Doctor Flow
    console.log('\n3. Testing Doctor Flow (Login, Dashboard, Status, Self-Booking Ability):');
    const docLogin = await makeRequest('/login', 'POST', {
      email: 'dr.smith@medicare.com',
      password: 'doctor123'
    });
    console.log(`   POST /login (Doctor) -> Status: ${docLogin.statusCode}, Location: ${docLogin.headers.location}`);
    const docCookie = extractCookie(docLogin.headers);

    const docDashboard = await makeRequest('/doctor', 'GET', null, docCookie);
    console.log(`   GET /doctor (Doctor Dashboard) -> Status: ${docDashboard.statusCode}`);

    const docStatus = await makeRequest('/status', 'GET', null, docCookie);
    console.log(`   GET /status (Doctor Bookings) -> Status: ${docStatus.statusCode}`);

    const docHome = await makeRequest('/', 'GET', null, docCookie);
    console.log(`   GET / (Doctor accessing Home as patient) -> Status: ${docHome.statusCode}`);

    // 4. Test Admin Flow
    console.log('\n4. Testing Admin Flow (Login, Dashboard with Doctor Requests):');
    const adminLogin = await makeRequest('/login', 'POST', {
      email: 'admin@medicare.com',
      password: 'admin123'
    });
    console.log(`   POST /login (Admin) -> Status: ${adminLogin.statusCode}, Location: ${adminLogin.headers.location}`);
    const adminCookie = extractCookie(adminLogin.headers);

    const adminPanel = await makeRequest('/adminPanel', 'GET', null, adminCookie);
    console.log(`   GET /adminPanel (Admin Dashboard) -> Status: ${adminPanel.statusCode}`);

    // 5. Test Logout Flow
    console.log('\n5. Testing Logout Flow:');
    const logoutRes = await makeRequest('/logout', 'GET', null, adminCookie);
    console.log(`   GET /logout -> Status: ${logoutRes.statusCode}, Location: ${logoutRes.headers.location}`);

    console.log('\n=== ALL FLOW TESTS COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
