import { useSession } from '@/context/SessionContext';
import { useSessionActions } from '@/hooks/useSessionActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getPerformanceColor, 
  getPerformanceBgColor, 
  formatTime,
  formatPercentage 
} from '@/utils/formatters';
import { 
  Trophy, 
  Users, 
  Clock, 
  Target, 
  CheckCircle2, 
  XCircle,
  RotateCcw,
  Download,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AnalyticsReport() {
  const { state } = useSession();
  const { resetSession } = useSessionActions();
  
  const { analytics } = state;

  if (!analytics) return null;

  const { metadata, studentStats, classConsistency, masteryPercentage, subtopicOutcomes, aiInsights, summary } = analytics;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 pb-6">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-performance-high/10">
            <Trophy className="h-12 w-12 text-performance-high" />
          </div>
          <h1 className="text-3xl font-bold">Session Complete!</h1>
          <p className="text-muted-foreground">
            {metadata.subject} • {metadata.chapter} • {metadata.topic}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard 
            icon={<Users className="h-5 w-5" />}
            label="Students"
            value={summary.totalStudents}
          />
          <SummaryCard 
            icon={<Target className="h-5 w-5" />}
            label="Questions"
            value={summary.totalQuestions}
          />
          <SummaryCard 
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Pass Rate"
            value={`${summary.passRate.toFixed(0)}%`}
            color={summary.passRate >= 70 ? 'success' : summary.passRate >= 40 ? 'warning' : 'error'}
          />
          <SummaryCard 
            icon={<Clock className="h-5 w-5" />}
            label="Duration"
            value={formatDuration(metadata.duration)}
          />
        </div>

        {/* Main Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Mastery Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <span className={cn(
                  "text-5xl font-bold",
                  masteryPercentage >= 70 ? "text-performance-high" :
                  masteryPercentage >= 40 ? "text-performance-medium" :
                  "text-performance-low"
                )}>
                  {masteryPercentage.toFixed(0)}%
                </span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      masteryPercentage >= 70 ? "bg-performance-high" :
                      masteryPercentage >= 40 ? "bg-performance-medium" :
                      "bg-performance-low"
                    )}
                    style={{ width: `${masteryPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Class Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">
                  {classConsistency.averageScore.toFixed(0)}%
                </span>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-performance-high">{classConsistency.distribution.high}</div>
                    <div className="text-xs text-muted-foreground">High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-performance-medium">{classConsistency.distribution.medium}</div>
                    <div className="text-xs text-muted-foreground">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-performance-low">{classConsistency.distribution.low}</div>
                    <div className="text-xs text-muted-foreground">Low</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subtopic Outcomes */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Subtopic Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subtopicOutcomes.map((outcome, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {outcome.status === 'passed' ? (
                      <CheckCircle2 className="h-5 w-5 text-performance-high" />
                    ) : outcome.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-performance-low" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className="font-medium">{outcome.subtopic}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {outcome.questionsAsked} questions
                    </span>
                    <Badge 
                      className={cn(
                        outcome.status === 'passed' ? 'bg-performance-high' :
                        outcome.status === 'failed' ? 'bg-performance-low' :
                        'bg-muted text-muted-foreground',
                        "text-xs uppercase"
                      )}
                    >
                      {outcome.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Stats */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Student Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm text-muted-foreground font-medium">Student</th>
                    <th className="text-center py-2 px-3 text-sm text-muted-foreground font-medium">Correct</th>
                    <th className="text-center py-2 px-3 text-sm text-muted-foreground font-medium">Total</th>
                    <th className="text-center py-2 px-3 text-sm text-muted-foreground font-medium">Avg Time</th>
                    <th className="text-center py-2 px-3 text-sm text-muted-foreground font-medium">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((student, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium">
                        {student.name || `Student ${index + 1}`}
                      </td>
                      <td className="py-2 px-3 text-center">{student.correctAnswers}</td>
                      <td className="py-2 px-3 text-center">{student.totalQuestions}</td>
                      <td className="py-2 px-3 text-center font-mono text-sm">
                        {formatTime(student.averageResponseTime)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge 
                          className={cn(
                            getPerformanceBgColor(student.performance),
                            "text-white text-xs uppercase"
                          )}
                        >
                          {student.performance}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        {aiInsights && aiInsights.length > 0 && (
          <Card className="border-0 shadow-card border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Sparkles className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={resetSession}
            className="px-8"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Start New Session
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ 
  icon, 
  label, 
  value, 
  color = 'default' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color?: 'default' | 'success' | 'warning' | 'error';
}) {
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-performance-high',
    warning: 'text-performance-medium',
    error: 'text-performance-low',
  };

  return (
    <Card className="border-0 shadow-card">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-xs uppercase tracking-wide">{label}</span>
        </div>
        <div className={cn("text-2xl font-bold", colorClasses[color])}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
