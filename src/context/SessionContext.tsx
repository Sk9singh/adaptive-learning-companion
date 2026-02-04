import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type {
  SessionStatus,
  QuestionResponse,
  ClassConsistency,
  SubtopicOutcome,
  NextAction,
  ExplanationResponse,
  AnalyticsResponse,
} from '@/types/agent.types';

interface SessionState {
  // Session info
  sessionId: string | null;
  status: SessionStatus | null;
  currentSubtopic: string | null;
  
  // Current question
  currentQuestion: QuestionResponse | null;
  
  // Metrics
  questionConsistency: number;
  classConsistency: ClassConsistency | null;
  masteryPercentage: number;
  
  // Flow control
  nextAction: NextAction | null;
  explanation: ExplanationResponse | null;
  interventionMessage: string | null;
  
  // Progress
  subtopicOutcomes: SubtopicOutcome[];
  questionsAsked: number;
  interventionCount: number;
  
  // Analytics
  analytics: AnalyticsResponse | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

type SessionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'START_SESSION'; payload: { sessionId: string; status: SessionStatus; currentSubtopic: string } }
  | { type: 'SET_QUESTION'; payload: QuestionResponse }
  | { type: 'UPDATE_METRICS'; payload: { questionConsistency: number; classConsistency: ClassConsistency; masteryPercentage: number } }
  | { type: 'SET_NEXT_ACTION'; payload: { nextAction: NextAction; message?: string } }
  | { type: 'SET_EXPLANATION'; payload: ExplanationResponse }
  | { type: 'CLEAR_EXPLANATION' }
  | { type: 'SET_INTERVENTION'; payload: string }
  | { type: 'CLEAR_INTERVENTION' }
  | { type: 'UPDATE_STATUS'; payload: { status: SessionStatus; currentSubtopic?: string; subtopicOutcomes?: SubtopicOutcome[]; questionsAsked?: number; interventionCount?: number } }
  | { type: 'SET_ANALYTICS'; payload: AnalyticsResponse }
  | { type: 'RESET_SESSION' };

const initialState: SessionState = {
  sessionId: null,
  status: null,
  currentSubtopic: null,
  currentQuestion: null,
  questionConsistency: 0,
  classConsistency: null,
  masteryPercentage: 0,
  nextAction: null,
  explanation: null,
  interventionMessage: null,
  subtopicOutcomes: [],
  questionsAsked: 0,
  interventionCount: 0,
  analytics: null,
  isLoading: false,
  error: null,
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'START_SESSION':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        status: action.payload.status,
        currentSubtopic: action.payload.currentSubtopic,
        error: null,
      };
    
    case 'SET_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload,
        currentSubtopic: action.payload.currentSubtopic,
        isLoading: false,
      };
    
    case 'UPDATE_METRICS':
      return {
        ...state,
        questionConsistency: action.payload.questionConsistency,
        classConsistency: action.payload.classConsistency,
        masteryPercentage: action.payload.masteryPercentage,
      };
    
    case 'SET_NEXT_ACTION':
      return {
        ...state,
        nextAction: action.payload.nextAction,
        interventionMessage: action.payload.nextAction === 'teacher_intervention' 
          ? action.payload.message || null 
          : state.interventionMessage,
      };
    
    case 'SET_EXPLANATION':
      return {
        ...state,
        explanation: action.payload,
        isLoading: false,
      };
    
    case 'CLEAR_EXPLANATION':
      return {
        ...state,
        explanation: null,
      };
    
    case 'SET_INTERVENTION':
      return {
        ...state,
        interventionMessage: action.payload,
        status: 'paused_for_teacher',
      };
    
    case 'CLEAR_INTERVENTION':
      return {
        ...state,
        interventionMessage: null,
      };
    
    case 'UPDATE_STATUS':
      return {
        ...state,
        status: action.payload.status,
        currentSubtopic: action.payload.currentSubtopic ?? state.currentSubtopic,
        subtopicOutcomes: action.payload.subtopicOutcomes ?? state.subtopicOutcomes,
        questionsAsked: action.payload.questionsAsked ?? state.questionsAsked,
        interventionCount: action.payload.interventionCount ?? state.interventionCount,
      };
    
    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: action.payload,
        status: 'completed',
        isLoading: false,
      };
    
    case 'RESET_SESSION':
      return initialState;
    
    default:
      return state;
  }
}

interface SessionContextValue {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

export type { SessionState, SessionAction };
