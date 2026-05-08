const express = require('express');
const router = express.Router();
const { getPlatformStats, getAllUsers, toggleBanUser, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes must pass BOTH the protect (logged in) and admin (role === 'admin') checks
router.route('/stats').get(protect, admin, getPlatformStats);
router.route('/users').get(protect, admin, getAllUsers);
router.route('/users/:id/ban').put(protect, admin, toggleBanUser);
router.route('/users/:id').delete(protect, admin, deleteUser);

module.exports = router;