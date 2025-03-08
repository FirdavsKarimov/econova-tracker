
import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/utils/financeUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { 
  History, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Calendar, 
  Filter
} from 'lucide-react';
import { categories } from '@/data/mockData';
import { toast } from "@/components/ui/use-toast";

interface ExpenseHistoryProps {
  limit?: number;
}

const ExpenseHistory = ({ limit }: ExpenseHistoryProps) => {
  const { expenses, deleteExpense } = useFinance();
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Limit number of expenses shown if limit is provided
  const displayExpenses = limit ? sortedExpenses.slice(0, limit) : sortedExpenses;
  
  const handleDelete = (id: string) => {
    deleteExpense(id);
    setSelectedExpense(null);
  };
  
  const handleViewDetails = (id: string) => {
    setSelectedExpense(id);
    setShowDialog(true);
  };
  
  // Get expense details from ID
  const getExpenseDetails = (id: string) => {
    return expenses.find(expense => expense.id === id);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Get category color
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || 'other';
  };
  
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Recent Expenses</CardTitle>
          <div className="flex items-center gap-2">
            {!limit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All Categories</DropdownMenuItem>
                  <DropdownMenuItem>Food Only</DropdownMenuItem>
                  <DropdownMenuItem>Transport Only</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>This Week</DropdownMenuItem>
                  <DropdownMenuItem>This Month</DropdownMenuItem>
                  <DropdownMenuItem>Custom Range...</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <CardDescription>
          {limit 
            ? "Your most recent expenses" 
            : "Track and manage all your expenses"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayExpenses.length > 0 ? (
            displayExpenses.map((expense) => {
              const categoryColor = getCategoryColor(expense.category);
              
              return (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full bg-${categoryColor}/20 flex items-center justify-center`}>
                      <span className={`text-${categoryColor} text-xs font-medium`}>
                        {expense.category.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <div className="flex items-center gap-2">
                        <span className={`expense-category-badge bg-${categoryColor}/20 text-${categoryColor}`}>
                          {expense.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(expense.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(expense.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-alert" 
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No expenses recorded yet
            </p>
          )}
          
          {limit && expenses.length > limit && (
            <Button variant="outline" className="w-full mt-4">
              View All Expenses
            </Button>
          )}
          
          {/* Expense details dialog */}
          {selectedExpense && (
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent className="sm:max-w-[425px] glass-card">
                <DialogHeader>
                  <DialogTitle>Expense Details</DialogTitle>
                </DialogHeader>
                {(() => {
                  const expense = getExpenseDetails(selectedExpense);
                  if (!expense) return null;
                  
                  const categoryColor = getCategoryColor(expense.category);
                  
                  return (
                    <div className="space-y-4 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`h-16 w-16 rounded-full bg-${categoryColor}/20 flex items-center justify-center`}>
                          <span className={`text-${categoryColor} text-lg font-medium`}>
                            {expense.category.substring(0, 2)}
                          </span>
                        </div>
                        <span className={`expense-category-badge bg-${categoryColor}/20 text-${categoryColor}`}>
                          {expense.category}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <h3 className="text-2xl font-bold">
                          {formatCurrency(expense.amount)}
                        </h3>
                        <p className="text-muted-foreground">{expense.description}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2 bg-secondary/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(expense.date)} at {formatTime(expense.date)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4">
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            handleDelete(expense.id);
                            setShowDialog(false);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                        <DialogClose asChild>
                          <Button variant="outline">Close</Button>
                        </DialogClose>
                      </div>
                    </div>
                  );
                })()}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseHistory;
