
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Expense, Budget, Goal, 
  expenses as mockExpenses, 
  budgets as mockBudgets, 
  goals as mockGoals 
} from '../data/mockData';
import { toast } from "@/components/ui/use-toast";
import { getCollection, checkConnection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Check MongoDB connection on initial load
  useEffect(() => {
    const setupMongoDB = async () => {
      try {
        const connected = await checkConnection();
        setIsConnected(connected);
        
        if (connected) {
          refreshData();
        } else {
          // If not connected, use mock data
          setExpenses(mockExpenses);
          setBudgets(mockBudgets);
          setGoals(mockGoals);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during MongoDB setup:', error);
        // Use mock data if there's an error
        setExpenses(mockExpenses);
        setBudgets(mockBudgets);
        setGoals(mockGoals);
        setLoading(false);
      }
    };

    setupMongoDB();
  }, []);

  // Fetch all financial data from MongoDB
  const refreshData = async () => {
    setLoading(true);
    try {
      // Get expenses
      const expensesCollection = await getCollection('expenses');
      const expenseData = await expensesCollection.find({}).toArray();
      
      // Convert MongoDB _id to string id for frontend compatibility
      const formattedExpenses = expenseData.map(expense => ({
        id: expense._id.toString(),
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date
      }));
      
      setExpenses(formattedExpenses || []);

      // Get budgets
      const budgetsCollection = await getCollection('budgets');
      const budgetData = await budgetsCollection.find({}).toArray();
      
      const formattedBudgets = budgetData.map(budget => ({
        category: budget.category,
        limit: budget.limit,
        spent: budget.spent
      }));
      
      setBudgets(formattedBudgets.length ? formattedBudgets : mockBudgets);

      // Get goals
      const goalsCollection = await getCollection('goals');
      const goalData = await goalsCollection.find({}).toArray();
      
      const formattedGoals = goalData.map(goal => ({
        id: goal._id.toString(),
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline
      }));
      
      setGoals(formattedGoals.length ? formattedGoals : mockGoals);
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
      date: expense.date || new Date().toISOString(),
    };
    
    if (isConnected) {
      try {
        const expensesCollection = await getCollection('expenses');
        const result = await expensesCollection.insertOne(newExpense);
        
        const insertedExpense = {
          ...newExpense,
          id: result.insertedId.toString()
        };
        
        setExpenses(prev => [insertedExpense, ...prev]);
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
      const mockId = Date.now().toString();
      setExpenses(prev => [{...newExpense, id: mockId}, ...prev]);
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
    if (isConnected) {
      try {
        const budgetsCollection = await getCollection('budgets');
        
        const updatedBudget = { 
          category, 
          limit,
          spent: spent !== undefined ? spent : budgets.find(b => b.category === category)?.spent || 0,
        };
        
        // Check if budget exists
        const existingBudget = await budgetsCollection.findOne({ category });
        
        if (existingBudget) {
          // Update existing budget
          await budgetsCollection.updateOne(
            { category }, 
            { $set: updatedBudget }
          );
        } else {
          // Insert new budget
          await budgetsCollection.insertOne(updatedBudget);
        }
        
        // Update state
        setBudgets(prev => 
          prev.map(budget => 
            budget.category === category 
              ? { ...budget, limit, ...(spent !== undefined && { spent }) } 
              : budget
          )
        );
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
    if (isConnected) {
      try {
        const goalsCollection = await getCollection('goals');
        const result = await goalsCollection.insertOne(goal);
        
        const insertedGoal = {
          ...goal,
          id: result.insertedId.toString()
        };
        
        setGoals(prev => [...prev, insertedGoal]);
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
      const mockId = Date.now().toString();
      setGoals(prev => [...prev, {...goal, id: mockId}]);
    }
    
    toast({
      title: "Goal Added",
      description: `New goal "${goal.name}" has been created`,
    });
  };

  // Update a goal's progress
  const updateGoal = async (id: string, amount: number) => {
    if (isConnected) {
      try {
        const goalToUpdate = goals.find(g => g.id === id);
        if (!goalToUpdate) return;
        
        const newAmount = goalToUpdate.currentAmount + amount;
        const isCompleted = newAmount >= goalToUpdate.targetAmount;
        
        const goalsCollection = await getCollection('goals');
        await goalsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { currentAmount: Math.min(newAmount, goalToUpdate.targetAmount) } }
        );
        
        // Update state
        setGoals(prev => 
          prev.map(goal => {
            if (goal.id === id) {
              return { 
                ...goal, 
                currentAmount: Math.min(newAmount, goalToUpdate.targetAmount) 
              };
            }
            return goal;
          })
        );
        
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
    
    if (isConnected) {
      try {
        const expensesCollection = await getCollection('expenses');
        await expensesCollection.deleteOne({ _id: new ObjectId(id) });
        
        // Update state
        setExpenses(prev => prev.filter(expense => expense.id !== id));
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
    
    if (isConnected) {
      try {
        const goalsCollection = await getCollection('goals');
        await goalsCollection.deleteOne({ _id: new ObjectId(id) });
        
        // Update state
        setGoals(prev => prev.filter(goal => goal.id !== id));
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
