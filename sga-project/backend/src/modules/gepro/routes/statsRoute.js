const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../../../shared/middlewares/authMiddleware');
const { requireSistema } = require('../../../shared/middlewares/requireSistema');

router.get('/', authenticateToken, requireSistema, statsController.obter);

module.exports = router;
