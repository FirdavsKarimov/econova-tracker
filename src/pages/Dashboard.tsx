
import { FinanceProvider } from '@/context/FinanceContext';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';

const DashboardPage = () => {
  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow">
          <Dashboard />
        </main>
      </div>
    </FinanceProvider>
  );
};

export default DashboardPage;
