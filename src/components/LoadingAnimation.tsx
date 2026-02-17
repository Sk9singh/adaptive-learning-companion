import Lottie from 'lottie-react';
import quizGenerationAnimation from '@/assets/quiz-generation.json';

interface LoadingAnimationProps {
  message?: string;
}

export function LoadingAnimation({ message = 'Generating question...' }: LoadingAnimationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-2xl border shadow-2xl max-w-md">
        <div className="w-64 h-64">
          <Lottie
            animationData={quizGenerationAnimation}
            loop={true}
            autoplay={true}
          />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{message}</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your next question
          </p>
        </div>
      </div>
    </div>
  );
}
