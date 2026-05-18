const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoute = require('./routes/sga/authRoute');
const usersRoute = require('./routes/sga/usersRoute');
const bifurcacaoRoute = require('./routes/sga/bifurcacaoRoute');
const demandasRoute = require('./routes/gepro/demandasRoute');
const templatesRoute = require('./routes/gepro/templatesRoute');
const contratosRoute = require('./routes/gepro/contratosRoute');
const fornecedoresRoute = require('./routes/gepro/fornecedoresRoute');
const statsRoute = require('./routes/gepro/statsRoute');

const app = express();

// --- MIDDLEWARES GLOBAIS ---
app.use(express.json());
app.use(
	cors({
		origin: '*',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'ngrok-skip-browser-warning', 'X-Sistema'],
		exposedHeaders: ['Content-Disposition'],
	})
);

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- ROTAS DA APLICAÇÃO ---
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/bifurcacao', bifurcacaoRoute);

// GEPRO
app.use('/api/gepro/demandas', demandasRoute);
app.use('/api/gepro/templates', templatesRoute);
app.use('/api/gepro/contratos', contratosRoute);
app.use('/api/gepro/fornecedores', fornecedoresRoute);
app.use('/api/gepro/stats', statsRoute);

// --- ARQUIVOS ESTÁTICOS (build do React) ---
// Deve ficar após todas as rotas /api para não interceptá-las.
const buildPath = path.join(__dirname, '../../frontend/build');
app.use(express.static(buildPath));

// SPA fallback: qualquer rota não reconhecida devolve o index.html do React
app.get(/.*/, (req, res) => {
	res.sendFile(path.join(buildPath, 'index.html'));
});

module.exports = app;
