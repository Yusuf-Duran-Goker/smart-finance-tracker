const Category = require('../models/Category');

const DEFAULT_CATEGORIES = [
  { name: 'Food', type: 'expense', isDefault: true },
  { name: 'Transport', type: 'expense', isDefault: true },
  { name: 'Housing', type: 'expense', isDefault: true },
  { name: 'Health', type: 'expense', isDefault: true },
  { name: 'Entertainment', type: 'expense', isDefault: true },
  { name: 'Shopping', type: 'expense', isDefault: true },
  { name: 'Salary', type: 'income', isDefault: true },
  { name: 'Other', type: 'both', isDefault: true },
];

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ isDefault: true }, { user: req.user.id }],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const category = await Category.create({ name, type, user: req.user.id });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const seedDefaultCategories = async (req, res) => {
  try {
    const existing = await Category.findOne({ isDefault: true });
    if (existing) {
      return res.status(400).json({ message: 'Default categories already exist' });
    }
    await Category.insertMany(DEFAULT_CATEGORIES);
    res.status(201).json({ message: 'Default categories created' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, createCategory, deleteCategory, seedDefaultCategories };