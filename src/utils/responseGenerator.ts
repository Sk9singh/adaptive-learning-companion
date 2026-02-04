import type { MockStudent, StudentResponse } from '@/types/agent.types';

// Generate a random response time between 10-30 seconds (in ms)
const generateResponseTime = (): number => {
  return Math.floor(Math.random() * 20000) + 10000;
};

// Generate responses where ~80% are correct (pass scenario)
export const generatePassResponses = (
  students: MockStudent[],
  correctAnswer: string,
  wrongOptions: string[] = ['Option A', 'Option B', 'Option C']
): StudentResponse[] => {
  const passCount = Math.floor(students.length * 0.8);
  
  return students.map((student, index) => {
    const isCorrect = index < passCount;
    return {
      studentId: student.id,
      isCorrect,
      responseTime: generateResponseTime(),
      selectedAnswer: isCorrect 
        ? correctAnswer 
        : wrongOptions[Math.floor(Math.random() * wrongOptions.length)],
    };
  });
};

// Generate responses where ~40% are correct (fail scenario)
export const generateFailResponses = (
  students: MockStudent[],
  correctAnswer: string,
  wrongOptions: string[] = ['Option A', 'Option B', 'Option C']
): StudentResponse[] => {
  const passCount = Math.floor(students.length * 0.4);
  
  return students.map((student, index) => {
    const isCorrect = index < passCount;
    return {
      studentId: student.id,
      isCorrect,
      responseTime: generateResponseTime(),
      selectedAnswer: isCorrect 
        ? correctAnswer 
        : wrongOptions[Math.floor(Math.random() * wrongOptions.length)],
    };
  });
};

// Generate random responses (50-80% pass rate)
export const generateRandomResponses = (
  students: MockStudent[],
  correctAnswer: string,
  wrongOptions: string[] = ['Option A', 'Option B', 'Option C']
): StudentResponse[] => {
  const passRate = Math.random() * 0.3 + 0.5; // 50-80%
  
  return students.map((student) => {
    const isCorrect = Math.random() < passRate;
    return {
      studentId: student.id,
      isCorrect,
      responseTime: generateResponseTime(),
      selectedAnswer: isCorrect 
        ? correctAnswer 
        : wrongOptions[Math.floor(Math.random() * wrongOptions.length)],
    };
  });
};

// Generate custom responses based on pass rate
export const generateCustomResponses = (
  students: MockStudent[],
  correctAnswer: string,
  passRate: number,
  wrongOptions: string[] = ['Option A', 'Option B', 'Option C']
): StudentResponse[] => {
  const passCount = Math.floor(students.length * passRate);
  
  // Shuffle students to randomize who passes
  const shuffledIndexes = students.map((_, i) => i).sort(() => Math.random() - 0.5);
  
  return students.map((student, index) => {
    const shuffledPosition = shuffledIndexes.indexOf(index);
    const isCorrect = shuffledPosition < passCount;
    return {
      studentId: student.id,
      isCorrect,
      responseTime: generateResponseTime(),
      selectedAnswer: isCorrect 
        ? correctAnswer 
        : wrongOptions[Math.floor(Math.random() * wrongOptions.length)],
    };
  });
};
