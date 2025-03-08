
import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, calculateTotalExpenses, calculateTotalBudget, calculateTotalSpent } from '@/utils/financeUtils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseForm from './ExpenseForm';
import BudgetOverview from './BudgetOverview';
import CategoryBreakdown from './CategoryBreakdown';
import ExpenseHistory from './ExpenseHistory';
import FinancialGoals from './FinancialGoals';
import { 
  BarChart, 
  PiggyBank, 
  Wallet, 
  ArrowDownCircle,
  Target,
  Calendar,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';
import { monthlySpending, dailySpending } from '@/data/mockData';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { expenses, budgets } = useFinance();
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  
  const totalExpenses = calculateTotalExpenses(expenses);
  const totalBudget = calculateTotalBudget(budgets);
  const totalSpent = calculateTotalSpent(budgets);
  const savingsRate = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;

  const summaryCards = [
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      desc: "Current month",
      icon: <Wallet className="h-5 w-5 text-primary" />,
      change: "-5.2%",
      positive: false
    },
    {
      title: "Budget Remaining",
      value: formatCurrency(totalBudget - totalSpent),
      desc: "Out of " + formatCurrency(totalBudget),
      icon: <BarChart className="h-5 w-5 text-primary" />,
      change: "",
      positive: true
    },
    {
      title: "Savings Rate",
      value: `${savingsRate}%`,
      desc: "Of total budget",
      icon: <PiggyBank className="h-5 w-5 text-primary" />,
      change: "+2.4%",
      positive: true
    },
    {
      title: "Largest Expense",
      value: formatCurrency(150000),
      desc: "Housing category",
      icon: <ArrowDownCircle className="h-5 w-5 text-primary" />,
      change: "",
      positive: true
    }
  ];

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-8">
      {/* Welcome and quick add */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="animate-fade-up">
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground">Your financial summary at a glance</p>
        </div>
        <ExpenseForm />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="glass-card card-hover animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">{card.title}</CardTitle>
                {card.icon}
              </div>
              <CardDescription>{card.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-semibold">{card.value}</div>
                {card.change && (
                  <div className={`text-xs px-2 py-1 rounded-full ${card.positive ? 'bg-success/20 text-success' : 'bg-alert/20 text-alert'}`}>
                    {card.change}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-up" style={{ animationDelay: '400ms' }}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="reports" className="hidden lg:inline-flex">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly spending trends */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Monthly Spending</CardTitle>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Your spending over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monthlySpending.slice(0, 6)}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), "Amount"]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Daily spending */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Daily Spending</CardTitle>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Your spending for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={dailySpending}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), "Amount"]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Category breakdown and budget overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryBreakdown />
            <BudgetOverview />
          </div>
          
          {/* Recent expenses and goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseHistory limit={5} />
            <FinancialGoals compact={true} />
          </div>
        </TabsContent>
        
        <TabsContent value="expenses">
          <ExpenseHistory />
        </TabsContent>
        
        <TabsContent value="budgets">
          <BudgetOverview detailed={true} />
        </TabsContent>
        
        <TabsContent value="goals">
          <FinancialGoals />
        </TabsContent>
        
        <TabsContent value="reports">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Financial Reports</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Detailed financial analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Placeholder for detailed reports */}
                <div className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed rounded-lg">
                  <Target className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-center">
                    Detailed financial reports coming soon
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-6 border border-dashed rounded-lg">
                  <BarChart className="h-10 w-10 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-center">
                    Custom analytics reports coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
