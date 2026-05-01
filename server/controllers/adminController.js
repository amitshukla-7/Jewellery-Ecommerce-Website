import Investment from '../models/Investment.js';

// @desc    Get all investments
// @route   GET /api/admin/investments
// @access  Private/Admin
export const getInvestments = async (req, res) => {
  const investments = await Investment.find({});
  res.json(investments);
};

// @desc    Create an investment
// @route   POST /api/admin/investments
// @access  Private/Admin
export const createInvestment = async (req, res) => {
  const { name, amount, date } = req.body;

  const investment = new Investment({
    name,
    amount,
    date,
  });

  const createdInvestment = await investment.save();
  res.status(201).json(createdInvestment);
};

// @desc    Update an investment
// @route   PUT /api/admin/investments/:id
// @access  Private/Admin
export const updateInvestment = async (req, res) => {
  const { name, amount, date } = req.body;

  const investment = await Investment.findById(req.params.id);

  if (investment) {
    investment.name = name || investment.name;
    investment.amount = amount || investment.amount;
    investment.date = date || investment.date;

    const updatedInvestment = await investment.save();
    res.json(updatedInvestment);
  } else {
    res.status(404).json({ message: 'Investment not found' });
  }
};

// @desc    Delete an investment
// @route   DELETE /api/admin/investments/:id
// @access  Private/Admin
export const deleteInvestment = async (req, res) => {
  const investment = await Investment.findById(req.params.id);

  if (investment) {
    await investment.deleteOne();
    res.json({ message: 'Investment removed' });
  } else {
    res.status(404).json({ message: 'Investment not found' });
  }
};
