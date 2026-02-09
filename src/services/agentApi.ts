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
const AI_QUIZ_BASE_URL = 'https://pibox-backend.betterpw.live/v1/ai-quiz';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const aiQuizApi = axios.create({
  baseURL: AI_QUIZ_BASE_URL,
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

aiQuizApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('AI Quiz API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// Helper function to convert decimal values (0-1) to percentages (0-100)
const toPercentage = (value: number): number => {
  // If value is between 0-1, treat as decimal and convert to percentage
  // If value is > 1, assume it's already a percentage
  return value <= 1 ? value * 100 : value;
};

export const agentApi = {
  // Start a new quiz session
  startSession: async (data: StartSessionDto): Promise<SessionResponse> => {
    const response = await api.post('/start', data);
    // Backend wraps response in a 'data' property
    return response.data.data || response.data;
  },

  // Generate the next question for a session
  generateQuestion: async (sessionId: string): Promise<QuestionResponse> => {
    if (!sessionId) {
      throw new Error('Session ID is required to generate a question');
    }
    const response = await api.post(`/${sessionId}/next-question`);
    const data = response.data.data || response.data;
    
    // Backend returns nested structure - flatten it
    // Backend structure: { questionId, subtopic, question: { type, question, options, imageUrl }, ... }
    // Expected structure: { questionId, question: string, options, imageUrl, currentSubtopic, ... }
    const transformed: QuestionResponse = {
      questionId: data.questionId,
      question: data.question?.question || data.question, // Extract the actual question text
      options: data.question?.options || data.options,
      difficulty: data.difficulty,
      questionType: data.questionType,
      runtime: data.runtime,
      imageUrl: data.question?.imageUrl || data.imageUrl,
      currentSubtopic: data.subtopic || data.currentSubtopic,
      subtopicIndex: data.questionIndex || data.subtopicIndex || 0,
      totalSubtopics: data.totalSubtopics || 3, // Default fallback
    };
    
    return transformed;
  },

  // Submit student responses for a question
  submitResponses: async (sessionId: string, data: SubmitResponsesDto): Promise<SubmitResponsesResult> => {
    const response = await api.post(`/${sessionId}/submit-responses`, data);
    const result = response.data.data || response.data;
    
    // Convert decimal values to percentages
    return {
      ...result,
      questionConsistency: toPercentage(result.questionConsistency || 0),
      masteryPercentage: toPercentage(result.masteryPercentage || 0),
      classConsistency: result.classConsistency ? {
        ...result.classConsistency,
        averageScore: toPercentage(result.classConsistency.averageScore || 0),
      } : result.classConsistency,
    };
  },

  // Get explanation for current question
  getExplanation: async (sessionId: string): Promise<ExplanationResponse> => {
    const response = await api.get(`/${sessionId}/explanation`);
    return response.data.data || response.data;
  },

  // Resume a paused session (after teacher intervention)
  resumeSession: async (sessionId: string): Promise<SessionResponse> => {
    const response = await api.post(`/${sessionId}/resume`);
    return response.data.data || response.data;
  },

  // Get current session status
  getStatus: async (sessionId: string): Promise<StatusResponse> => {
    const response = await api.get(`/${sessionId}/status`);
    const status = response.data.data || response.data;
    
    // Convert decimal values to percentages
    return {
      ...status,
      masteryPercentage: toPercentage(status.masteryPercentage || 0),
      classConsistency: status.classConsistency ? {
        ...status.classConsistency,
        averageScore: toPercentage(status.classConsistency.averageScore || 0),
      } : status.classConsistency,
    };
  },

  // Get full analytics for a session
  getAnalytics: async (sessionId: string): Promise<AnalyticsResponse> => {
    const response = await api.get(`/${sessionId}/analytics`);
    const analytics = response.data.data || response.data;
    
    // Transform studentStats from object to array
    let transformedStudentStats = [];
    if (analytics.studentStats && typeof analytics.studentStats === 'object' && !Array.isArray(analytics.studentStats)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformedStudentStats = Object.entries(analytics.studentStats).map(([studentId, stats]: [string, any]) => {
        const responseTimes = stats.responseTimes || {};
        const timeValues = Object.values(responseTimes) as number[];
        const avgTime = timeValues.length > 0 ? timeValues.reduce((a, b) => a + b, 0) / timeValues.length : 0;
        
        return {
          studentId,
          name: stats.name,
          correctAnswers: stats.correct || 0,
          totalQuestions: stats.answered || 0,
          averageResponseTime: avgTime,
          performance: (stats.band?.toLowerCase() || 'low') as 'high' | 'medium' | 'low',
        };
      });
    } else if (Array.isArray(analytics.studentStats)) {
      transformedStudentStats = analytics.studentStats;
    }

    // Transform aiInsights from object to array of strings
    let transformedAiInsights: string[] = [];
    if (analytics.aiInsights && typeof analytics.aiInsights === 'object' && !Array.isArray(analytics.aiInsights)) {
      // If aiInsights is an object with summary and recommendations
      if (analytics.aiInsights.summary) {
        transformedAiInsights.push(analytics.aiInsights.summary);
      }
      if (Array.isArray(analytics.aiInsights.recommendations)) {
        transformedAiInsights.push(...analytics.aiInsights.recommendations);
      }
      if (Array.isArray(analytics.aiInsights.strugglingConcepts)) {
        transformedAiInsights.push('Struggling concepts: ' + analytics.aiInsights.strugglingConcepts.join(', '));
      }
    } else if (Array.isArray(analytics.aiInsights)) {
      transformedAiInsights = analytics.aiInsights;
    }
    
    // Calculate summary from transformed data
    const totalStudents = transformedStudentStats.length;
    
    // Total questions: prefer backend's value, fallback to calculating from student stats
    let totalQuestions = 0;
    if (analytics.summary?.totalQuestions) {
      totalQuestions = analytics.summary.totalQuestions;
    } else if (transformedStudentStats.length > 0) {
      // Use the maximum totalQuestions from any student (they should all have been asked the same questions)
      totalQuestions = Math.max(...transformedStudentStats.map(s => s.totalQuestions));
    }
    
    const totalCorrect = transformedStudentStats.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalAnswered = transformedStudentStats.reduce((sum, s) => sum + s.totalQuestions, 0);
    const averageScore = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
    const passRate = totalStudents > 0 ? 
      (transformedStudentStats.filter(s => (s.correctAnswers / s.totalQuestions) >= 0.7).length / totalStudents) * 100 : 0;
    
    // Transform subtopicOutcomes to add averageScore from averageConsistency
    const transformedSubtopicOutcomes = Array.isArray(analytics.subtopicOutcomes) 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? analytics.subtopicOutcomes.map((outcome: any) => ({
          ...outcome,
          averageScore: toPercentage(outcome.averageConsistency || outcome.averageScore || 0),
        }))
      : [];
    
    // Convert decimal values to percentages
    const result: AnalyticsResponse = {
      sessionId: analytics.sessionId,
      metadata: {
        ...analytics.metadata,
        // Add duration from summary to metadata for easier access in UI
        duration: analytics.summary?.duration || analytics.metadata?.duration,
      },
      masteryPercentage: toPercentage(analytics.masteryPercentage || 0),
      classConsistency: analytics.classConsistency ? {
        averageScore: toPercentage(analytics.classConsistency.averageScore || 0),
        distribution: analytics.classConsistency.distribution || { high: 0, medium: 0, low: 0 },
      } : { averageScore: 0, distribution: { high: 0, medium: 0, low: 0 } },
      summary: {
        totalQuestions,
        totalStudents,
        averageScore,
        passRate,
      },
      studentStats: transformedStudentStats,
      subtopicOutcomes: transformedSubtopicOutcomes,
      aiInsights: transformedAiInsights,
    };
    
    return result;
  },

  // Stop/end a session
  stopSession: async (sessionId: string): Promise<StopSessionResponse> => {
    const response = await api.post(`/${sessionId}/stop`);
    const result = response.data.data || response.data;
    
    // Apply percentage transformations to analytics
    if (result.analytics) {
      // Transform studentStats from object to array
      let transformedStudentStats = [];
      if (result.analytics.studentStats && typeof result.analytics.studentStats === 'object' && !Array.isArray(result.analytics.studentStats)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformedStudentStats = Object.entries(result.analytics.studentStats).map(([studentId, stats]: [string, any]) => {
          const responseTimes = stats.responseTimes || {};
          const timeValues = Object.values(responseTimes) as number[];
          const avgTime = timeValues.length > 0 ? timeValues.reduce((a, b) => a + b, 0) / timeValues.length : 0;
          
          return {
            studentId,
            name: stats.name,
            correctAnswers: stats.correct || 0,
            totalQuestions: stats.answered || 0,
            averageResponseTime: avgTime,
            performance: (stats.band?.toLowerCase() || 'low') as 'high' | 'medium' | 'low',
          };
        });
      } else if (Array.isArray(result.analytics.studentStats)) {
        transformedStudentStats = result.analytics.studentStats;
      }

      // Transform aiInsights from object to array of strings
      let transformedAiInsights: string[] = [];
      if (result.analytics.aiInsights && typeof result.analytics.aiInsights === 'object' && !Array.isArray(result.analytics.aiInsights)) {
        if (result.analytics.aiInsights.summary) {
          transformedAiInsights.push(result.analytics.aiInsights.summary);
        }
        if (Array.isArray(result.analytics.aiInsights.recommendations)) {
          transformedAiInsights.push(...result.analytics.aiInsights.recommendations);
        }
        if (Array.isArray(result.analytics.aiInsights.strugglingConcepts)) {
          transformedAiInsights.push('Struggling concepts: ' + result.analytics.aiInsights.strugglingConcepts.join(', '));
        }
      } else if (Array.isArray(result.analytics.aiInsights)) {
        transformedAiInsights = result.analytics.aiInsights;
      }
      
      // Transform subtopicOutcomes to add averageScore from averageConsistency
      const transformedSubtopicOutcomes = Array.isArray(result.analytics.subtopicOutcomes) 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? result.analytics.subtopicOutcomes.map((outcome: any) => ({
            ...outcome,
            averageScore: toPercentage(outcome.averageConsistency || outcome.averageScore || 0),
          }))
        : [];
      
      // Calculate summary from transformed data
      const totalStudents = transformedStudentStats.length;
      
      // Total questions: prefer backend's value, fallback to calculating from student stats
      let totalQuestions = 0;
      if (result.analytics.summary?.totalQuestions) {
        totalQuestions = result.analytics.summary.totalQuestions;
      } else if (transformedStudentStats.length > 0) {
        // Use the maximum totalQuestions from any student (they should all have been asked the same questions)
        totalQuestions = Math.max(...transformedStudentStats.map(s => s.totalQuestions));
      }
      
      const totalCorrect = transformedStudentStats.reduce((sum, s) => sum + s.correctAnswers, 0);
      const totalAnswered = transformedStudentStats.reduce((sum, s) => sum + s.totalQuestions, 0);
      const averageScore = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
      const passRate = totalStudents > 0 ? 
        (transformedStudentStats.filter(s => (s.correctAnswers / s.totalQuestions) >= 0.7).length / totalStudents) * 100 : 0;
      
      result.analytics = {
        ...result.analytics,
        metadata: {
          ...result.analytics.metadata,
          // Add duration from summary to metadata for easier access in UI
          duration: result.analytics.summary?.duration || result.analytics.metadata?.duration,
        },
        masteryPercentage: toPercentage(result.analytics.masteryPercentage || 0),
        classConsistency: result.analytics.classConsistency ? {
          averageScore: toPercentage(result.analytics.classConsistency.averageScore || 0),
          distribution: result.analytics.classConsistency.distribution || { high: 0, medium: 0, low: 0 },
        } : { averageScore: 0, distribution: { high: 0, medium: 0, low: 0 } },
        summary: {
          totalQuestions,
          totalStudents,
          averageScore,
          passRate,
        },
        studentStats: transformedStudentStats,
        subtopicOutcomes: transformedSubtopicOutcomes,
        aiInsights: transformedAiInsights,
      };
    }
    
    return result;
  },

  // Generate subtopics using AI
  generateSubtopics: async (data: {
    board: string;
    classLevel: number;
    subject: string;
    chapter: string;
    topic: string;
  }): Promise<{ mainTopic: string; subtopics: string[] }> => {
    const response = await aiQuizApi.post('/generate-subtopics', data);
    return response.data.data || response.data;
  },
};

export default agentApi;
