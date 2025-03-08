
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Category {
  name: string;
  color: string;
  icon: string;
}

// Categories with their colors and icons
export const categories: Category[] = [
  { name: 'Food', color: 'food', icon: 'utensils' },
  { name: 'Transport', color: 'transport', icon: 'car' },
  { name: 'Housing', color: 'housing', icon: 'home' },
  { name: 'Entertainment', color: 'entertainment', icon: 'tv' },
  { name: 'Shopping', color: 'shopping', icon: 'shopping-bag' },
  { name: 'Health', color: 'health', icon: 'heart-pulse' },
  { name: 'Education', color: 'education', icon: 'book' },
  { name: 'Utilities', color: 'utilities', icon: 'lightbulb' },
  { name: 'Travel', color: 'travel', icon: 'plane' },
  { name: 'Other', color: 'other', icon: 'more-horizontal' },
];

// Mock expenses data
export const expenses: Expense[] = [
  { id: '1', amount: 25000, category: 'Food', description: 'Lunch', date: '2023-05-10T12:00:00' },
  { id: '2', amount: 20000, category: 'Transport', description: 'Taxi ride', date: '2023-05-10T14:30:00' },
  { id: '3', amount: 150000, category: 'Housing', description: 'Rent payment', date: '2023-05-01T09:00:00' },
  { id: '4', amount: 35000, category: 'Entertainment', description: 'Movie tickets', date: '2023-05-08T19:00:00' },
  { id: '5', amount: 75000, category: 'Shopping', description: 'New shirt', date: '2023-05-07T16:45:00' },
  { id: '6', amount: 45000, category: 'Health', description: 'Pharmacy', date: '2023-05-05T10:15:00' },
  { id: '7', amount: 18000, category: 'Food', description: 'Dinner', date: '2023-05-09T20:00:00' },
  { id: '8', amount: 15000, category: 'Transport', description: 'Bus fare', date: '2023-05-06T08:30:00' },
  { id: '9', amount: 60000, category: 'Utilities', description: 'Electricity bill', date: '2023-05-04T11:20:00' },
  { id: '10', amount: 120000, category: 'Travel', description: 'Weekend trip', date: '2023-05-02T07:45:00' },
];

// Mock budget data
export const budgets: Budget[] = [
  { category: 'Food', limit: 500000, spent: 43000 },
  { category: 'Transport', limit: 300000, spent: 35000 },
  { category: 'Housing', limit: 1500000, spent: 1500000 },
  { category: 'Entertainment', limit: 200000, spent: 35000 },
  { category: 'Shopping', limit: 400000, spent: 75000 },
  { category: 'Health', limit: 300000, spent: 45000 },
  { category: 'Education', limit: 200000, spent: 0 },
  { category: 'Utilities', limit: 400000, spent: 60000 },
  { category: 'Travel', limit: 500000, spent: 120000 },
  { category: 'Other', limit: 100000, spent: 0 },
];

// Mock goals data
export const goals: Goal[] = [
  { 
    id: '1', 
    name: 'Emergency Fund', 
    targetAmount: 6000000, 
    currentAmount: 2500000, 
    deadline: '2023-12-31T23:59:59' 
  },
  { 
    id: '2', 
    name: 'New Laptop', 
    targetAmount: 8000000, 
    currentAmount: 3200000, 
    deadline: '2023-08-15T23:59:59' 
  },
  { 
    id: '3', 
    name: 'Vacation', 
    targetAmount: 10000000, 
    currentAmount: 1500000, 
    deadline: '2024-02-28T23:59:59' 
  },
];

// Monthly spending data for charts
export const monthlySpending = [
  { month: 'Jan', amount: 2800000 },
  { month: 'Feb', amount: 2500000 },
  { month: 'Mar', amount: 2700000 },
  { month: 'Apr', amount: 2600000 },
  { month: 'May', amount: 2350000 },
  { month: 'Jun', amount: 0 },
  { month: 'Jul', amount: 0 },
  { month: 'Aug', amount: 0 },
  { month: 'Sep', amount: 0 },
  { month: 'Oct', amount: 0 },
  { month: 'Nov', amount: 0 },
  { month: 'Dec', amount: 0 },
];

// Category breakdown data for charts
export const categoryBreakdown = categories.map(category => {
  const categoryExpenses = expenses.filter(expense => expense.category === category.name);
  const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  return {
    name: category.name,
    value: total,
    color: category.color,
  };
});

// Daily spending data for the last 7 days
export const dailySpending = [
  { day: 'Mon', amount: 65000 },
  { day: 'Tue', amount: 180000 },
  { day: 'Wed', amount: 45000 },
  { day: 'Thu', amount: 60000 },
  { day: 'Fri', amount: 120000 },
  { day: 'Sat', amount: 55000 },
  { day: 'Sun', amount: 68000 },
];
