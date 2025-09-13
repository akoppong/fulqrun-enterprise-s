import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  DollarSign,
  Calendar,
  Building,
  Users,
  Tag
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  category: 'validation' | 'interaction' | 'business-logic';
  steps: string[];
  expectedResult: string;
  tips: string[];
}

const DEMO_SCENARIOS: TestScenario[] = [
  {
    id: 'required-fields-demo',
    name: 'Required Fields Validation',
    description: 'Test how the form handles missing required information',
    category: 'validation',
    steps: [
      'Open the opportunity creation form',
      'Try to save without filling any fields',
      'Observe error messages and form progress',
      'Fill in required fields one by one',
      'Watch validation status change in real-time'
    ],
    expectedResult: 'Form shows specific error messages for each missing required field and prevents submission until all are filled',
    tips: [
      'Notice how the progress bar updates as you complete fields',
      'Error messages are field-specific and actionable',
      'The save button remains disabled until all errors are resolved'
    ]
  },
  {
    id: 'real-time-validation-demo',
    name: 'Real-time Validation',
    description: 'Experience immediate feedback as you type',
    category: 'validation',
    steps: [
      'Start typing in the opportunity title field',
      'Type less than 3 characters and observe warning',
      'Continue typing to see warning disappear',
      'Enter an invalid deal value (letters or negative)',
      'Watch validation change as you correct the value'
    ],
    expectedResult: 'Validation messages appear and disappear instantly as you type, providing immediate feedback',
    tips: [
      'Validation happens on every keystroke for immediate feedback',
      'Different validation rules have different severity levels',
      'Green checkmarks appear for valid fields'
    ]
  },
  {
    id: 'company-contact-sync-demo',
    name: 'Company-Contact Synchronization',
    description: 'See how contact selection adapts to company choice',
    category: 'interaction',
    steps: [
      'Select a company from the dropdown',
      'Notice how contact dropdown populates with relevant contacts',
      'Select a contact for that company',
      'Change to a different company',
      'Observe how contact selection clears automatically'
    ],
    expectedResult: 'Contact list dynamically updates based on selected company, maintaining data integrity',
    tips: [
      'Only contacts belonging to the selected company are shown',
      'If no contacts exist for a company, a helpful message appears',
      'Contact selection is automatically cleared when company changes'
    ]
  },
  {
    id: 'duplicate-detection-demo',
    name: 'Duplicate Opportunity Detection',
    description: 'Test detection of duplicate opportunity names',
    category: 'business-logic',
    steps: [
      'Select "TechCorp Solutions" as the company',
      'Enter "Enterprise Software License" as the title',
      'Fill in other required fields',
      'Observe the duplicate warning that appears',
      'Change the title to see warning disappear'
    ],
    expectedResult: 'Form detects existing opportunity with same title and company, shows warning but allows creation',
    tips: [
      'Duplicate detection is a warning, not an error',
      'You can still save if business justification exists',
      'Detection is case-insensitive for better accuracy'
    ]
  },
  {
    id: 'value-validation-demo',
    name: 'Deal Value Validation',
    description: 'Test numeric validation and business rules for deal values',
    category: 'validation',
    steps: [
      'Enter text in the deal value field',
      'Enter a negative number',
      'Enter zero',
      'Enter a very large number (over $10M)',
      'Enter a reasonable value and see validation clear'
    ],
    expectedResult: 'Form validates numeric input and provides warnings for unrealistic values',
    tips: [
      'Only numeric values are accepted',
      'Negative values and zero are rejected',
      'Very large values trigger warnings but don\'t prevent saving'
    ]
  },
  {
    id: 'date-validation-demo',
    name: 'Date Range Validation',
    description: 'Test validation of past and future dates',
    category: 'validation',
    steps: [
      'Select a past date for expected close date',
      'Observe the error message',
      'Select a date more than one year in future',
      'Notice the warning (allows save but shows caution)',
      'Select a reasonable future date to clear validation'
    ],
    expectedResult: 'Past dates are rejected, far future dates show warnings, reasonable dates are accepted',
    tips: [
      'Past dates are hard errors and prevent saving',
      'Dates over one year away show warnings',
      'Dates within one year are considered reasonable'
    ]
  },
  {
    id: 'progress-tracking-demo',
    name: 'Form Progress Tracking',
    description: 'Watch the form completion progress update dynamically',
    category: 'interaction',
    steps: [
      'Open the form and note the 0% progress',
      'Fill in the opportunity title and watch progress increase',
      'Complete other required fields and see progress jump',
      'Fill in optional fields for smaller progress increments',
      'Observe how different fields have different weights'
    ],
    expectedResult: 'Progress bar accurately reflects form completion with smart weighting for field importance',
    tips: [
      'Required fields contribute 70% of progress',
      'Optional fields contribute 30% of progress',
      'Progress updates in real-time as you type'
    ]
  },
  {
    id: 'tag-management-demo',
    name: 'Tag Management',
    description: 'Test dynamic tag addition and removal',
    category: 'interaction',
    steps: [
      'Scroll to the tags section',
      'Type a tag name and press Enter or click Add',
      'Add several tags to see them accumulate',
      'Try to add a duplicate tag (it will be prevented)',
      'Click the X on any tag to remove it'
    ],
    expectedResult: 'Tags can be added dynamically, duplicates are prevented, and tags can be removed easily',
    tips: [
      'Press Enter in the tag input to add quickly',
      'Duplicate tags are automatically prevented',
      'Tags are saved with the opportunity'
    ]
  },
  {
    id: 'unsaved-changes-demo',
    name: 'Unsaved Changes Warning',
    description: 'Test warning when trying to close form with unsaved data',
    category: 'interaction',
    steps: [
      'Fill in some form fields',
      'Try to close the form by clicking Cancel or the X',
      'Observe the confirmation dialog',
      'Choose to stay and continue editing',
      'Save the form or clear changes to close without warning'
    ],
    expectedResult: 'Form warns when closing with unsaved changes and allows user to decide',
    tips: [
      'Warning only appears when actual changes have been made',
      'You can choose to discard changes or continue editing',
      'No warning appears for a pristine form'
    ]
  }
];

