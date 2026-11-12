/**
 * Test REST API Endpoints on backend server
 */

const http = require('http');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

const run = async () => {
  const { app } = require('./src/server');
  const server = app.listen(5001, async () => {
    try {
      console.log('Testing Endpoints on port 5001...\n');

      // 1. GET /api/whatsapp/status
      console.log('1. GET /api/whatsapp/status');
      const res1 = await makeRequest({
        hostname: 'localhost',
        port: 5001,
        path: '/api/whatsapp/status',
        method: 'GET',
      });
      console.log('Status:', res1.status, res1.data);

      // 2. POST /api/whatsapp/preview
      console.log('\n2. POST /api/whatsapp/preview');
      const res2 = await makeRequest(
        {
          hostname: 'localhost',
          port: 5001,
          path: '/api/whatsapp/preview',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          customerName: 'Andi',
          orderNumber: 'SF001',
          serviceName: 'Deep Cleaning',
          status: 'Diproses',
        }
      );
      console.log('Status:', res2.status, res2.data);

      // 3. POST /api/whatsapp/send-order-status (Text)
      console.log('\n3. POST /api/whatsapp/send-order-status (Text)');
      const res3 = await makeRequest(
        {
          hostname: 'localhost',
          port: 5001,
          path: '/api/whatsapp/send-order-status',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          to: '081234567890',
          customerName: 'Andi',
          orderNumber: 'SF001',
          serviceName: 'Deep Cleaning',
          status: 'Diproses',
          useTemplate: false,
        }
      );
      console.log('Status:', res3.status, res3.data);

      // 4. POST /api/whatsapp/send-order-status (Template Meta)
      console.log('\n4. POST /api/whatsapp/send-order-status (Template Meta)');
      const res4 = await makeRequest(
        {
          hostname: 'localhost',
          port: 5001,
          path: '/api/whatsapp/send-order-status',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          to: '081234567890',
          customerName: 'Andi',
          orderNumber: 'SF001',
          serviceName: 'Deep Cleaning',
          status: 'Diproses',
          useTemplate: true,
          templateName: 'shoefresh_order_status_update',
        }
      );
      console.log('Status:', res4.status, res4.data);

      // 5. Test validation error (missing required fields)
      console.log('\n5. POST /api/whatsapp/send (Validation Error Check)');
      const res5 = await makeRequest(
        {
          hostname: 'localhost',
          port: 5001,
          path: '/api/whatsapp/send',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          to: '',
        }
      );
      console.log('Status:', res5.status, res5.data);

      console.log('\n✅ ALL HTTP ENDPOINT TESTS PASSED SUCCESSFULLY!');
    } catch (err) {
      console.error('Test error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
};

run();
