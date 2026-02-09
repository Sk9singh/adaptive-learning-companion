import { useCallback } from 'react';
import { useSession } from '@/context/SessionContext';
import { agentApi } from '@/services/agentApi';
import type { StartSessionDto, SubmitResponsesDto } from '@/types/agent.types';

export function useSessionActions() {
  const { state, dispatch } = useSession();

  const startSession = useCallback(async (data: StartSessionDto) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const session = await agentApi.startSession(data);
      
      if (!session.sessionId) {
        throw new Error('No session ID returned from server');
      }
      
      dispatch({
        type: 'START_SESSION',
        payload: {
          sessionId: session.sessionId,
          status: session.status,
          currentSubtopic: session.currentSubtopic,
        },
      });
      
      // Auto-generate first question
      const question = await agentApi.generateQuestion(session.sessionId);
      dispatch({ type: 'SET_QUESTION', payload: question });
      
      return session;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start session';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [dispatch]);

  const generateQuestion = useCallback(async () => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const question = await agentApi.generateQuestion(state.sessionId);
      dispatch({ type: 'SET_QUESTION', payload: question });
      return question;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate question';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.sessionId, dispatch]);

  const submitResponses = useCallback(async (data: SubmitResponsesDto) => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await agentApi.submitResponses(state.sessionId, data);
      
      // Update metrics
      dispatch({
        type: 'UPDATE_METRICS',
        payload: {
          questionConsistency: result.questionConsistency,
          classConsistency: result.classConsistency,
          masteryPercentage: result.masteryPercentage,
        },
      });
      
      // Set next action
      dispatch({
        type: 'SET_NEXT_ACTION',
        payload: {
          nextAction: result.nextAction,
          message: result.message,
        },
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit responses';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.sessionId, dispatch]);

  const getExplanation = useCallback(async () => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const explanation = await agentApi.getExplanation(state.sessionId);
      dispatch({ type: 'SET_EXPLANATION', payload: explanation });
      return explanation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get explanation';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.sessionId, dispatch]);

  const resumeSession = useCallback(async () => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_INTERVENTION' });
    
    try {
      const session = await agentApi.resumeSession(state.sessionId);
      dispatch({
        type: 'UPDATE_STATUS',
        payload: {
          status: session.status,
          currentSubtopic: session.currentSubtopic,
        },
      });
      
      // Generate next question after resuming
      const question = await agentApi.generateQuestion(state.sessionId);
      dispatch({ type: 'SET_QUESTION', payload: question });
      
      return session;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resume session';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.sessionId, dispatch]);

  const refreshStatus = useCallback(async () => {
    if (!state.sessionId) return;
    
    try {
      const status = await agentApi.getStatus(state.sessionId);
      dispatch({
        type: 'UPDATE_STATUS',
        payload: {
          status: status.status,
          currentSubtopic: status.currentSubtopic,
          subtopicOutcomes: status.subtopicOutcomes,
          questionsAsked: status.questionsAsked,
          interventionCount: status.interventionCount,
        },
      });
      
      dispatch({
        type: 'UPDATE_METRICS',
        payload: {
          questionConsistency: state.questionConsistency,
          classConsistency: status.classConsistency,
          masteryPercentage: status.masteryPercentage,
        },
      });
      
      return status;
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  }, [state.sessionId, state.questionConsistency, dispatch]);

  const getAnalytics = useCallback(async () => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const analytics = await agentApi.getAnalytics(state.sessionId);
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });
      return analytics;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get analytics';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.sessionId, dispatch]);

  const stopSession = useCallback(async () => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = await agentApi.stopSession(state.sessionId);
      dispatch({ type: 'SET_ANALYTICS', payload: result.analytics });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop session';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  }, [state.sessionId, dispatch]);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, [dispatch]);

  const clearExplanation = useCallback(() => {
    dispatch({ type: 'CLEAR_EXPLANATION' });
  }, [dispatch]);

  return {
    state,
    startSession,
    generateQuestion,
    submitResponses,
    getExplanation,
    resumeSession,
    refreshStatus,
    getAnalytics,
    stopSession,
    resetSession,
    clearExplanation,
  };
}
