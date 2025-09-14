/**
 * MEDDPICC Admin Configuration
 * No-code interface for managing MEDDPICC questions, weights, and settings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Copy,
  Download,
  Upload,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

import { MEDDPICC_CONFIG } from '../../data/meddpicc-config';
import { MEDDPICCConfiguration, MEDDPICCPillarData as MEDDPICCPillar, MEDDPICCQuestionData as MEDDPICCQuestion } from '../../services/meddpicc-service';

// Type aliases for compatibility
type MEDDPICCOption = {
  label: string;
  value: string;
  score: number;
};

type CoachingPrompt = {
  condition: {
    pillar: string;
    value: string;
  };
  prompt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export function MEDDPICCAdminConfig() {
  const [config, setConfig] = useState<MEDDPICCConfiguration>(MEDDPICC_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('pillars');
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Save configuration
  const saveConfiguration = () => {
    try {
      // In real implementation, this would save to backend/database
      localStorage.setItem('meddpicc_admin_config', JSON.stringify(config));
      setHasChanges(false);
      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  // Load configuration
  const loadConfiguration = () => {
    try {
      const savedConfig = localStorage.getItem('meddpicc_admin_config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
        toast.success('Configuration loaded');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      toast.error('Failed to load configuration');
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setConfig(MEDDPICC_CONFIG);
    setHasChanges(true);
    toast.success('Reset to default configuration');
  };

  // Export configuration
  const exportConfiguration = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meddpicc-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exported');
  };

  // Import configuration
  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setConfig(importedConfig);
        setHasChanges(true);
        toast.success('Configuration imported successfully');
      } catch (error) {
        console.error('Failed to import configuration:', error);
        toast.error('Invalid configuration file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">MEDDPICC Configuration</h2>
          <p className="text-muted-foreground">
            Configure questions, scoring, and coaching prompts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            {isPreviewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportConfiguration}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importConfiguration}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveConfiguration} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Make sure to save your configuration before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pillars">Pillars & Questions</TabsTrigger>
          <TabsTrigger value="scoring">Scoring & Thresholds</TabsTrigger>
          <TabsTrigger value="coaching">Coaching Prompts</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
        </TabsList>

        {/* Pillars & Questions Tab */}
        <TabsContent value="pillars" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Pillar List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  MEDDPICC Pillars
                  <Button size="sm" onClick={() => {/* Add new pillar */}}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {config.pillars.map((pillar) => (
                      <div
                        key={pillar.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPillar === pillar.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedPillar(pillar.id)}
                      >
                        <div className="font-medium">{pillar.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {pillar.questions.length} questions
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Pillar Editor */}
            <div className="lg:col-span-2">
              {selectedPillar ? (
                <PillarEditor
                  pillar={config.pillars.find(p => p.id === selectedPillar)!}
                  onUpdate={(updatedPillar) => {
                    setConfig(prev => ({
                      ...prev,
                      pillars: prev.pillars.map(p => p.id === selectedPillar ? updatedPillar : p)
                    }));
                    setHasChanges(true);
                  }}
                  isPreviewMode={isPreviewMode}
                />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a pillar to edit</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Scoring & Thresholds Tab */}
        <TabsContent value="scoring" className="space-y-4">
          <ScoringEditor
            scoring={config.scoring}
            onUpdate={(updatedScoring) => {
              setConfig(prev => ({ ...prev, scoring: updatedScoring }));
              setHasChanges(true);
            }}
          />
        </TabsContent>

        {/* Coaching Prompts Tab */}
        <TabsContent value="coaching" className="space-y-4">
          <CoachingPromptsEditor
            prompts={config.coaching_prompts}
            pillars={config.pillars}
            onUpdate={(updatedPrompts) => {
              setConfig(prev => ({ ...prev, coaching_prompts: updatedPrompts }));
              setHasChanges(true);
            }}
          />
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <GlobalSettingsEditor
            config={config}
            onUpdate={(updatedConfig) => {
              setConfig(updatedConfig);
              setHasChanges(true);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Pillar Editor Component
function PillarEditor({ 
  pillar, 
  onUpdate, 
  isPreviewMode 
}: { 
  pillar: MEDDPICCPillar; 
  onUpdate: (pillar: MEDDPICCPillar) => void;
  isPreviewMode: boolean;
}) {
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  const updatePillar = (updates: Partial<MEDDPICCPillar>) => {
    onUpdate({ ...pillar, ...updates });
  };

  const addQuestion = () => {
    const newQuestion: MEDDPICCQuestion = {
      id: `q_${pillar.id}_${Date.now()}`,
      text: 'New question',
      type: 'single-select',
      options: [
        { label: 'No', value: 'no', score: 0 },
        { label: 'Partial', value: 'partial', score: 20 },
        { label: 'Yes', value: 'yes', score: 40 }
      ],
      tooltip: ''
    };

    updatePillar({
      questions: [...pillar.questions, newQuestion]
    });
    setEditingQuestion(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<MEDDPICCQuestion>) => {
    updatePillar({
      questions: pillar.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  };

  const deleteQuestion = (questionId: string) => {
    updatePillar({
      questions: pillar.questions.filter(q => q.id !== questionId)
    });
  };

  if (isPreviewMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{pillar.title}</CardTitle>
          <CardDescription>{pillar.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pillar.primer && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>{pillar.primer}</AlertDescription>
              </Alert>
            )}
            {pillar.questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label className="font-medium">{index + 1}. {question.text}</Label>
                <div className="ml-4 space-y-1">
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <div className="w-4 h-4 border rounded-full" />
                      <span className="text-sm">{option.label} ({option.score} pts)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Edit Pillar: {pillar.title}
          <Button size="sm" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pillar Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pillar-title">Title</Label>
            <Input
              id="pillar-title"
              value={pillar.title}
              onChange={(e) => updatePillar({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pillar-max-score">Max Score</Label>
            <Input
              id="pillar-max-score"
              type="number"
              value={pillar.maxScore || 40}
              onChange={(e) => updatePillar({ maxScore: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pillar-description">Description</Label>
          <Textarea
            id="pillar-description"
            value={pillar.description}
            onChange={(e) => updatePillar({ description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pillar-primer">Primer (optional)</Label>
          <Textarea
            id="pillar-primer"
            value={pillar.primer || ''}
            onChange={(e) => updatePillar({ primer: e.target.value })}
            rows={3}
            placeholder="Helpful context or instructions for this pillar..."
          />
        </div>

        <Separator />

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Questions ({pillar.questions.length})</h4>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-4">
              {pillar.questions.map((question) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  isEditing={editingQuestion === question.id}
                  onEdit={() => setEditingQuestion(question.id)}
                  onSave={() => setEditingQuestion(null)}
                  onUpdate={(updates) => updateQuestion(question.id, updates)}
                  onDelete={() => deleteQuestion(question.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

// Question Editor Component
function QuestionEditor({
  question,
  isEditing,
  onEdit,
  onSave,
  onUpdate,
  onDelete
}: {
  question: MEDDPICCQuestion;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onUpdate: (updates: Partial<MEDDPICCQuestion>) => void;
  onDelete: () => void;
}) {
  const addOption = () => {
    const newOption: MEDDPICCOption = {
      label: 'New option',
      value: `option_${Date.now()}`,
      score: 0
    };
    onUpdate({
      options: [...question.options, newOption]
    });
  };

  const updateOption = (index: number, updates: Partial<MEDDPICCOption>) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onUpdate({ options: newOptions });
  };

  const deleteOption = (index: number) => {
    onUpdate({
      options: question.options.filter((_, i) => i !== index)
    });
  };

  if (!isEditing) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium mb-2">{question.text}</div>
              <div className="text-sm text-muted-foreground">
                {question.options.length} options • Type: {question.type}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium">Edit Question</h5>
          <Button size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Question Text</Label>
            <Textarea
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={question.type}
                onValueChange={(value: any) => onUpdate({ type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single-select">Single Select</SelectItem>
                  <SelectItem value="multi-select">Multi Select</SelectItem>
                  <SelectItem value="likert">Likert Scale</SelectItem>
                  <SelectItem value="boolean">Yes/No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tooltip (optional)</Label>
              <Input
                value={question.tooltip || ''}
                onChange={(e) => onUpdate({ tooltip: e.target.value })}
                placeholder="Helpful hint..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button size="sm" variant="outline" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option.label}
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    placeholder="Option label"
                    className="flex-1"
                  />
                  <Input
                    value={option.value}
                    onChange={(e) => updateOption(index, { value: e.target.value })}
                    placeholder="Value"
                    className="w-24"
                  />
                  <Input
                    type="number"
                    value={option.score}
                    onChange={(e) => updateOption(index, { score: parseInt(e.target.value) || 0 })}
                    placeholder="Score"
                    className="w-20"
                  />
                  <Button size="sm" variant="outline" onClick={() => deleteOption(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Scoring Editor Component
function ScoringEditor({ 
  scoring, 
  onUpdate 
}: { 
  scoring: any; 
  onUpdate: (scoring: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring Configuration</CardTitle>
        <CardDescription>
          Configure scoring thresholds and deal health levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Maximum Total Score</Label>
          <Input
            type="number"
            value={scoring.max_score}
            onChange={(e) => onUpdate({ ...scoring, max_score: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Threshold Levels</h4>
          
          {/* Strong Threshold */}
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <h5 className="font-medium">Strong</h5>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Score</Label>
                <Input
                  type="number"
                  value={scoring.thresholds.strong.min}
                  onChange={(e) => onUpdate({
                    ...scoring,
                    thresholds: {
                      ...scoring.thresholds,
                      strong: { ...scoring.thresholds.strong, min: parseInt(e.target.value) }
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={scoring.thresholds.strong.description}
                  onChange={(e) => onUpdate({
                    ...scoring,
                    thresholds: {
                      ...scoring.thresholds,
                      strong: { ...scoring.thresholds.strong, description: e.target.value }
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Moderate Threshold */}
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <h5 className="font-medium">Moderate</h5>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Minimum Score</Label>
                <Input
                  type="number"
                  value={scoring.thresholds.moderate.min}
                  onChange={(e) => onUpdate({
                    ...scoring,
                    thresholds: {
                      ...scoring.thresholds,
                      moderate: { ...scoring.thresholds.moderate, min: parseInt(e.target.value) }
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Score</Label>
                <Input
                  type="number"
                  value={scoring.thresholds.moderate.max}
                  onChange={(e) => onUpdate({
                    ...scoring,
                    thresholds: {
                      ...scoring.thresholds,
                      moderate: { ...scoring.thresholds.moderate, max: parseInt(e.target.value) }
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={scoring.thresholds.moderate.description}
                  onChange={(e) => onUpdate({
                    ...scoring,
                    thresholds: {
                      ...scoring.thresholds,
                      moderate: { ...scoring.thresholds.moderate, description: e.target.value }
                    }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Weak Threshold */}
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <h5 className="font-medium">Weak</h5>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Maximum Score</Label>
                <Input
                  type="number"
                  value={scoring.thresholds.weak.max}
                  onChange={(e) => onUpdate({
                    ...scoring,
                    thresholds: {
                      ...scoring.thresholds,
                      weak: { ...scoring.thresholds.weak, max: parseInt(e.target.value) }
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={scoring.thresholds.weak.description}
                  onChange={(e) => onUpdate({
                    ...scoring,
                    thresholds: {
                      ...scoring.thresholds,
                      weak: { ...scoring.thresholds.weak, description: e.target.value }
                    }
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Coaching Prompts Editor Component
function CoachingPromptsEditor({ 
  prompts, 
  pillars, 
  onUpdate 
}: { 
  prompts: CoachingPrompt[]; 
  pillars: MEDDPICCPillar[];
  onUpdate: (prompts: CoachingPrompt[]) => void;
}) {
  const addPrompt = () => {
    const newPrompt: CoachingPrompt = {
      id: `prompt_${Date.now()}`,
      pillar: pillars[0]?.id || '',
      condition: { pillar: pillars[0]?.id || '', value: 'no' },
      prompt: 'New coaching prompt',
      priority: 'medium',
      action_items: []
    };
    onUpdate([...prompts, newPrompt]);
  };

  const updatePrompt = (index: number, updates: Partial<CoachingPrompt>) => {
    const newPrompts = [...prompts];
    newPrompts[index] = { ...newPrompts[index], ...updates };
    onUpdate(newPrompts);
  };

  const deletePrompt = (index: number) => {
    onUpdate(prompts.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Coaching Prompts
          <Button onClick={addPrompt}>
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </Button>
        </CardTitle>
        <CardDescription>
          Configure automated coaching recommendations based on assessment gaps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prompts.map((prompt, index) => (
            <div key={prompt.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={prompt.priority === 'high' ? 'destructive' : prompt.priority === 'medium' ? 'default' : 'secondary'}>
                  {prompt.priority.toUpperCase()}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => deletePrompt(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pillar</Label>
                  <Select
                    value={prompt.pillar}
                    onValueChange={(value) => updatePrompt(index, { 
                      pillar: value,
                      condition: { ...prompt.condition, pillar: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pillars.map((pillar) => (
                        <SelectItem key={pillar.id} value={pillar.id}>
                          {pillar.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={prompt.priority}
                    onValueChange={(value: any) => updatePrompt(index, { priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prompt Text</Label>
                <Textarea
                  value={prompt.prompt}
                  onChange={(e) => updatePrompt(index, { prompt: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Action Items (one per line)</Label>
                <Textarea
                  value={prompt.action_items?.join('\n') || ''}
                  onChange={(e) => updatePrompt(index, { 
                    action_items: e.target.value.split('\n').filter(item => item.trim()) 
                  })}
                  rows={3}
                  placeholder="• Action item 1&#10;• Action item 2&#10;• Action item 3"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Global Settings Editor Component
function GlobalSettingsEditor({ 
  config, 
  onUpdate 
}: { 
  config: MEDDPICCConfiguration; 
  onUpdate: (config: MEDDPICCConfiguration) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Settings</CardTitle>
        <CardDescription>
          General configuration and metadata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Configuration Version</Label>
            <Input
              value={config.version}
              onChange={(e) => onUpdate({ ...config, version: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Updated</Label>
            <Input
              type="datetime-local"
              value={config.last_updated.toISOString().slice(0, 16)}
              onChange={(e) => onUpdate({ ...config, last_updated: new Date(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Configuration Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{config.pillars.length}</div>
              <div className="text-sm text-muted-foreground">Total Pillars</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {config.pillars.reduce((sum, pillar) => sum + pillar.questions.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{config.coaching_prompts.length}</div>
              <div className="text-sm text-muted-foreground">Coaching Prompts</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}