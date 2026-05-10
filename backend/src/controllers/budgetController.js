const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.user.id };
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const budgets = await Budget.find(filter).populate('category', 'name type');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrUpdateBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category, month, year },
      { amount },
      { new: true, upsert: true }
    ).populate('category', 'name type');

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBudgetSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();

    const budgets = await Budget.find({ user: req.user.id, month: m, year: y }).populate('category', 'name type');

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      date: { $gte: startDate, $lt: endDate },
    });

    const summary = budgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.category === budget.category.name)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        category: budget.category,
        budgeted: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0,
      };
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudgets, createOrUpdateBudget, deleteBudget, getBudgetSummary };
