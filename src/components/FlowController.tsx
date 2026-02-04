import { useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { useSessionActions } from '@/hooks/useSessionActions';
import { toast } from 'sonner';

export function FlowController() {
  const { state } = useSession();
  const { getExplanation, generateQuestion, getAnalytics } = useSessionActions();

  useEffect(() => {
    if (!state.nextAction || state.isLoading) return;

    const handleNextAction = async () => {
      switch (state.nextAction) {
        case 'show_explanation':
          toast.info('Showing explanation for the class...');
          await getExplanation();
          break;

        case 'verification_question':
          toast.info('Generating verification question...');
          await generateQuestion();
          break;

        case 'teacher_intervention':
          toast.warning('Teacher intervention required!');
          // Intervention screen is handled by InterventionScreen component
          break;

        case 'next_subtopic':
          toast.success('Moving to next subtopic!');
          await generateQuestion();
          break;

        case 'session_complete':
          toast.success('Session completed!');
          await getAnalytics();
          break;
      }
    };

    handleNextAction();
  }, [state.nextAction]);

  return null;
}
