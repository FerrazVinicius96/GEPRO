const express = require('express');
const router = express.Router();
const bifurcacaoController = require('../controllers/bifurcacaoController');
const { authenticateToken } = require('../../../shared/middlewares/authMiddleware');

router.get('/', authenticateToken, bifurcacaoController.getSistemas);

module.exports = router;
