import { useSession } from '@/context/SessionContext';
import { useSessionActions } from '@/hooks/useSessionActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Hand, Loader2, Play } from 'lucide-react';

export function InterventionScreen() {
  const { state } = useSession();
  const { resumeSession } = useSessionActions();
  
  const { interventionMessage, status, isLoading } = state;

  const handleResume = async () => {
    await resumeSession();
  };

  if (status !== 'paused_for_teacher') return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-destructive/50 shadow-lg animate-scale-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto p-4 rounded-full bg-destructive/10 w-fit mb-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Session Paused</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-medium text-destructive">
              Teacher Intervention Required
            </p>
            <p className="text-muted-foreground">
              The class is struggling with this topic. Teacher guidance is needed before continuing.
            </p>
          </div>

          {interventionMessage && (
            <div className="p-4 bg-muted/50 rounded-xl text-left">
              <p className="text-sm font-medium text-muted-foreground mb-2">System Message</p>
              <p className="text-sm">{interventionMessage}</p>
            </div>
          )}

          <div className="pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Hand className="h-4 w-4" />
              <span>Click below when ready to continue</span>
            </div>
            
            <Button
              onClick={handleResume}
              disabled={isLoading}
              size="lg"
              className="w-full gradient-accent text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resuming...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Resume Session
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
