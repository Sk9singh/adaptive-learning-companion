import { useSession } from '@/context/SessionContext';
import { SessionForm } from './SessionForm';
import { QuestionDisplay } from './QuestionDisplay';
import { ResponseSimulator } from './ResponseSimulator';
import { MetricsDashboard } from './MetricsDashboard';
import { StatusMonitor } from './StatusMonitor';
import { ExplanationModal } from './ExplanationModal';
import { InterventionScreen } from './InterventionScreen';
import { FlowController } from './FlowController';
import { AnalyticsReport } from './AnalyticsReport';
import { LoadingAnimation } from './LoadingAnimation';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';

export function QuizDashboard() {
  const { state } = useSession();
  const { sessionId, status, analytics } = state;

  // Show analytics if session is complete
  if (analytics) {
    return <AnalyticsReport />;
  }

  // Show session form if no active session
  if (!sessionId) {
    return <SessionForm />;
  }

  // Main quiz interface
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Agent Quiz Flow</span>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {sessionId.substring(0, 8)}...
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* Metrics Dashboard */}
            <MetricsDashboard />
            
            {/* Question Display */}
            <QuestionDisplay />
            
            {/* Response Simulator */}
            <ResponseSimulator />
          </div>

          {/* Right Column - Status Monitor */}
          <div className="space-y-6">
            <StatusMonitor />
            
            {/* Subtopic Progress */}
            {state.subtopicOutcomes.length > 0 && (
              <div className="p-4 bg-card rounded-xl border shadow-card space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Subtopic Progress</h3>
                <div className="space-y-2">
                  {state.subtopicOutcomes.map((outcome, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate flex-1 mr-2">{outcome.subtopic}</span>
                      <Badge 
                        variant="secondary"
                        className={
                          outcome.status === 'passed' ? 'bg-performance-high/10 text-performance-high' :
                          outcome.status === 'failed' ? 'bg-performance-low/10 text-performance-low' :
                          outcome.status === 'in_progress' ? 'bg-accent/10 text-accent' :
                          'bg-muted text-muted-foreground'
                        }
                      >
                        {outcome.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Flow Controller (handles next actions) */}
      <FlowController />

      {/* Modals */}
      <ExplanationModal />
      <InterventionScreen />
      
      {/* Loading Animation */}
      {state.isLoading && (
        <LoadingAnimation message={
          state.nextAction === 'verification_question' ? 'Generating verification question...' :
          state.nextAction === 'next_subtopic' ? 'Preparing next subtopic...' :
          !state.currentQuestion ? 'Starting your quiz session...' :
          'Loading...'
        } />
      )}
    </div>
  );
}
