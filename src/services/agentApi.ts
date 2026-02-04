import axios from 'axios';
import type {
  StartSessionDto,
  SessionResponse,
  QuestionResponse,
  SubmitResponsesDto,
  SubmitResponsesResult,
  ExplanationResponse,
  StatusResponse,
  AnalyticsResponse,
  StopSessionResponse,
} from '@/types/agent.types';

const BASE_URL = 'https://pibox-backend.betterpw.live/v1/agent';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export const agentApi = {
  // Start a new quiz session
  startSession: async (data: StartSessionDto): Promise<SessionResponse> => {
    const response = await api.post('/start', data);
    return response.data;
  },

  // Generate the next question for a session
  generateQuestion: async (sessionId: string): Promise<QuestionResponse> => {
    const response = await api.post(`/${sessionId}/next-question`);
    return response.data;
  },

  // Submit student responses for a question
  submitResponses: async (sessionId: string, data: SubmitResponsesDto): Promise<SubmitResponsesResult> => {
    const response = await api.post(`/${sessionId}/submit-responses`, data);
    return response.data;
  },

  // Get explanation for current question
  getExplanation: async (sessionId: string): Promise<ExplanationResponse> => {
    const response = await api.get(`/${sessionId}/explanation`);
    return response.data;
  },

  // Resume a paused session (after teacher intervention)
  resumeSession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await api.post(`/${sessionId}/resume`);
    return response.data;
  },

  // Get current session status
  getStatus: async (sessionId: string): Promise<StatusResponse> => {
    const response = await api.get(`/${sessionId}/status`);
    return response.data;
  },

  // Get full analytics for a session
  getAnalytics: async (sessionId: string): Promise<AnalyticsResponse> => {
    const response = await api.get(`/${sessionId}/analytics`);
    return response.data;
  },

  // Stop/end a session
  stopSession: async (sessionId: string): Promise<StopSessionResponse> => {
    const response = await api.post(`/${sessionId}/stop`);
    return response.data;
  },
};

export default agentApi;
