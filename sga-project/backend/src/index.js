// Inicializa e valida as variáveis de ambiente do .env como primeiro passo do boot
require('./config/env');

const startServer = require('./server');
const pool = require('./config/database');

const bootstrap = async () => {
	try {
		const result = await pool.query('SELECT NOW();');
		console.log('📦 Banco de dados conectado com sucesso.');
		console.log('⏰ Hora atual no banco: ', result.rows[0].now);

		// Inicia o servidor HTTP
		startServer();
	} catch (error) {
		console.error('🔥 Erro fatal ao iniciar a aplicação:', error);
		process.exit(1);
	}
};

bootstrap();
