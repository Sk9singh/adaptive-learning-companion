import { useSession } from '@/context/SessionContext';
import { MetricCard } from './MetricCard';
import { BarChart3, Target, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function MetricsDashboard() {
  const { state } = useSession();

  const distribution = state.classConsistency?.distribution || { high: 0, medium: 0, low: 0 };
  const total = distribution.high + distribution.medium + distribution.low;

  return (
    <div className="space-y-4">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Question Consistency"
          value={state.questionConsistency}
          icon={<Target className="h-4 w-4" />}
          description="Current question performance"
        />
        <MetricCard
          title="Class Consistency"
          value={state.classConsistency?.averageScore || 0}
          icon={<Users className="h-4 w-4" />}
          description="Current subtopic average"
        />
        <MetricCard
          title="Mastery Percentage"
          value={state.masteryPercentage}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Overall session performance"
        />
      </div>

      {/* Distribution Card */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            Student Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6 h-20">
            <DistributionBar 
              label="High" 
              value={distribution.high} 
              total={total} 
              color="bg-performance-high" 
            />
            <DistributionBar 
              label="Medium" 
              value={distribution.medium} 
              total={total} 
              color="bg-performance-medium" 
            />
            <DistributionBar 
              label="Low" 
              value={distribution.low} 
              total={total} 
              color="bg-performance-low" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DistributionBar({ 
  label, 
  value, 
  total, 
  color 
}: { 
  label: string; 
  value: number; 
  total: number; 
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <div className="w-full h-16 bg-muted rounded-lg relative flex items-end">
        <div 
          className={cn("w-full rounded-lg transition-all duration-500", color)}
          style={{ height: `${Math.max(percentage, 5)}%` }}
        />
      </div>
      <div className="text-center">
        <div className="text-lg font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
