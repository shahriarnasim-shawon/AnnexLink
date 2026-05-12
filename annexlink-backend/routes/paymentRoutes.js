const express = require('express');
const router = express.Router();
const { processPayment, getTransactionReceipt } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, processPayment);
router.route('/:id').get(protect, getTransactionReceipt);

module.exports = router;