
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, calculateTotalExpenses } from '@/utils/financeUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { categories } from '@/data/mockData';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = {
  'Food': '#4CAF50',
  'Transport': '#2196F3',
  'Housing': '#9C27B0',
  'Entertainment': '#FF9800',
  'Shopping': '#F44336',
  'Health': '#00BCD4',
  'Education': '#3F51B5',
  'Utilities': '#795548',
  'Travel': '#009688',
  'Other': '#607D8B',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/90 border border-border p-3 rounded-lg shadow-lg backdrop-blur-sm">
        <p className="font-medium">{data.name}</p>
        <p className="text-primary">{formatCurrency(data.value)}</p>
        <p className="text-sm text-muted-foreground">{data.percentage}% of total</p>
      </div>
    );
  }

  return null;
};

const CategoryBreakdown = () => {
  const { expenses } = useFinance();
  
  // Calculate expenses by category
  const totalExpenses = calculateTotalExpenses(expenses);
  
  const expensesByCategory = categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category.name);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0;
    
    return {
      name: category.name,
      value: total,
      percentage,
      color: COLORS[category.name as keyof typeof COLORS] || '#607D8B',
    };
  }).filter(category => category.value > 0)
    .sort((a, b) => b.value - a.value);
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Spending by Category</CardTitle>
          <PieChartIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>How your money is distributed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  labelLine={false}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No expense data available</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Top Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {expensesByCategory.slice(0, 4).map((category, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded-md" 
                style={{ backgroundColor: `${category.color}20` }}
              >
                <span className="text-sm">{category.name}</span>
                <span className="text-xs font-medium">{category.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdown;
