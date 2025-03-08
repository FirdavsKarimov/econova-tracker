
import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { 
  formatCurrency, 
  calculateBudgetPercentage, 
  isBudgetExceeded,
  getBudgetColorClass
} from '@/utils/financeUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Pencil, 
  DollarSign, 
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { categories } from '@/data/mockData';
import { toast } from "@/components/ui/use-toast";

interface BudgetOverviewProps {
  detailed?: boolean;
}

const BudgetOverview = ({ detailed = false }: BudgetOverviewProps) => {
  const { budgets, updateBudget } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(0);
  
  const handleEditBudget = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setNewLimit(currentLimit);
  };
  
  const handleSaveBudget = () => {
    if (editingCategory && newLimit >= 0) {
      updateBudget(editingCategory, newLimit);
      toast({
        title: "Budget Updated",
        description: `Your ${editingCategory} budget is now ${formatCurrency(newLimit)}`,
      });
      setEditingCategory(null);
    }
  };
  
  // Filter and sort budgets
  const sortedBudgets = [...budgets].sort((a, b) => {
    // First show exceeded budgets
    const aExceeded = isBudgetExceeded(a.spent, a.limit);
    const bExceeded = isBudgetExceeded(b.spent, b.limit);
    
    if (aExceeded && !bExceeded) return -1;
    if (!aExceeded && bExceeded) return 1;
    
    // Then sort by percentage used
    const aPercentage = calculateBudgetPercentage(a.spent, a.limit);
    const bPercentage = calculateBudgetPercentage(b.spent, b.limit);
    
    return bPercentage - aPercentage;
  });
  
  // If not detailed, only show top 5 budgets
  const displayBudgets = detailed ? sortedBudgets : sortedBudgets.slice(0, 5);
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Budget Overview</CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>
          {detailed 
            ? "Manage and track all your budget categories" 
            : "Your top budget categories"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayBudgets.map((budget) => {
            const percentage = calculateBudgetPercentage(budget.spent, budget.limit);
            const isExceeded = isBudgetExceeded(budget.spent, budget.limit);
            const isWarning = percentage >= 90 && !isExceeded;
            const colorClass = getBudgetColorClass(percentage);
            
            // Find category icon
            const categoryData = categories.find(cat => cat.name === budget.category);
            
            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{budget.category}</span>
                    {isExceeded && (
                      <div className="text-xs px-2 py-0.5 bg-alert/20 text-alert rounded-full flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Exceeded</span>
                      </div>
                    )}
                    {isWarning && (
                      <div className="text-xs px-2 py-0.5 bg-warning/20 text-warning rounded-full flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        <span>Almost exceeded</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</span>
                    {detailed && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleEditBudget(budget.category, budget.limit)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] glass-card">
                          <DialogHeader>
                            <DialogTitle>Edit {budget.category} Budget</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="limit">Monthly Budget Limit (UZS)</Label>
                              <Input
                                id="limit"
                                type="number"
                                value={newLimit}
                                onChange={(e) => setNewLimit(Number(e.target.value))}
                              />
                            </div>
                            <div className="text-sm">
                              <p>Current spending: {formatCurrency(budget.spent)}</p>
                              {newLimit < budget.spent && (
                                <p className="text-alert mt-2">
                                  Warning: New limit is less than current spending
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button onClick={handleSaveBudget}>Save</Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className={`progress-bar ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(budget.spent)}</span>
                  <span>{percentage}%</span>
                  <span>{formatCurrency(budget.limit)}</span>
                </div>
              </div>
            );
          })}
          
          {!detailed && budgets.length > 5 && (
            <Button variant="outline" className="w-full mt-4">
              View All Budgets
            </Button>
          )}
          
          {detailed && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  Add New Budget Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] glass-card">
                <DialogHeader>
                  <DialogTitle>Add New Budget Category</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-muted-foreground text-center">
                    Coming soon in the next version
                  </p>
                </div>
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
