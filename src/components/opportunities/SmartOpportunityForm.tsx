import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Users, DollarSign, Calendar, Target, Star, AlertCircle, CheckCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import SmartCompanyContactManager from './SmartCompanyContactManager';
import { Opportunity } from '@/lib/types';

interface Company {
  id: string;
  name: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  status: 'prospect' | 'customer' | 'partner' | 'inactive';
  tier: 'strategic' | 'growth' | 'transactional';
  metrics: {
    totalRevenue: number;
    openOpportunities: number;
    wonOpportunities: number;
    engagementScore: number;
  };
  tags: string[];
}

interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department: string;
  role: 'decision-maker' | 'influencer' | 'champion' | 'gatekeeper' | 'end-user';
  seniority: 'junior' | 'mid' | 'senior' | 'executive' | 'c-level';
  metrics: {
    responseRate: number;
    engagementScore: number;
    influenceLevel: number;
    opportunitiesInvolved: number;
  };
}

interface OpportunityFormData {
  title: string;
  companyId: string;
  primaryContactId: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  source: string;
  competitors: string[];
}

interface SmartOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: Partial<Opportunity>) => void;
  preSelectedCompany?: Company;
  preSelectedContact?: Contact;
}

const SmartOpportunityForm: React.FC<SmartOpportunityFormProps> = ({
  isOpen,
  onClose,
  onSave,
  preSelectedCompany,
  preSelectedContact
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: '',
    companyId: '',
    primaryContactId: '',
    value: 0,
    currency: 'USD',
    stage: 'prospect',
    probability: 50,
    expectedCloseDate: '',
    description: '',
    priority: 'medium',
    tags: [],
    source: '',
    competitors: []
  });

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(preSelectedCompany || null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(preSelectedContact || null);
  const [showCompanyContactSelector, setShowCompanyContactSelector] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form with pre-selected data
  useEffect(() => {
    if (preSelectedCompany) {
      setSelectedCompany(preSelectedCompany);
      setFormData(prev => ({
        ...prev,
        companyId: preSelectedCompany.id,
        title: `${preSelectedCompany.name} - New Opportunity`
      }));
    }
    if (preSelectedContact) {
      setSelectedContact(preSelectedContact);
      setFormData(prev => ({
        ...prev,
        primaryContactId: preSelectedContact.id
      }));
    }
  }, [preSelectedCompany, preSelectedContact]);

  // Smart recommendations based on selections
  const getRecommendations = useCallback(() => {
    const recommendations: any = {};

    if (selectedCompany) {
      // Recommend deal size based on company tier and size
      if (selectedCompany.tier === 'strategic' && selectedCompany.size === 'enterprise') {
        recommendations.value = 500000;
      } else if (selectedCompany.tier === 'growth' && selectedCompany.size === 'large') {
        recommendations.value = 150000;
      } else if (selectedCompany.size === 'medium') {
        recommendations.value = 75000;
      } else {
        recommendations.value = 25000;
      }

      // Recommend probability based on company status and engagement
      if (selectedCompany.status === 'customer') {
        recommendations.probability = 75;
      } else if (selectedCompany.metrics.engagementScore > 80) {
        recommendations.probability = 65;
      } else {
        recommendations.probability = 45;
      }

      // Recommend close date based on company size and tier
      const daysToClose = selectedCompany.size === 'enterprise' ? 90 : 
                         selectedCompany.size === 'large' ? 60 : 30;
      const closeDate = new Date();
      closeDate.setDate(closeDate.getDate() + daysToClose);
      recommendations.expectedCloseDate = closeDate.toISOString().split('T')[0];

      // Recommend priority based on engagement and tier
      if (selectedCompany.tier === 'strategic' && selectedCompany.metrics.engagementScore > 85) {
        recommendations.priority = 'critical';
      } else if (selectedCompany.metrics.engagementScore > 75) {
        recommendations.priority = 'high';
      } else {
        recommendations.priority = 'medium';
      }
    }

    if (selectedContact) {
      // Adjust probability based on contact role and influence
      if (selectedContact.role === 'decision-maker' && selectedContact.metrics.influenceLevel > 90) {
        recommendations.probability = Math.min((recommendations.probability || 50) + 20, 95);
      } else if (selectedContact.role === 'champion') {
        recommendations.probability = Math.min((recommendations.probability || 50) + 15, 90);
      }
    }

    return recommendations;
  }, [selectedCompany, selectedContact]);

  const applyRecommendations = () => {
    const recommendations = getRecommendations();
    setFormData(prev => ({
      ...prev,
      ...recommendations
    }));
    toast.success('Smart recommendations applied!');
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      companyId: company.id,
      title: prev.title || `${company.name} - New Opportunity`
    }));
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData(prev => ({
      ...prev,
      primaryContactId: contact.id
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Opportunity title is required';
    }
    if (!formData.companyId) {
      errors.companyId = 'Company selection is required';
    }
    if (!formData.primaryContactId) {
      errors.primaryContactId = 'Primary contact is required';
    }
    if (formData.value <= 0) {
      errors.value = 'Opportunity value must be greater than 0';
    }
    if (!formData.expectedCloseDate) {
      errors.expectedCloseDate = 'Expected close date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    const opportunity: Partial<Opportunity> = {
      title: formData.title,
      companyId: formData.companyId,
      primaryContactId: formData.primaryContactId,
      value: formData.value,
      stage: formData.stage,
      probability: formData.probability,
      expectedCloseDate: new Date(formData.expectedCloseDate),
      description: formData.description,
      priority: formData.priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: formData.tags,
      meddpicc: {
        metrics: 0,
        economicBuyer: 0,
        decisionCriteria: 0,
        decisionProcess: 0,
        identifyPain: 0,
        champion: selectedContact?.role === 'champion' ? 80 : 0,
        competition: 0,
        paperProcess: 0,
        score: 0,
        lastUpdated: new Date()
      }
    };

    onSave(opportunity);
    onClose();
    toast.success('Opportunity created successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Select Company & Contact</h3>
              <p className="text-sm text-muted-foreground">
                Choose the company and primary contact for this opportunity
              </p>
            </div>

            {/* Current Selections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCompany ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Selected Company
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="font-medium">{selectedCompany.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedCompany.industry} • {selectedCompany.size}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary">{selectedCompany.status}</Badge>
                        <Badge variant="outline">{selectedCompany.tier}</Badge>
                      </div>
                      <div className="text-sm">
                        Engagement: {selectedCompany.metrics.engagementScore}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No company selected</div>
                  </CardContent>
                </Card>
              )}

              {selectedContact ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Selected Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="font-medium">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedContact.jobTitle}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="secondary">{selectedContact.role}</Badge>
                        <Badge variant="outline">{selectedContact.seniority}</Badge>
                      </div>
                      <div className="text-sm">
                        Influence: {selectedContact.metrics.influenceLevel}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No contact selected</div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowCompanyContactSelector(true)}
            >
              <Building2 className="w-4 h-4 mr-2" />
              {selectedCompany || selectedContact ? 'Change Selection' : 'Select Company & Contact'}
            </Button>

            {/* Smart Recommendations */}
            {(selectedCompany || selectedContact) && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    Smart Recommendations Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    {selectedCompany && (
                      <>
                        <div>Recommended value: ${getRecommendations().value?.toLocaleString()}</div>
                        <div>Suggested probability: {getRecommendations().probability}%</div>
                        <div>Recommended priority: {getRecommendations().priority}</div>
                      </>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={applyRecommendations}
                  >
                    Apply Recommendations
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <DollarSign className="w-8 h-8 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Opportunity Details</h3>
              <p className="text-sm text-muted-foreground">
                Define the opportunity specifics and expected outcomes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Opportunity Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter opportunity title"
                    className={validationErrors.title ? 'border-red-500' : ''}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500">{validationErrors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value *</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      className={validationErrors.value ? 'border-red-500' : ''}
                    />
                    {validationErrors.value && (
                      <p className="text-sm text-red-500">{validationErrors.value}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, currency: value }))
                    }>
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={formData.stage} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, stage: value }))
                  }>
                    <SelectTrigger id="stage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="qualify">Qualify</SelectItem>
                      <SelectItem value="propose">Propose</SelectItem>
                      <SelectItem value="negotiate">Negotiate</SelectItem>
                      <SelectItem value="closed-won">Closed Won</SelectItem>
                      <SelectItem value="closed-lost">Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="probability">Win Probability (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate">Expected Close Date *</Label>
                  <Input
                    id="expectedCloseDate"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                    className={validationErrors.expectedCloseDate ? 'border-red-500' : ''}
                  />
                  {validationErrors.expectedCloseDate && (
                    <p className="text-sm text-red-500">{validationErrors.expectedCloseDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, priority: value as any }))
                  }>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Lead Source</Label>
                  <Select value={formData.source} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, source: value }))
                  }>
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                      <SelectItem value="trade-show">Trade Show</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="marketing">Marketing Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the opportunity, customer needs, and expected outcomes..."
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
              <h3 className="text-lg font-semibold">Review & Create</h3>
              <p className="text-sm text-muted-foreground">
                Review all details before creating the opportunity
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Opportunity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {formData.title}
                    </div>
                    <div>
                      <span className="font-medium">Value:</span> {formData.currency} ${formData.value.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Stage:</span> {formData.stage}
                    </div>
                    <div>
                      <span className="font-medium">Probability:</span> {formData.probability}%
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span> {formData.priority}
                    </div>
                    <div>
                      <span className="font-medium">Close Date:</span> {formData.expectedCloseDate}
                    </div>
                  </div>
                  {formData.description && (
                    <div className="text-sm">
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-muted-foreground">{formData.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCompany && (
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">{selectedCompany.name}</div>
                        <div>{selectedCompany.industry} • {selectedCompany.size}</div>
                        <div className="flex gap-1">
                          <Badge variant="secondary">{selectedCompany.status}</Badge>
                          <Badge variant="outline">{selectedCompany.tier}</Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Primary Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedContact && (
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">
                          {selectedContact.firstName} {selectedContact.lastName}
                        </div>
                        <div>{selectedContact.jobTitle}</div>
                        <div>{selectedContact.email}</div>
                        <Badge variant="secondary">{selectedContact.role}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] opportunity-edit-form-dialog">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
            <DialogDescription>
              Step {currentStep} of 3: Use smart recommendations and company-contact relationships
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-green-600' : 'bg-muted'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <ScrollArea className="max-h-[60vh]">
            {renderStepContent()}
          </ScrollArea>

          {/* Form Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  onClose();
                }
              }}
            >
              {currentStep > 1 ? 'Previous' : 'Cancel'}
            </Button>
            
            <div className="flex gap-2">
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === 1 && (!selectedCompany || !selectedContact)}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSave}>
                  Create Opportunity
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Company-Contact Selector Dialog */}
      <Dialog open={showCompanyContactSelector} onOpenChange={setShowCompanyContactSelector}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Select Company & Contact</DialogTitle>
            <DialogDescription>
              Choose the company and primary contact for this opportunity
            </DialogDescription>
          </DialogHeader>
          <div className="h-[70vh]">
            <SmartCompanyContactManager
              selectedCompanyId={selectedCompany?.id}
              selectedContactId={selectedContact?.id}
              onCompanySelect={handleCompanySelect}
              onContactSelect={handleContactSelect}
              filterByOpportunity={true}
              showMetrics={true}
              allowCreation={false}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCompanyContactSelector(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setShowCompanyContactSelector(false)}
              disabled={!selectedCompany || !selectedContact}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartOpportunityForm;