import { useEffect, useRef } from 'react';
import { useSession } from '@/context/SessionContext';
import { useSessionActions } from '@/hooks/useSessionActions';
import { toast } from 'sonner';

export function FlowController() {
  const { state, dispatch } = useSession();
  const { getExplanation, generateQuestion, getAnalytics } = useSessionActions();
  const processingAction = useRef(false);

  useEffect(() => {
    if (!state.nextAction || state.isLoading || processingAction.current) return;

    const handleNextAction = async () => {
      processingAction.current = true;
      const currentAction = state.nextAction;
      
      // Clear the nextAction immediately to prevent re-processing
      dispatch({ type: 'SET_NEXT_ACTION', payload: { nextAction: null } });

      try {
        switch (currentAction) {
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
      } finally {
        processingAction.current = false;
      }
    };

    handleNextAction();
  }, [state.nextAction, state.isLoading, dispatch, getExplanation, generateQuestion, getAnalytics]);

  return null;
}