export function EnhancedCreationDemoScenarios() {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());

  const markScenarioComplete = (scenarioId: string) => {
    setCompletedScenarios(prev => new Set([...prev, scenarioId]));
    toast.success('Scenario completed! ✅');
  };

  const getCategoryIcon = (category: TestScenario['category']) => {
    switch (category) {
      case 'validation': return <CheckCircle className="h-4 w-4" />;
      case 'interaction': return <Target className="h-4 w-4" />;
      case 'business-logic': return <DollarSign className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: TestScenario['category']) => {
    switch (category) {
      case 'validation': return 'text-green-600 border-green-200 bg-green-50';
      case 'interaction': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'business-logic': return 'text-purple-600 border-purple-200 bg-purple-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const validationScenarios = DEMO_SCENARIOS.filter(s => s.category === 'validation');
  const interactionScenarios = DEMO_SCENARIOS.filter(s => s.category === 'interaction');
  const businessLogicScenarios = DEMO_SCENARIOS.filter(s => s.category === 'business-logic');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Interactive Demo Scenarios</h2>
        <p className="text-muted-foreground mb-4">
          Follow these guided scenarios to explore all the enhanced form features
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="gap-2">
            <CheckCircle className="h-3 w-3" />
            {completedScenarios.size}/{DEMO_SCENARIOS.length} Completed
          </Badge>
        </div>
      </div>

      {/* Quick Start */}
      <Alert>
        <Play className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Start:</strong> Open the opportunity creation form first, then follow any scenario below. 
          Each scenario builds understanding of different form capabilities.
        </AlertDescription>
      </Alert>

      {/* Validation Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Validation & Error Handling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {validationScenarios.map((scenario) => (
              <div 
                key={scenario.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedScenario?.id === scenario.id ? 'border-blue-300 bg-blue-50' : ''
                } ${getCategoryColor(scenario.category)}`}
                onClick={() => setSelectedScenario(selectedScenario?.id === scenario.id ? null : scenario)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(scenario.category)}
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {scenario.name}
                        {completedScenarios.has(scenario.id) && (
                          <Badge variant="default" className="text-xs">Completed</Badge>
                        )}
                      </div>
                      <div className="text-sm opacity-80">{scenario.description}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      markScenarioComplete(scenario.id);
                    }}
                    disabled={completedScenarios.has(scenario.id)}
                  >
                    {completedScenarios.has(scenario.id) ? 'Completed' : 'Mark Done'}
                  </Button>
                </div>

                {selectedScenario?.id === scenario.id && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Steps to Follow:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {scenario.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Expected Result:</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{scenario.expectedResult}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tips:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {scenario.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            User Interaction & Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {interactionScenarios.map((scenario) => (
              <div 
                key={scenario.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedScenario?.id === scenario.id ? 'border-blue-300 bg-blue-50' : ''
                } ${getCategoryColor(scenario.category)}`}
                onClick={() => setSelectedScenario(selectedScenario?.id === scenario.id ? null : scenario)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(scenario.category)}
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {scenario.name}
                        {completedScenarios.has(scenario.id) && (
                          <Badge variant="default" className="text-xs">Completed</Badge>
                        )}
                      </div>
                      <div className="text-sm opacity-80">{scenario.description}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      markScenarioComplete(scenario.id);
                    }}
                    disabled={completedScenarios.has(scenario.id)}
                  >
                    {completedScenarios.has(scenario.id) ? 'Completed' : 'Mark Done'}
                  </Button>
                </div>

                {selectedScenario?.id === scenario.id && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Steps to Follow:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {scenario.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Expected Result:</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{scenario.expectedResult}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tips:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {scenario.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Logic Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            Business Logic & Data Integrity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {businessLogicScenarios.map((scenario) => (
              <div 
                key={scenario.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedScenario?.id === scenario.id ? 'border-blue-300 bg-blue-50' : ''
                } ${getCategoryColor(scenario.category)}`}
                onClick={() => setSelectedScenario(selectedScenario?.id === scenario.id ? null : scenario)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(scenario.category)}
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {scenario.name}
                        {completedScenarios.has(scenario.id) && (
                          <Badge variant="default" className="text-xs">Completed</Badge>
                        )}
                      </div>
                      <div className="text-sm opacity-80">{scenario.description}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      markScenarioComplete(scenario.id);
                    }}
                    disabled={completedScenarios.has(scenario.id)}
                  >
                    {completedScenarios.has(scenario.id) ? 'Completed' : 'Mark Done'}
                  </Button>
                </div>

                {selectedScenario?.id === scenario.id && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Steps to Follow:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {scenario.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Expected Result:</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded">{scenario.expectedResult}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tips:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {scenario.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              These scenarios demonstrate the comprehensive validation, real-time feedback, and enhanced user experience 
              features of the opportunity creation form. Each scenario focuses on specific aspects of the form's capabilities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold">Validation</div>
                <div className="text-sm text-muted-foreground">
                  {validationScenarios.length} scenarios
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold">Interaction</div>
                <div className="text-sm text-muted-foreground">
                  {interactionScenarios.length} scenarios
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold">Business Logic</div>
                <div className="text-sm text-muted-foreground">
                  {businessLogicScenarios.length} scenarios
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}