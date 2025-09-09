import React, { useState } from 'react';
import { usePipelineConfigurations } from '@/hooks/usePipelineConfigurations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MEDDPICC } from '@/lib/types';
import { Plus, Building, DollarSign, Calendar, User } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface OpportunityCreatorProps {
  onOpportunityCreated?: () => void;
}

export function OpportunityCreator({ onOpportunityCreated }: OpportunityCreatorProps) {
  const { allPipelines, activePipeline, createOpportunity } = usePipelineConfigurations();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState(activePipeline.id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    expectedCloseDate: '',
    companyId: '',
    contactId: '',
    ownerId: 'current-user'
  });

  const selectedPipeline = allPipelines.find(p => p.id === selectedPipelineId) || activePipeline;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.value) {
      toast.error('Please fill in required fields');
      return;
    }

    const defaultMEDDPICC: MEDDPICC = {
      metrics: '',
      economicBuyer: '',
      decisionCriteria: '',
      decisionProcess: '',
      paperProcess: '',
      implicatePain: '',
      champion: '',
      score: 0
    };

    const opportunity = {
      title: formData.title,
      description: formData.description,
      value: parseFloat(formData.value) || 0,
      expectedCloseDate: formData.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      companyId: formData.companyId || `company-${Date.now()}`,
      contactId: formData.contactId || `contact-${Date.now()}`,
      ownerId: formData.ownerId,
      meddpicc: defaultMEDDPICC,
      probability: selectedPipeline.stages[0]?.probability || 10
    };

    createOpportunity(opportunity, selectedPipelineId);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      value: '',
      expectedCloseDate: '',
      companyId: '',
      contactId: '',
      ownerId: 'current-user'
    });
    
    setIsOpen(false);
    onOpportunityCreated?.();
  };

  const generateSampleData = () => {
    const sampleTitles = [
      'Enterprise Software License',
      'Cloud Migration Project',
      'SaaS Subscription - Annual',
      'Professional Services Contract',
      'Hardware Procurement Deal',
      'Digital Transformation Initiative',
      'Customer Success Platform',
      'E-commerce Integration',
      'Marketing Automation Suite',
      'Security Audit Services'
    ];
    
    const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    const randomValue = Math.floor(Math.random() * 500000) + 10000;
    const randomDays = Math.floor(Math.random() * 90) + 30;
    const closeDate = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);

    setFormData(prev => ({
      ...prev,
      title: randomTitle,
      description: `Potential ${randomTitle.toLowerCase()} opportunity with high strategic value`,
      value: randomValue.toString(),
      expectedCloseDate: closeDate.toISOString().split('T')[0]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Create Demo Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Opportunity</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="pipeline">Pipeline Configuration</Label>
              <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allPipelines.map((pipeline) => (
                    <SelectItem key={pipeline.id} value={pipeline.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{pipeline.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {pipeline.stages.length} stages
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPipeline && (
                <p className="text-sm text-muted-foreground mt-1">
                  Will start in: <Badge variant="secondary" className={selectedPipeline.stages[0]?.color}>
                    {selectedPipeline.stages[0]?.name}
                  </Badge>
                </p>
              )}
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Opportunity Title *</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={generateSampleData}
                >
                  Generate Sample
                </Button>
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter opportunity title"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the opportunity"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="value">Deal Value * ($)</Label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="0"
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="closeDate">Expected Close Date</Label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="closeDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company">Company ID</Label>
              <div className="relative">
                <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company"
                  value={formData.companyId}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                  placeholder="Auto-generated if empty"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact">Contact ID</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="contact"
                  value={formData.contactId}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                  placeholder="Auto-generated if empty"
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Opportunity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}