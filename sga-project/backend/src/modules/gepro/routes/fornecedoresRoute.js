const express = require('express');
const router = express.Router();
const fornecedoresController = require('../controllers/fornecedoresController');
const { authenticateToken, authorizePermission } = require('../../../shared/middlewares/authMiddleware');
const { requireSistema } = require('../../../shared/middlewares/requireSistema');

router.get('/',    authenticateToken, requireSistema,                                    fornecedoresController.listar);
router.post('/',   authenticateToken, requireSistema, authorizePermission('GEPRO_ADMIN'), fornecedoresController.criar);
router.patch('/:id', authenticateToken, requireSistema, authorizePermission('GEPRO_ADMIN'), fornecedoresController.atualizar);

module.exports = router;
