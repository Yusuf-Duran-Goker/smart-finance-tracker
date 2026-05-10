const express = require('express');
const router = express.Router();
const { getBudgets, createOrUpdateBudget, deleteBudget, getBudgetSummary } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBudgets);
router.get('/summary', getBudgetSummary);
router.post('/', createOrUpdateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
