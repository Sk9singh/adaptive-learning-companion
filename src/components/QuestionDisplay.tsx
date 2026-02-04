import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDifficultyColor, getQuestionTypeColor, formatTime } from '@/utils/formatters';
import { Clock, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuestionDisplay() {
  const { state } = useSession();
  const { currentQuestion, isLoading } = state;
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (currentQuestion?.runtime) {
      setTimeRemaining(currentQuestion.runtime);
      
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentQuestion]);

  if (isLoading && !currentQuestion) {
    return (
      <Card className="border-0 shadow-card animate-pulse">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
            <p className="text-muted-foreground">Loading question...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="border-0 shadow-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto opacity-50" />
            <p>No question loaded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeProgress = currentQuestion.runtime > 0 
    ? (timeRemaining / currentQuestion.runtime) * 100 
    : 0;

  return (
    <Card className="border-0 shadow-card animate-fade-in overflow-hidden">
      {/* Progress bar at top */}
      <div className="h-1 bg-muted">
        <div 
          className={cn(
            "h-full transition-all duration-1000",
            timeProgress > 30 ? "bg-accent" : timeProgress > 10 ? "bg-warning" : "bg-destructive"
          )}
          style={{ width: `${timeProgress}%` }}
        />
      </div>

      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge className={cn(getDifficultyColor(currentQuestion.difficulty), "uppercase text-xs font-semibold")}>
              {currentQuestion.difficulty}
            </Badge>
            <Badge className={cn(getQuestionTypeColor(currentQuestion.questionType), "uppercase text-xs font-semibold")}>
              {currentQuestion.questionType}
            </Badge>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={cn(
              "font-mono font-medium",
              timeProgress <= 10 && "text-destructive animate-pulse"
            )}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Subtopic Progress */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Current Subtopic
            </p>
            <p className="font-semibold">{currentQuestion.currentSubtopic}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground mb-1">Progress</p>
            <p className="font-semibold text-accent">
              {currentQuestion.subtopicIndex + 1} / {currentQuestion.totalSubtopics}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Question Text */}
        <div className="p-6 bg-muted/50 rounded-xl mb-4">
          <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
        </div>

        {/* Image if available */}
        {currentQuestion.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img 
              src={currentQuestion.imageUrl} 
              alt="Question illustration" 
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Options if MCQ */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-3">Options:</p>
            <div className="grid gap-2">
              {currentQuestion.options.map((option, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-sm"
                >
                  <span className="font-semibold text-muted-foreground mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
