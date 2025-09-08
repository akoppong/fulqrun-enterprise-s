import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Opportunity, PEAK_STAGES, Company, Contact, MEDDPICC } from '@/lib/types';
import { getMEDDPICCScore } from '@/lib/crm-utils';
import { AIService } from '@/lib/ai-service';
import { EnhancedMEDDPICCDialog } from './EnhancedMEDDPICCDialog';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { Target, TrendUp, Brain, Lightbulb } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface OpportunityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
}

export function OpportunityDialog({ isOpen, onClose, onSave, opportunity }: OpportunityDialogProps) {
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);
  const [meddpicDialog, setMeddpicDialog] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    title: '',
    description: '',
    value: 0,
    stage: 'prospect',
    probability: 25,
    expectedCloseDate: new Date(),
    companyId: '',
    contactId: '',
    meddpicc: {
      metrics: '',
      economicBuyer: '',
      decisionCriteria: '',
      decisionProcess: '',
      paperProcess: '',
      implicatePain: '',
      champion: '',
      score: 0
    }
  });

  // Auto-save functionality
  const autoSave = useAutoSave({
    key: opportunity?.id ? `opportunity_${opportunity.id}` : 'opportunity_new',
    data: formData,
    enabled: isOpen,
    excludeFields: ['expectedCloseDate'], // Exclude date object from auto-save
    onSave: () => {
      setHasUnsavedChanges(false);
    },
    onLoad: (savedData) => {
      if (savedData && !opportunity) {
        // Only auto-load for new opportunities, not when editing existing ones
        setFormData({
          ...savedData,
          expectedCloseDate: savedData.expectedCloseDate ? new Date(savedData.expectedCloseDate) : new Date()
        });
        toast.info('Draft restored from auto-save');
      }
    }
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        ...opportunity,
        expectedCloseDate: new Date(opportunity.expectedCloseDate)
      });
      setHasUnsavedChanges(false);
    } else {
      // Check for auto-saved draft for new opportunities
      if (autoSave.hasDraft && !formData.title) {
        // Draft will be loaded via autoSave.onLoad callback
      } else {
        setFormData({
          title: '',
          description: '',
          value: 0,
          stage: 'prospect',
          probability: 25,
          expectedCloseDate: new Date(),
          companyId: '',
          contactId: '',
          meddpicc: {
            metrics: '',
            economicBuyer: '',
            decisionCriteria: '',
            decisionProcess: '',
            paperProcess: '',
            implicatePain: '',
            champion: '',
            score: 0
          }
        });
      }
      setHasUnsavedChanges(false);
    }
  }, [opportunity, isOpen]);

  // Track changes to enable unsaved changes indicator
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  // Show draft restoration dialog for new opportunities
  useEffect(() => {
    if (isOpen && !opportunity && autoSave.hasDraft) {
      setTimeout(() => {
        const shouldRestore = window.confirm(
          'A saved draft was found. Would you like to restore it and continue where you left off?'
        );
        
        if (shouldRestore && autoSave.savedDraft) {
          setFormData({
            ...autoSave.savedDraft,
            expectedCloseDate: autoSave.savedDraft.expectedCloseDate 
              ? new Date(autoSave.savedDraft.expectedCloseDate) 
              : new Date()
          });
          toast.success('Draft restored successfully');
        }
      }, 100);
    }
  }, [isOpen, opportunity, autoSave.hasDraft, autoSave.savedDraft]);

  const generateAIInsights = async () => {
    if (!formData.companyId || !formData.contactId) {
      toast.error('Please select a company and contact first');
      return;
    }

    setGeneratingInsights(true);
    try {
      const company = companies.find(c => c.id === formData.companyId);
      const contact = contacts.find(c => c.id === formData.contactId);
      
      if (company && contact && formData.meddpicc) {
        const fullOpportunity = formData as Opportunity;
        const insights = await AIService.analyzeOpportunity(fullOpportunity, contact, company);
        setAiInsights(insights);
        toast.success('AI insights generated successfully');
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const meddpicScore = getMEDDPICCScore(formData.meddpicc);
    
    // Add AI insights and next best actions
    const nextBestActions = AIService.getNextBestActions(formData as Opportunity);
    
    onSave({
      ...formData,
      meddpicc: {
        ...formData.meddpicc!,
        score: meddpicScore
      },
      aiInsights: aiInsights || {
        riskScore: 50,
        nextBestActions,
        confidenceLevel: 'medium' as const,
        lastAiUpdate: new Date()
      }
    });

    // Clear the draft after successful save
    autoSave.clearDraft();
    setHasUnsavedChanges(false);
  };

  const handleClose = () => {
    if (hasUnsavedChanges && (formData.title || formData.description)) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to close? Your changes will be auto-saved as a draft.'
      );
      if (!shouldDiscard) return;
    }
    onClose();
  };

  const updateMEDDPICCField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      meddpicc: {
        ...prev.meddpicc!,
        [field]: value
      }
    }));
  };

  const handleEnhancedMEDDPICC = (updatedMeddpicc: MEDDPICC) => {
    setFormData(prev => ({
      ...prev,
      meddpicc: updatedMeddpicc
    }));
  };

  const currentScore = getMEDDPICCScore(formData.meddpicc);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Target size={24} className="text-primary" />
                {opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
              </DialogTitle>
              
              {/* Auto-save indicator */}
              <AutoSaveIndicator
                enabled={isOpen}
                lastSaved={autoSave.lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
                onSaveNow={autoSave.saveNow}
                onClearDraft={autoSave.clearDraft}
                hasDraft={autoSave.hasDraft && !opportunity}
                className="text-sm"
              />
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="meddpicc" className="flex items-center gap-2">
                  MEDDPICC
                  <Badge variant={currentScore >= 70 ? 'default' : currentScore >= 40 ? 'secondary' : 'destructive'}>
                    {currentScore}%
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="ai-insights" className="flex items-center gap-2">
                  <Brain size={16} />
                  AI Insights
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Opportunity Title</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter opportunity title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Deal Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Select 
                      value={formData.companyId || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value }))}
                    >
                      <SelectTrigger id="company">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name} ({company.industry})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Primary Contact</Label>
                    <Select 
                      value={formData.contactId || ''} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, contactId: value }))}
                    >
                      <SelectTrigger id="contact">
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts
                          .filter(contact => !formData.companyId || contact.companyId === formData.companyId)
                          .map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.firstName} {contact.lastName} ({contact.title})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter opportunity description"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="stage">PEAK Stage</Label>
                    <Select 
                      value={formData.stage || 'prospect'} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value as any }))}
                    >
                      <SelectTrigger id="stage">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PEAK_STAGES.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{stage.label}</span>
                              <span className="text-xs text-muted-foreground">{stage.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="probability">Win Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability || 25}
                      onChange={(e) => setFormData(prev => ({ ...prev, probability: Number(e.target.value) }))}
                      placeholder="25"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="closeDate">Expected Close Date</Label>
                    <Input
                      id="closeDate"
                      type="date"
                      value={formData.expectedCloseDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        expectedCloseDate: new Date(e.target.value) 
                      }))}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="meddpicc" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendUp size={20} />
                        MEDDPICC Qualification Score
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => setMeddpicDialog(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        Enhanced MEDDPICC
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Complete each section to improve your qualification score
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-4">
                      <Progress value={currentScore} className="flex-1" />
                      <Badge variant={currentScore >= 70 ? 'default' : currentScore >= 40 ? 'secondary' : 'destructive'}>
                        {currentScore}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="metrics">Metrics</Label>
                      <Textarea
                        id="metrics"
                        placeholder="What economic impact can we measure?"
                        value={formData.meddpicc?.metrics || ''}
                        onChange={(e) => updateMEDDPICCField('metrics', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="economicBuyer">Economic Buyer</Label>
                      <Textarea
                        id="economicBuyer"
                        placeholder="Who has the economic authority to buy?"
                        value={formData.meddpicc?.economicBuyer || ''}
                        onChange={(e) => updateMEDDPICCField('economicBuyer', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="decisionCriteria">Decision Criteria</Label>
                      <Textarea
                        id="decisionCriteria"
                        placeholder="What criteria will they use to decide?"
                        value={formData.meddpicc?.decisionCriteria || ''}
                        onChange={(e) => updateMEDDPICCField('decisionCriteria', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="decisionProcess">Decision Process</Label>
                      <Textarea
                        id="decisionProcess"
                        placeholder="How will they make the decision?"
                        value={formData.meddpicc?.decisionProcess || ''}
                        onChange={(e) => updateMEDDPICCField('decisionProcess', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="paperProcess">Paper Process</Label>
                      <Textarea
                        id="paperProcess"
                        placeholder="What's the approval/procurement process?"
                        value={formData.meddpicc?.paperProcess || ''}
                        onChange={(e) => updateMEDDPICCField('paperProcess', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="implicatePain">Implicate Pain</Label>
                      <Textarea
                        id="implicatePain"
                        placeholder="What pain are we addressing?"
                        value={formData.meddpicc?.implicatePain || ''}
                        onChange={(e) => updateMEDDPICCField('implicatePain', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="champion">Champion</Label>
                      <Textarea
                        id="champion"
                        placeholder="Who is actively selling for us internally?"
                        value={formData.meddpicc?.champion || ''}
                        onChange={(e) => updateMEDDPICCField('champion', e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Brain size={20} />
                        AI-Powered Insights
                      </div>
                      <Button 
                        type="button" 
                        onClick={generateAIInsights}
                        disabled={generatingInsights}
                        size="sm"
                      >
                        <Lightbulb className="mr-2 h-4 w-4" />
                        {generatingInsights ? 'Generating...' : 'Generate Insights'}
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Get AI recommendations and risk analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiInsights ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Risk Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className={`text-2xl font-bold ${
                                aiInsights.riskScore > 70 ? 'text-red-600' : 
                                aiInsights.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {aiInsights.riskScore}%
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Confidence Level</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Badge 
                                variant={
                                  aiInsights.confidenceLevel === 'high' ? 'default' :
                                  aiInsights.confidenceLevel === 'medium' ? 'secondary' : 'outline'
                                }
                              >
                                {aiInsights.confidenceLevel}
                              </Badge>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Last Updated</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-muted-foreground">
                                {aiInsights.lastAiUpdate ? new Date(aiInsights.lastAiUpdate).toLocaleDateString() : 'Never'}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3">Next Best Actions</h4>
                          <div className="space-y-3">
                            {Array.isArray(aiInsights.nextBestActions) ? aiInsights.nextBestActions.map((action: string, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </div>
                                <span className="text-sm leading-relaxed">{action}</span>
                              </div>
                            )) : aiInsights.nextBestActions ? (
                              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                  1
                                </div>
                                <span className="text-sm leading-relaxed">{aiInsights.nextBestActions}</span>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">No actions available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Generate AI insights to get recommendations and risk analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {opportunity ? 'Update Opportunity' : 'Create Opportunity'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enhanced MEDDPICC Dialog */}
      {formData.companyId && formData.contactId && formData.meddpicc && (
        <EnhancedMEDDPICCDialog
          open={meddpicDialog}
          onOpenChange={setMeddpicDialog}
          opportunity={formData as Opportunity}
          company={companies.find(c => c.id === formData.companyId)!}
          onSave={handleEnhancedMEDDPICC}
        />
      )}
    </>
  );
}