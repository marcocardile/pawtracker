const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Proxy requests for live reload to React dev server
app.use('/sockjs-node', createProxyMiddleware({ 
  target: 'http://localhost:3001',
  ws: true
}));

// Proxy all other requests to React dev server
app.use('/', createProxyMiddleware({ 
  target: 'http://localhost:3001',
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req, res) => {
    // Log proxy requests
    console.log(`Proxying ${req.method} ${req.url} -> http://localhost:3001${req.url}`);
  }
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Capacitor proxy server running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying requests to React dev server at http://localhost:3001`);
});