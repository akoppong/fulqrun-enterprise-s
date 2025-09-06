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
import { Opportunity, PEAK_STAGES } from '@/lib/types';
import { getMEDDPICCScore } from '@/lib/crm-utils';
import { Target, TrendUp } from '@phosphor-icons/react';

interface OpportunityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
}

export function OpportunityDialog({ isOpen, onClose, onSave, opportunity }: OpportunityDialogProps) {
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    title: '',
    description: '',
    value: 0,
    stage: 'prospect',
    probability: 25,
    expectedCloseDate: new Date(),
    meddpicc: {
      metrics: '',
      economicBuyer: '',
      decisionCriteria: '',
      decisionProcess: '',
      paperProcess: '',
      'implicate Pain': '',
      champion: '',
      score: 0
    }
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        ...opportunity,
        expectedCloseDate: new Date(opportunity.expectedCloseDate)
      });
    } else {
      setFormData({
        title: '',
        description: '',
        value: 0,
        stage: 'prospect',
        probability: 25,
        expectedCloseDate: new Date(),
        meddpicc: {
          metrics: '',
          economicBuyer: '',
          decisionCriteria: '',
          decisionProcess: '',
          paperProcess: '',
          'implicate Pain': '',
          champion: '',
          score: 0
        }
      });
    }
  }, [opportunity, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const meddpicScore = getMEDDPICCScore(formData.meddpicc);
    onSave({
      ...formData,
      meddpicc: {
        ...formData.meddpicc!,
        score: meddpicScore
      }
    });
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

  const currentScore = getMEDDPICCScore(formData.meddpicc);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target size={24} className="text-primary" />
            {opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="meddpicc" className="flex items-center gap-2">
                MEDDPICC Qualification
                <Badge variant={currentScore >= 70 ? 'default' : currentScore >= 40 ? 'secondary' : 'destructive'}>
                  {currentScore}%
                </Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Opportunity Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
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
                          {stage.label} - {stage.description}
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
            
            <TabsContent value="meddpicc" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendUp size={20} />
                    MEDDPICC Qualification Score
                  </CardTitle>
                  <CardDescription>
                    Complete each section to improve your qualification score
                  </CardDescription>
                  <div className="flex items-center gap-4">
                    <Progress value={currentScore} className="flex-1" />
                    <Badge variant={currentScore >= 70 ? 'default' : currentScore >= 40 ? 'secondary' : 'destructive'}>
                      {currentScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metrics">Metrics</Label>
                    <Textarea
                      id="metrics"
                      placeholder="What economic impact can we measure?"
                      value={formData.meddpicc?.metrics || ''}
                      onChange={(e) => updateMEDDPICCField('metrics', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="economicBuyer">Economic Buyer</Label>
                    <Textarea
                      id="economicBuyer"
                      placeholder="Who has the economic authority to buy?"
                      value={formData.meddpicc?.economicBuyer || ''}
                      onChange={(e) => updateMEDDPICCField('economicBuyer', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="decisionCriteria">Decision Criteria</Label>
                    <Textarea
                      id="decisionCriteria"
                      placeholder="What criteria will they use to decide?"
                      value={formData.meddpicc?.decisionCriteria || ''}
                      onChange={(e) => updateMEDDPICCField('decisionCriteria', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="decisionProcess">Decision Process</Label>
                    <Textarea
                      id="decisionProcess"
                      placeholder="How will they make the decision?"
                      value={formData.meddpicc?.decisionProcess || ''}
                      onChange={(e) => updateMEDDPICCField('decisionProcess', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paperProcess">Paper Process</Label>
                    <Textarea
                      id="paperProcess"
                      placeholder="What's the approval/procurement process?"
                      value={formData.meddpicc?.paperProcess || ''}
                      onChange={(e) => updateMEDDPICCField('paperProcess', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="implicatePain">Implicate Pain</Label>
                    <Textarea
                      id="implicatePain"
                      placeholder="What pain are we addressing?"
                      value={formData.meddpicc?.['implicate Pain'] || ''}
                      onChange={(e) => updateMEDDPICCField('implicate Pain', e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="champion">Champion</Label>
                    <Textarea
                      id="champion"
                      placeholder="Who is actively selling for us internally?"
                      value={formData.meddpicc?.champion || ''}
                      onChange={(e) => updateMEDDPICCField('champion', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {opportunity ? 'Update Opportunity' : 'Create Opportunity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}