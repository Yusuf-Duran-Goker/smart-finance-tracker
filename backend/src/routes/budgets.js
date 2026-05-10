const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getBudgets, createOrUpdateBudget, deleteBudget, getBudgetSummary } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', getBudgets);
router.get('/summary', getBudgetSummary);
router.post('/', validate([
  body('category').notEmpty().withMessage('Category is required'),
  body('amount').isNumeric().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2000 }).withMessage('Valid year is required'),
]), createOrUpdateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
