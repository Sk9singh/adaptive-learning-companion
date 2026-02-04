import { useSession } from '@/context/SessionContext';
import { useSessionActions } from '@/hooks/useSessionActions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Loader2, Lightbulb } from 'lucide-react';

export function ExplanationModal() {
  const { state } = useSession();
  const { clearExplanation, generateQuestion } = useSessionActions();
  
  const { explanation, isLoading } = state;

  const handleContinue = async () => {
    clearExplanation();
    await generateQuestion();
  };

  if (!explanation) return null;

  return (
    <Dialog open={!!explanation} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <Lightbulb className="h-5 w-5 text-accent" />
            </div>
            Explanation
          </DialogTitle>
          <DialogDescription>
            Review the explanation before continuing to the verification question.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Correct Answer */}
          <div className="p-4 bg-performance-high/10 rounded-xl border border-performance-high/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-performance-high" />
              <span className="font-semibold text-performance-high">Correct Answer</span>
            </div>
            <p className="text-lg">{explanation.correctAnswer}</p>
          </div>

          {/* Explanation Text */}
          <div className="p-4 bg-muted/50 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground mb-2">Explanation</p>
            <p className="leading-relaxed">{explanation.explanation}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full gradient-primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Verification Question...
              </>
            ) : (
              <>
                Continue to Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
