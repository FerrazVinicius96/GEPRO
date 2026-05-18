const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = 3001;
const HOST = '0.0.0.0';

const buildPath = path.join(__dirname, 'build');
console.log('Servindo arquivos da pasta:', buildPath);

// Proxy /api para o backend (porta 5001)
// Contexto passado diretamente ao createProxyMiddleware (API v2) para preservar o prefixo /api
app.use(createProxyMiddleware('/api', {
  target: 'http://localhost:5001',
  changeOrigin: true,
}));

// Serve os arquivos estáticos do React
app.use(express.static(buildPath));

// SPA fallback
app.get(/.*/, function (req, res) {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Frontend rodando em http://${HOST}:${PORT}`);
});
