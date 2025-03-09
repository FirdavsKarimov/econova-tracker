
import { FinanceProvider } from '@/context/FinanceContext';
import Header from '@/components/Header';
import FinancialGoals from '@/components/FinancialGoals';

const GoalsPage = () => {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4">
          <h1 className="text-2xl font-bold tracking-tight mb-6 animate-fade-up">Financial Goals</h1>
          <FinancialGoals />
        </main>
      </div>
    </FinanceProvider>
  );
};

export default GoalsPage;
