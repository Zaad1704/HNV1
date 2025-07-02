import { Router } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

// Get cash flow data
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      income: [],
      expenses: [],
      netCashFlow: 0,
      monthlyData: []
    }
  });
}));

// Get cash flow summary
router.get('/summary', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      totalIncome: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      profitMargin: 0
    }
  });
}));

export default router;