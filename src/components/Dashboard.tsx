
import ExpenseForm from "./ExpenseForm";
import ExpenseHistory from "./ExpenseHistory";
import BudgetOverview from "./BudgetOverview";
import FinancialGoals from "./FinancialGoals";
import { useFinance } from "@/context/FinanceContext";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

const Dashboard = () => {
  const { loading, refreshData } = useFinance();

  const handleRefresh = () => {
    refreshData();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight animate-fade-up">Financial Overview</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            className="animate-fade-up"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <ExpenseForm />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <BudgetOverview />
        </div>
        <div className="col-span-1">
          <FinancialGoals compact />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="col-span-1">
          <ExpenseHistory limit={5} />
        </div>
        <div className="col-span-1">
          <FinancialGoals />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
