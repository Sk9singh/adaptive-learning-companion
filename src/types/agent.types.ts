// Agent Quiz Flow API Types

export interface StartSessionDto {
  schoolId: string;
  classLevel: number;
  className: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopics: string[];
  teacherId: string;
  proficiencyThreshold?: number;
  minimumQuestions?: number;
}

export interface SessionResponse {
  sessionId: string;
  status: SessionStatus;
  currentSubtopic: string;
  message?: string;
}

export type SessionStatus = 
  | 'initialized' 
  | 'running' 
  | 'evaluating' 
  | 'remediation' 
  | 'paused_for_teacher' 
  | 'completed' 
  | 'stopped';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'initial' | 'verification';
export type NextAction = 
  | 'show_explanation' 
  | 'verification_question' 
  | 'teacher_intervention' 
  | 'next_subtopic' 
  | 'session_complete';

export interface QuestionResponse {
  questionId: string;
  question: string;
  options?: string[];
  difficulty: Difficulty;
  questionType: QuestionType;
  runtime: number;
  imageUrl?: string;
  currentSubtopic: string;
  subtopicIndex: number;
  totalSubtopics: number;
}

export interface StudentResponse {
  studentId: string;
  isCorrect: boolean;
  responseTime: number;
  selectedAnswer: string;
}

export interface SubmitResponsesDto {
  questionId: string;
  responses: StudentResponse[];
}

export interface ClassConsistency {
  averageScore: number;
  distribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface SubmitResponsesResult {
  status: SessionStatus;
  classConsistency: ClassConsistency;
  masteryPercentage: number;
  questionConsistency: number;
  outcome: string;
  nextAction: NextAction;
  message?: string;
}

export interface ExplanationResponse {
  explanation: string;
  correctAnswer: string;
  nextAction: NextAction;
  questionId: string;
}

export interface SubtopicOutcome {
  subtopic: string;
  status: 'passed' | 'failed' | 'in_progress' | 'pending';
  questionsAsked: number;
  averageScore: number;
}

export interface StatusResponse {
  sessionId: string;
  status: SessionStatus;
  currentSubtopic: string;
  classConsistency: ClassConsistency;
  masteryPercentage: number;
  subtopicOutcomes: SubtopicOutcome[];
  questionsAsked: number;
  interventionCount: number;
}

export interface StudentStats {
  studentId: string;
  name?: string;
  correctAnswers: number;
  totalQuestions: number;
  averageResponseTime: number;
  performance: 'high' | 'medium' | 'low';
}

export interface AnalyticsResponse {
  sessionId: string;
  metadata: {
    subject: string;
    chapter: string;
    topic: string;
    classLevel: number;
    className: string;
    startedAt: string;
    endedAt?: string;
    duration?: number;
  };
  studentStats: StudentStats[];
  classConsistency: ClassConsistency;
  masteryPercentage: number;
  subtopicOutcomes: SubtopicOutcome[];
  aiInsights?: string[];
  summary: {
    totalQuestions: number;
    totalStudents: number;
    averageScore: number;
    passRate: number;
  };
}

export interface StopSessionResponse {
  sessionId: string;
  status: SessionStatus;
  stopReason: string;
  analytics: AnalyticsResponse;
}

// Mock student data
export interface MockStudent {
  id: string;
  name: string;
}

export const mockStudents: MockStudent[] = [
  { id: "507f1f77bcf86cd799439015", name: "Student 1" },
  { id: "507f1f77bcf86cd799439016", name: "Student 2" },
  { id: "507f1f77bcf86cd799439017", name: "Student 3" },
  { id: "507f1f77bcf86cd799439018", name: "Student 4" },
  { id: "507f1f77bcf86cd799439019", name: "Student 5" },
  { id: "507f1f77bcf86cd79943901a", name: "Student 6" },
  { id: "507f1f77bcf86cd79943901b", name: "Student 7" },
  { id: "507f1f77bcf86cd79943901c", name: "Student 8" },
  { id: "507f1f77bcf86cd79943901d", name: "Student 9" },
  { id: "507f1f77bcf86cd79943901e", name: "Student 10" },
];

export const sampleSessionData: StartSessionDto = {
  schoolId: "507f1f77bcf86cd799439011",
  classLevel: 10,
  className: "10-A",
  subject: "Mathematics",
  chapter: "Algebra",
  topic: "Linear Equations",
  subtopics: [
    "Simple Linear Equations",
    "Equations with Variables on Both Sides",
    "Word Problems"
  ],
  teacherId: "507f1f77bcf86cd799439012",
  proficiencyThreshold: 60,
  minimumQuestions: 1
};
