const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory, seedDefaultCategories } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

router.post('/seed', seedDefaultCategories);

router.use(protect);

router.get('/', getCategories);
router.post('/', createCategory);
router.delete('/:id', deleteCategory);

module.exports = router;