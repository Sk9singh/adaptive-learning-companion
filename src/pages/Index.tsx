import { SessionProvider } from '@/context/SessionContext';
import { QuizDashboard } from '@/components/QuizDashboard';

const Index = () => {
  return (
    <SessionProvider>
      <QuizDashboard />
    </SessionProvider>
  );
};

export default Index;
