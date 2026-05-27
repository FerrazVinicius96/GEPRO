const { logAudit } = require('../utils/logger');

module.exports = async (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.statusCode ? err.message : 'Ocorreu um erro interno no servidor.';

	if (!err.statusCode) {
		console.error('🔥 [Erro Interno]:', err);
		// Tenta registrar o log de auditoria do erro se o usuário estiver autenticado
		try {
			if (req.user && req.user.id) {
				await logAudit(
					req.user.id,
					'internal_error',
					'system',
					null,
					{ error: err.message, path: req.path },
					req.ip
				);
			}
		} catch (logErr) {
			console.error('Erro ao salvar log de auditoria do erro:', logErr);
		}
	}

	return res.status(statusCode).json({
		message,
		status: 'error',
		timestamp: new Date().toISOString(),
	});
};
