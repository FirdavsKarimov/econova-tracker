
import React, { createContext, useContext, useState } from 'react';
import { Expense, Budget, Goal, expenses as mockExpenses, budgets as mockBudgets, goals as mockGoals } from '../data/mockData';
import { toast } from "@/components/ui/use-toast";

interface FinanceContextType {
  expenses: Expense[];
  budgets: Budget[];
  goals: Goal[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateBudget: (category: string, limit: number) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, amount: number) => void;
  deleteExpense: (id: string) => void;
  deleteGoal: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  // Add a new expense
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    };
    
    setExpenses(prev => [newExpense, ...prev]);
    
    // Update the budget for the category
    const categoryBudget = budgets.find(b => b.category === expense.category);
    if (categoryBudget) {
      const newSpent = categoryBudget.spent + expense.amount;
      updateBudget(expense.category, categoryBudget.limit, newSpent);
      
      // Check if budget is exceeded
      if (newSpent > categoryBudget.limit) {
        toast({
          title: "Budget Alert",
          description: `You've exceeded your ${expense.category} budget`,
          variant: "destructive",
        });
      } else if (newSpent > categoryBudget.limit * 0.9) {
        toast({
          title: "Budget Warning",
          description: `You're close to your ${expense.category} budget limit`,
          variant: "default",
        });
      }
    }
  };

  // Update a budget
  const updateBudget = (category: string, limit: number, spent?: number) => {
    setBudgets(prev => 
      prev.map(budget => 
        budget.category === category 
          ? { ...budget, limit, ...(spent !== undefined && { spent }) } 
          : budget
      )
    );
  };

  // Add a new goal
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    
    setGoals(prev => [...prev, newGoal]);
    toast({
      title: "Goal Added",
      description: `New goal "${goal.name}" has been created`,
    });
  };

  // Update a goal's progress
  const updateGoal = (id: string, amount: number) => {
    setGoals(prev => 
      prev.map(goal => {
        if (goal.id === id) {
          const newAmount = goal.currentAmount + amount;
          const isCompleted = newAmount >= goal.targetAmount;
          
          if (isCompleted) {
            toast({
              title: "Goal Achieved!",
              description: `Congratulations! You've reached your "${goal.name}" goal`,
            });
          }
          
          return { 
            ...goal, 
            currentAmount: Math.min(newAmount, goal.targetAmount) 
          };
        }
        return goal;
      })
    );
  };

  // Delete an expense
  const deleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    if (expenseToDelete) {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      // Update the budget for the category
      const categoryBudget = budgets.find(b => b.category === expenseToDelete.category);
      if (categoryBudget) {
        const newSpent = Math.max(0, categoryBudget.spent - expenseToDelete.amount);
        updateBudget(expenseToDelete.category, categoryBudget.limit, newSpent);
      }
      
      toast({
        title: "Expense Deleted",
        description: "The expense has been removed",
      });
    }
  };

  // Delete a goal
  const deleteGoal = (id: string) => {
    const goalToDelete = goals.find(g => g.id === id);
    if (goalToDelete) {
      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast({
        title: "Goal Deleted",
        description: `The goal "${goalToDelete.name}" has been removed`,
      });
    }
  };

  return (
    <FinanceContext.Provider 
      value={{ 
        expenses, 
        budgets, 
        goals, 
        addExpense, 
        updateBudget, 
        addGoal, 
        updateGoal, 
        deleteExpense, 
        deleteGoal 
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
