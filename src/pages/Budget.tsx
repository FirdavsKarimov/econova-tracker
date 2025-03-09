
import { FinanceProvider } from '@/context/FinanceContext';
import Header from '@/components/Header';
import BudgetOverview from '@/components/BudgetOverview';

const BudgetPage = () => {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4">
          <h1 className="text-2xl font-bold tracking-tight mb-6 animate-fade-up">Budget Management</h1>
          <BudgetOverview detailed />
        </main>
      </div>
    </FinanceProvider>
  );
};

export default BudgetPage;
