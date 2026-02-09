import { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionContext';
import { useSessionActions } from '@/hooks/useSessionActions';
import { mockStudents, type StudentResponse } from '@/types/agent.types';
import { 
  generatePassResponses, 
  generateFailResponses, 
  generateRandomResponses,
  generateCustomResponses 
} from '@/utils/responseGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Send, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Shuffle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

export function ResponseSimulator() {
  const { state } = useSession();
  const { submitResponses } = useSessionActions();
  const { currentQuestion, isLoading, nextAction } = state;
  
  const [responses, setResponses] = useState<Map<string, StudentResponse>>(new Map());
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [customPassRate, setCustomPassRate] = useState(60);

  // Reset responses when question changes
  useEffect(() => {
    if (currentQuestion) {
      // Initialize with first option as default correct answer
      const defaultAnswer = currentQuestion.options?.[0] || 'Correct Answer';
      setCorrectAnswer(defaultAnswer);
      setResponses(new Map());
    }
  }, [currentQuestion]);

  const getWrongOptions = () => {
    if (!currentQuestion?.options) return ['Wrong A', 'Wrong B', 'Wrong C'];
    return currentQuestion.options.filter(o => o !== correctAnswer);
  };

  const toggleStudentCorrect = (studentId: string) => {
    setResponses(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(studentId);
      
      if (existing) {
        newMap.set(studentId, {
          ...existing,
          isCorrect: !existing.isCorrect,
          selectedAnswer: !existing.isCorrect ? correctAnswer : getWrongOptions()[0],
        });
      } else {
        newMap.set(studentId, {
          studentId,
          isCorrect: true,
          responseTime: Math.floor(Math.random() * 20000) + 10000,
          selectedAnswer: correctAnswer,
        });
      }
      
      return newMap;
    });
  };

  const applyPreset = (preset: 'pass' | 'fail' | 'random' | 'custom') => {
    let generated: StudentResponse[];
    
    switch (preset) {
      case 'pass':
        generated = generatePassResponses(mockStudents, correctAnswer, getWrongOptions());
        break;
      case 'fail':
        generated = generateFailResponses(mockStudents, correctAnswer, getWrongOptions());
        break;
      case 'random':
        generated = generateRandomResponses(mockStudents, correctAnswer, getWrongOptions());
        break;
      case 'custom':
        generated = generateCustomResponses(mockStudents, correctAnswer, customPassRate / 100, getWrongOptions());
        break;
    }
    
    const newMap = new Map<string, StudentResponse>();
    generated.forEach(r => newMap.set(r.studentId, r));
    setResponses(newMap);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || responses.size === 0) return;
    
    await submitResponses({
      questionId: currentQuestion.questionId,
      responses: Array.from(responses.values()),
    });
  };

  const correctCount = Array.from(responses.values()).filter(r => r.isCorrect).length;
  const totalResponses = responses.size;
  const passRate = totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0;

  if (!currentQuestion) {
    return null;
  }

  return (
    <Card className="border-0 shadow-card animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            <span>Student Response Simulator</span>
          </div>
          {totalResponses > 0 && (
            <Badge 
              variant="secondary" 
              className={cn(
                "text-sm",
                passRate >= 70 ? "bg-performance-high/10 text-performance-high" :
                passRate >= 40 ? "bg-performance-medium/10 text-performance-medium" :
                "bg-performance-low/10 text-performance-low"
              )}
            >
              {correctCount}/{totalResponses} correct ({passRate.toFixed(0)}%)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Correct Answer Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Correct Answer (for simulation)
          </label>
          {currentQuestion.options?.length ? (
            <div className="flex flex-wrap gap-2">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={index}
                  variant={correctAnswer === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCorrectAnswer(option)}
                  className={cn(
                    correctAnswer === option && "gradient-accent"
                  )}
                >
                  {String.fromCharCode(65 + index)}. {option.substring(0, 20)}...
                </Button>
              ))}
            </div>
          ) : (
            <Input 
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="Enter correct answer..."
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">Quick Actions</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset('pass')}
              className="flex items-center gap-2 hover:bg-performance-high/10 hover:text-performance-high hover:border-performance-high"
            >
              <TrendingUp className="h-4 w-4" />
              80% Pass
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset('fail')}
              className="flex items-center gap-2 hover:bg-performance-low/10 hover:text-performance-low hover:border-performance-low"
            >
              <TrendingDown className="h-4 w-4" />
              40% Fail
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset('random')}
              className="flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4" />
              Random
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => applyPreset('custom')}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Custom
            </Button>
          </div>

          {/* Custom Pass Rate Slider */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-sm text-muted-foreground w-24">Custom Rate:</span>
            <Slider
              value={[customPassRate]}
              onValueChange={([v]) => setCustomPassRate(v)}
              min={0}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12 text-right">{customPassRate}%</span>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Students ({mockStudents.length})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
            {mockStudents.map((student) => {
              const response = responses.get(student.id);
              const isCorrect = response?.isCorrect ?? false;
              const hasResponse = responses.has(student.id);
              
              return (
                <button
                  key={student.id}
                  onClick={() => toggleStudentCorrect(student.id)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border transition-all",
                    hasResponse 
                      ? isCorrect 
                        ? "border-performance-high bg-performance-high/10" 
                        : "border-performance-low bg-performance-low/10"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  {hasResponse ? (
                    isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-performance-high" />
                    ) : (
                      <XCircle className="h-4 w-4 text-performance-low" />
                    )
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className="text-sm truncate">{student.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || responses.size === 0 || !!nextAction}
          className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
        >
          {isLoading || nextAction ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {nextAction ? 'Processing...' : 'Submitting Responses...'}
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit {responses.size} Responses
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
