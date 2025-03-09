
import { FinanceProvider } from '@/context/FinanceContext';
import Header from '@/components/Header';
import ExpenseHistory from '@/components/ExpenseHistory';
import ExpenseForm from '@/components/ExpenseForm';

const ExpensesPage = () => {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight animate-fade-up">Expense History</h1>
            <ExpenseForm />
          </div>
          <ExpenseHistory />
        </main>
      </div>
    </FinanceProvider>
  );
};

export default ExpensesPage;
