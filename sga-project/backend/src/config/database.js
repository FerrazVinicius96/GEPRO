const { Pool } = require('pg');
const path = require('path');

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	client_encoding: 'UTF8',
});

// 1. Escuta quando uma NOVA conexão física é criada pelo Pool
pool.on('connect', (client) => {
	client
		.query('SET search_path TO gepro, sga, identity, public;')
		.then(() => {
			// Opcional: Descomente a linha abaixo para debugar conexões em dev
			// console.log('📦 Nova conexão estabelecida. search_path configurado.');
		})
		.catch((err) => {
			console.error(
				'🔥 Erro crítico ao configurar search_path:',
				err.message,
			);
		});
});

// 2. Escuta erros em clientes "ociosos" (idle clients)
// Isso é vital: previne que um problema de rede ou restart do Postgres derrube seu Node.js
pool.on('error', (err, client) => {
	console.error(
		'🔥 Erro inesperado em uma conexão ociosa do banco de dados:',
		err.message,
	);
});

module.exports = {
	// Para consultas simples e rápidas (onde a transação não importa)
	query: (text, params) => pool.query(text, params),

	// Para obter um client exclusivo (Essencial para transações BEGIN/COMMIT)
	getClient: () => pool.connect(),

	// Opcional: para desligar o banco quando a API cair
	end: () => pool.end(),
};
