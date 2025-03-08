
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Expense, Budget, Goal, 
  expenses as mockExpenses, 
  budgets as mockBudgets, 
  goals as mockGoals 
} from '../data/mockData';
import { toast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';

interface FinanceContextType {
  expenses: Expense[];
  budgets: Budget[];
  goals: Goal[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateBudget: (category: string, limit: number, spent?: number) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, amount: number) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);

  // Get current user and subscribe to auth changes
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load data from Supabase when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // If no user, use mock data (for development purposes)
      setExpenses(mockExpenses);
      setBudgets(mockBudgets);
      setGoals(mockGoals);
      setLoading(false);
    }
  }, [user]);

  // Fetch all financial data from Supabase
  const refreshData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (expenseError) {
        console.error('Error fetching expenses:', expenseError);
        // If table doesn't exist yet, use mock data
        setExpenses(mockExpenses);
      } else {
        setExpenses(expenseData || []);
      }

      // Get budgets
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*');
      
      if (budgetError) {
        console.error('Error fetching budgets:', budgetError);
        // If table doesn't exist yet, use mock data
        setBudgets(mockBudgets);
      } else {
        setBudgets(budgetData || []);
      }

      // Get goals
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('*');
      
      if (goalError) {
        console.error('Error fetching goals:', goalError);
        // If table doesn't exist yet, use mock data
        setGoals(mockGoals);
      } else {
        setGoals(goalData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use mock data if there's an error
      setExpenses(mockExpenses);
      setBudgets(mockBudgets);
      setGoals(mockGoals);
    } finally {
      setLoading(false);
    }
  };

  // Add a new expense
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      user_id: user?.id || 'anonymous',
    };
    
    if (user) {
      try {
        const { error } = await supabase
          .from('expenses')
          .insert(newExpense);
        
        if (error) throw error;
        
        await refreshData();
      } catch (error) {
        console.error('Error adding expense:', error);
        toast({
          title: "Error",
          description: "Failed to save expense. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Offline mode using state
      setExpenses(prev => [newExpense, ...prev]);
    }
    
    // Update the budget for the category
    const categoryBudget = budgets.find(b => b.category === expense.category);
    if (categoryBudget) {
      const newSpent = categoryBudget.spent + expense.amount;
      await updateBudget(expense.category, categoryBudget.limit, newSpent);
      
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
    
    toast({
      title: "Expense Added",
      description: `${expense.amount} UZS for ${expense.category} has been added`,
    });
  };

  // Update a budget
  const updateBudget = async (category: string, limit: number, spent?: number) => {
    if (user) {
      try {
        const updatedBudget = { 
          category, 
          limit,
          spent: spent !== undefined ? spent : budgets.find(b => b.category === category)?.spent || 0,
          user_id: user.id,
        };
        
        // Check if budget exists
        const { data, error: fetchError } = await supabase
          .from('budgets')
          .select('*')
          .eq('category', category)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }
        
        if (data) {
          // Update existing budget
          const { error } = await supabase
            .from('budgets')
            .update(updatedBudget)
            .eq('category', category)
            .eq('user_id', user.id);
          
          if (error) throw error;
        } else {
          // Insert new budget
          const { error } = await supabase
            .from('budgets')
            .insert(updatedBudget);
          
          if (error) throw error;
        }
        
        await refreshData();
      } catch (error) {
        console.error('Error updating budget:', error);
        toast({
          title: "Error",
          description: "Failed to update budget. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Offline mode using state
      setBudgets(prev => 
        prev.map(budget => 
          budget.category === category 
            ? { ...budget, limit, ...(spent !== undefined && { spent }) } 
            : budget
        )
      );
    }
  };

  // Add a new goal
  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      user_id: user?.id || 'anonymous',
    };
    
    if (user) {
      try {
        const { error } = await supabase
          .from('goals')
          .insert(newGoal);
        
        if (error) throw error;
        
        await refreshData();
      } catch (error) {
        console.error('Error adding goal:', error);
        toast({
          title: "Error",
          description: "Failed to save goal. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Offline mode using state
      setGoals(prev => [...prev, newGoal]);
    }
    
    toast({
      title: "Goal Added",
      description: `New goal "${goal.name}" has been created`,
    });
  };

  // Update a goal's progress
  const updateGoal = async (id: string, amount: number) => {
    if (user) {
      try {
        const goalToUpdate = goals.find(g => g.id === id);
        if (!goalToUpdate) return;
        
        const newAmount = goalToUpdate.currentAmount + amount;
        const isCompleted = newAmount >= goalToUpdate.targetAmount;
        
        const { error } = await supabase
          .from('goals')
          .update({ 
            currentAmount: Math.min(newAmount, goalToUpdate.targetAmount) 
          })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        await refreshData();
        
        if (isCompleted) {
          toast({
            title: "Goal Achieved!",
            description: `Congratulations! You've reached your "${goalToUpdate.name}" goal`,
          });
        }
      } catch (error) {
        console.error('Error updating goal:', error);
        toast({
          title: "Error",
          description: "Failed to update goal. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Offline mode using state
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
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    if (!expenseToDelete) return;
    
    if (user) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        await refreshData();
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: "Error",
          description: "Failed to delete expense. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Offline mode using state
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    }
    
    // Update the budget for the category
    const categoryBudget = budgets.find(b => b.category === expenseToDelete.category);
    if (categoryBudget) {
      const newSpent = Math.max(0, categoryBudget.spent - expenseToDelete.amount);
      await updateBudget(expenseToDelete.category, categoryBudget.limit, newSpent);
    }
    
    toast({
      title: "Expense Deleted",
      description: "The expense has been removed",
    });
  };

  // Delete a goal
  const deleteGoal = async (id: string) => {
    const goalToDelete = goals.find(g => g.id === id);
    if (!goalToDelete) return;
    
    if (user) {
      try {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        await refreshData();
      } catch (error) {
        console.error('Error deleting goal:', error);
        toast({
          title: "Error",
          description: "Failed to delete goal. Please try again.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Offline mode using state
      setGoals(prev => prev.filter(goal => goal.id !== id));
    }
    
    toast({
      title: "Goal Deleted",
      description: `The goal "${goalToDelete.name}" has been removed`,
    });
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
        deleteGoal,
        loading,
        refreshData
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
