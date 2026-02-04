import type { Difficulty, QuestionType, SessionStatus } from '@/types/agent.types';

// Format milliseconds to human readable time
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

// Format percentage with optional decimal places
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

// Get difficulty color class
export const getDifficultyColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy':
      return 'bg-easy text-white';
    case 'medium':
      return 'bg-medium text-white';
    case 'hard':
      return 'bg-hard text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

// Get difficulty text color class
export const getDifficultyTextColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy':
      return 'text-easy';
    case 'medium':
      return 'text-medium';
    case 'hard':
      return 'text-hard';
    default:
      return 'text-muted-foreground';
  }
};

// Get question type color class
export const getQuestionTypeColor = (type: QuestionType): string => {
  switch (type) {
    case 'initial':
      return 'bg-initial text-white';
    case 'verification':
      return 'bg-verification text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

// Get session status color class
export const getStatusColor = (status: SessionStatus): string => {
  switch (status) {
    case 'initialized':
      return 'bg-status-initialized text-white';
    case 'running':
      return 'bg-status-running text-white';
    case 'evaluating':
      return 'bg-status-evaluating text-white';
    case 'remediation':
      return 'bg-status-remediation text-white';
    case 'paused_for_teacher':
      return 'bg-status-paused text-white';
    case 'completed':
      return 'bg-status-completed text-white';
    case 'stopped':
      return 'bg-status-stopped text-white';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

// Get performance color class
export const getPerformanceColor = (performance: 'high' | 'medium' | 'low'): string => {
  switch (performance) {
    case 'high':
      return 'text-performance-high';
    case 'medium':
      return 'text-performance-medium';
    case 'low':
      return 'text-performance-low';
    default:
      return 'text-muted-foreground';
  }
};

// Get performance background color class
export const getPerformanceBgColor = (performance: 'high' | 'medium' | 'low'): string => {
  switch (performance) {
    case 'high':
      return 'bg-performance-high';
    case 'medium':
      return 'bg-performance-medium';
    case 'low':
      return 'bg-performance-low';
    default:
      return 'bg-muted';
  }
};

// Format status for display
export const formatStatus = (status: SessionStatus): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Determine performance level based on percentage
export const getPerformanceLevel = (percentage: number): 'high' | 'medium' | 'low' => {
  if (percentage >= 70) return 'high';
  if (percentage >= 40) return 'medium';
  return 'low';
};
