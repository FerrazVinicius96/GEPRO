const express = require('express');
const router = express.Router();
const contratosController = require('../controllers/contratosController');
const { authenticateToken, authorizePermission } = require('../../../shared/middlewares/authMiddleware');
const { requireSistema } = require('../../../shared/middlewares/requireSistema');

const gepro = [authenticateToken, requireSistema];
const comPermissao = [...gepro, authorizePermission('GEPRO_CONTRATOS')];

router.get('/', ...comPermissao, contratosController.listar);
router.post('/', ...comPermissao, contratosController.criar);
router.get('/:id', ...comPermissao, contratosController.obter);
router.post('/:id/metricas', ...comPermissao, contratosController.inserirMetrica);
router.get('/:id/metricas', ...comPermissao, contratosController.listarMetricas);

module.exports = router;
