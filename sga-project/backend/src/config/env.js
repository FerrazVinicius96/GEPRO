const path = require('path');
// Garante o carregamento do .env na pasta raiz do backend
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];

const missing = [];
for (const key of requiredEnv) {
	if (!process.env[key]) {
		missing.push(key);
	}
}

if (missing.length > 0) {
	console.error('🔥 Erro crítico: Variáveis de ambiente ausentes no .env:', missing.join(', '));
	process.exit(1);
}

module.exports = {
	DATABASE_URL: process.env.DATABASE_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	PORT: process.env.PORT || 5000,
	NODE_ENV: process.env.NODE_ENV || 'development',
};
