import { useState } from 'react';
import { useSessionActions } from '@/hooks/useSessionActions';
import { sampleSessionData } from '@/types/agent.types';
import { agentApi } from '@/services/agentApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, X, Plus, BookOpen, GraduationCap, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingAnimation } from './LoadingAnimation';

export function SessionForm() {
  const { startSession, state } = useSessionActions();
  const [formData, setFormData] = useState(sampleSessionData);
  const [board, setBoard] = useState('CBSE');
  const [newSubtopic, setNewSubtopic] = useState('');
  const [isGeneratingSubtopics, setIsGeneratingSubtopics] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await startSession(formData);
  };

  const handleChange = (field: keyof typeof formData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSubtopic = () => {
    if (newSubtopic.trim()) {
      setFormData(prev => ({
        ...prev,
        subtopics: [...prev.subtopics, newSubtopic.trim()],
      }));
      setNewSubtopic('');
    }
  };

  const removeSubtopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index),
    }));
  };

  const useSampleData = () => {
    setFormData(sampleSessionData);
  };

  const generateSubtopics = async () => {
    // Validate required fields
    if (!formData.classLevel || !formData.subject || !formData.chapter || !formData.topic) {
      toast.error('Please fill in Class Level, Subject, Chapter, and Topic first');
      return;
    }

    setIsGeneratingSubtopics(true);
    try {
      const result = await agentApi.generateSubtopics({
        board,
        classLevel: formData.classLevel,
        subject: formData.subject,
        chapter: formData.chapter,
        topic: formData.topic,
      });

      setFormData(prev => ({
        ...prev,
        subtopics: result.subtopics,
      }));

      toast.success(`Generated ${result.subtopics.length} subtopics for "${result.mainTopic}"`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate subtopics';
      toast.error(message);
    } finally {
      setIsGeneratingSubtopics(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl shadow-card animate-fade-in border-0">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Start Quiz Session</CardTitle>
              <CardDescription className="mt-1">
                Configure your adaptive learning quiz session
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Fill */}
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={useSampleData}
                className="text-muted-foreground hover:text-foreground"
              >
                Fill Sample Data
              </Button>
            </div>

            {/* IDs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schoolId" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  School ID
                </Label>
                <Input
                  id="schoolId"
                  value={formData.schoolId}
                  onChange={(e) => handleChange('schoolId', e.target.value)}
                  placeholder="MongoDB ObjectId"
                  className="font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacherId" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Teacher ID
                </Label>
                <Input
                  id="teacherId"
                  value={formData.teacherId}
                  onChange={(e) => handleChange('teacherId', e.target.value)}
                  placeholder="MongoDB ObjectId"
                  className="font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Class Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="board">Board</Label>
                <Input
                  id="board"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  placeholder="e.g., CBSE, ICSE"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Input
                  id="classLevel"
                  type="number"
                  min={1}
                  max={12}
                  value={formData.classLevel}
                  onChange={(e) => handleChange('classLevel', parseInt(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  value={formData.className}
                  onChange={(e) => handleChange('className', e.target.value)}
                  placeholder="e.g., 10-A"
                  required
                />
              </div>
            </div>

            {/* Subject Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter</Label>
                <Input
                  id="chapter"
                  value={formData.chapter}
                  onChange={(e) => handleChange('chapter', e.target.value)}
                  placeholder="e.g., Algebra"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => handleChange('topic', e.target.value)}
                  placeholder="e.g., Linear Equations"
                  required
                />
              </div>
            </div>

            {/* Subtopics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Subtopics</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateSubtopics}
                  disabled={isGeneratingSubtopics || !formData.classLevel || !formData.subject || !formData.chapter || !formData.topic}
                  className="gap-2"
                >
                  {isGeneratingSubtopics ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSubtopic}
                  onChange={(e) => setNewSubtopic(e.target.value)}
                  placeholder="Or add manually..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtopic())}
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="icon"
                  onClick={addSubtopic}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                {formData.subtopics.map((subtopic, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="pl-3 pr-1 py-1.5 text-sm flex items-center gap-1 animate-scale-in"
                  >
                    {subtopic}
                    <button
                      type="button"
                      onClick={() => removeSubtopic(index)}
                      className="ml-1 p-0.5 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.subtopics.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Click "Generate with AI" or add subtopics manually
                  </p>
                )}
              </div>
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Proficiency Threshold</Label>
                  <span className="text-sm font-semibold text-accent">
                    {formData.proficiencyThreshold}%
                  </span>
                </div>
                <Slider
                  value={[formData.proficiencyThreshold ?? 60]}
                  onValueChange={([value]) => handleChange('proficiencyThreshold', value)}
                  min={0}
                  max={100}
                  step={5}
                  className="py-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumQuestions">Minimum Questions</Label>
                <Input
                  id="minimumQuestions"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.minimumQuestions}
                  onChange={(e) => handleChange('minimumQuestions', parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Error Display */}
            {state.error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                {state.error}
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
              disabled={state.isLoading || formData.subtopics.length === 0}
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Starting Session...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Quiz Session
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Loading Animation */}
      {state.isLoading && (
        <LoadingAnimation message="Starting your quiz session..." />
      )}
    </div>
  );
}
