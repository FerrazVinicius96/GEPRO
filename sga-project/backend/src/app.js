const express = require('express');
const cors = require('cors');
const errorHandler = require('./shared/middlewares/errorHandler');

// --- ROTAS DOS MÓDULOS (DOMÍNIOS) ---
// Módulo de Identidade e Controle de Acessos (identity)
const authRoute = require('./modules/identity/routes/authRoute');
const usersRoute = require('./modules/identity/routes/usersRoute');
const bifurcacaoRoute = require('./modules/identity/routes/bifurcacaoRoute');

// Módulo de Compras e Licitação (gepro)
const demandasRoute = require('./modules/gepro/routes/demandasRoute');
const templatesRoute = require('./modules/gepro/routes/templatesRoute');
const contratosRoute = require('./modules/gepro/routes/contratosRoute');
const fornecedoresRoute = require('./modules/gepro/routes/fornecedoresRoute');
const statsRoute = require('./modules/gepro/routes/statsRoute');

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

// Domínio: identity
app.use('/api/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/bifurcacao', bifurcacaoRoute);

// Domínio: gepro
app.use('/api/gepro/demandas', demandasRoute);
app.use('/api/gepro/templates', templatesRoute);
app.use('/api/gepro/contratos', contratosRoute);
app.use('/api/gepro/fornecedores', fornecedoresRoute);
app.use('/api/gepro/stats', statsRoute);

// --- TRATAMENTO DE ERROS CENTRALIZADO (Express Global) ---
app.use(errorHandler);

module.exports = app;
