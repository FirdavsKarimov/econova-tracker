
import { Expense, Budget, Goal } from "../data/mockData";

// Format currency to UZS with thousand separators
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('uz-UZ', { style: 'currency', currency: 'UZS' })
    .replace('UZS', '')
    .trim() + ' UZS';
};

// Calculate total expenses
export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

// Calculate expenses by category
export const calculateExpensesByCategory = (expenses: Expense[]): Record<string, number> => {
  return expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
};

// Calculate percentage of budget spent for a specific category
export const calculateBudgetPercentage = (spent: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min(Math.round((spent / limit) * 100), 100);
};

// Check if a category has exceeded its budget
export const isBudgetExceeded = (spent: number, limit: number): boolean => {
  return spent > limit;
};

// Calculate total budget limit
export const calculateTotalBudget = (budgets: Budget[]): number => {
  return budgets.reduce((total, budget) => total + budget.limit, 0);
};

// Calculate total spent across all categories
export const calculateTotalSpent = (budgets: Budget[]): number => {
  return budgets.reduce((total, budget) => total + budget.spent, 0);
};

// Calculate progress towards a goal
export const calculateGoalProgress = (currentAmount: number, targetAmount: number): number => {
  if (targetAmount === 0) return 0;
  return Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
};

// Calculate days remaining until a deadline
export const calculateDaysRemaining = (deadline: string): number => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const differenceInTime = deadlineDate.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
  return Math.max(0, differenceInDays);
};

// Filter expenses by date range
export const filterExpensesByDateRange = (
  expenses: Expense[],
  startDate: Date,
  endDate: Date
): Expense[] => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

// Get daily expenses for the last n days
export const getDailyExpensesForLastNDays = (
  expenses: Expense[],
  days: number
): { date: string; total: number }[] => {
  const result: { date: string; total: number }[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const dailyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= date && expenseDate < nextDate;
    });
    
    const total = dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    result.push({ date: formattedDate, total });
  }
  
  return result;
};

// Get monthly expenses for the current year
export const getMonthlyExpensesForCurrentYear = (
  expenses: Expense[]
): { month: string; total: number }[] => {
  const result: { month: string; total: number }[] = [];
  const currentYear = new Date().getFullYear();
  
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(currentYear, month, 1);
    const endDate = new Date(currentYear, month + 1, 0);
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    const total = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthName = startDate.toLocaleDateString('en-US', { month: 'short' });
    
    result.push({ month: monthName, total });
  }
  
  return result;
};

// Format percentage for display
export const formatPercentage = (percentage: number): string => {
  return `${percentage}%`;
};

// Calculate remaining budget for a category
export const calculateRemainingBudget = (spent: number, limit: number): number => {
  return Math.max(0, limit - spent);
};

// Get color class based on budget percentage
export const getBudgetColorClass = (percentage: number): string => {
  if (percentage < 70) return 'bg-success';
  if (percentage < 90) return 'bg-warning';
  return 'bg-alert';
};
