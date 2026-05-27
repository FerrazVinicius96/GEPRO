const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
	authenticateToken,
	authorizeRole,
	authorizePermission,
} = require('../../../shared/middlewares/authMiddleware');

router.post('/login', authController.login);

router.post('/logout', authenticateToken, authController.logout);
router.get('/verify-token', authenticateToken, authController.verifyToken);

module.exports = router;
