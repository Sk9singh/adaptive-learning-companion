import { useSession } from '@/context/SessionContext';
import { useSessionActions } from '@/hooks/useSessionActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, formatStatus } from '@/utils/formatters';
import { 
  RefreshCw, 
  Activity, 
  BookOpen, 
  HelpCircle, 
  AlertTriangle,
  StopCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusMonitor() {
  const { state } = useSession();
  const { refreshStatus, stopSession } = useSessionActions();

  const handleRefresh = async () => {
    await refreshStatus();
  };

  const handleStop = async () => {
    if (confirm('Are you sure you want to stop this session?')) {
      await stopSession();
    }
  };

  if (!state.sessionId) return null;

  return (
    <Card className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            Session Status
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
            disabled={state.isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", state.isLoading && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session ID */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Session ID</p>
          <p className="text-xs font-mono bg-muted px-2 py-1 rounded truncate">
            {state.sessionId}
          </p>
        </div>

        {/* Status Badge */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Status</p>
          <Badge className={cn(getStatusColor(state.status!), "text-xs")}>
            {formatStatus(state.status!)}
          </Badge>
        </div>

        {/* Current Subtopic */}
        {state.currentSubtopic && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Current Subtopic
            </p>
            <p className="text-sm font-medium">{state.currentSubtopic}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <HelpCircle className="h-3 w-3" />
              <span className="text-xs">Questions</span>
            </div>
            <p className="text-lg font-bold">{state.questionsAsked}</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">Interventions</span>
            </div>
            <p className="text-lg font-bold">{state.interventionCount}</p>
          </div>
        </div>

        {/* Stop Button */}
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleStop}
          disabled={state.isLoading || state.status === 'completed' || state.status === 'stopped'}
        >
          <StopCircle className="mr-2 h-4 w-4" />
          Stop Session
        </Button>
      </CardContent>
    </Card>
  );
}
