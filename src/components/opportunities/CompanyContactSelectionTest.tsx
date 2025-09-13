/**
 * Company and Contact Selection Tests
 * 
 * Test suite to validate the company and contact selection functionality
 * in the opportunity forms
 */

import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Company, Contact } from '@/lib/types';
import { ModernOpportunityEditForm } from './ModernOpportunityEditForm';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Info, Warning, Users, Building, Play } from '@phosphor-icons/react';

export function CompanyContactSelectionTest() {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [showForm, setShowForm] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize sample data if needed
    const initializeTestData = async () => {
      if (companies.length === 0 || contacts.length === 0) {
        try {
          const { initializeSampleData } = await import('@/data/sample-opportunities');
          const sampleData = await initializeSampleData();
          
          if (companies.length === 0 && sampleData.companies.length > 0) {
            setCompanies(sampleData.companies);
          }
          
          if (contacts.length === 0 && sampleData.contacts.length > 0) {
            setContacts(sampleData.contacts);
          }
        } catch (error) {
          console.error('Failed to initialize test data:', error);
        }
      }
    };

    initializeTestData();
  }, [companies.length, contacts.length, setCompanies, setContacts]);

  // Test functions
  const runDataIntegrityTests = () => {
    const results: Record<string, boolean> = {};

    // Test 1: Companies are loaded
    results.companiesLoaded = companies.length > 0;

    // Test 2: Contacts are loaded
    results.contactsLoaded = contacts.length > 0;

    // Test 3: All contacts have valid company IDs
    results.contactsHaveValidCompanyIds = contacts.every(contact => 
      companies.some(company => company.id === contact.companyId)
    );

    // Test 4: Company data integrity
    results.companyDataIntegrity = companies.every(company => 
      company.id && company.name && typeof company.name === 'string'
    );

    // Test 5: Contact data integrity
    results.contactDataIntegrity = contacts.every(contact => 
      contact.id && contact.companyId && contact.firstName && contact.lastName
    );

    // Test 6: Company-Contact relationships
    const companiesWithContacts = companies.filter(company =>
      contacts.some(contact => contact.companyId === company.id)
    );
    results.someCompaniesHaveContacts = companiesWithContacts.length > 0;

    // Test 7: Orphaned contacts check
    const orphanedContacts = contacts.filter(contact =>
      !companies.some(company => company.id === contact.companyId)
    );
    results.noOrphanedContacts = orphanedContacts.length === 0;

    setTestResults(results);

    // Show toast summary
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    if (passedTests === totalTests) {
      toast.success(`All ${totalTests} data integrity tests passed!`);
    } else {
      toast.warning(`${passedTests}/${totalTests} tests passed. Check details below.`);
    }
  };

  const runFormInteractionTests = () => {
    setShowForm(true);
    toast.info('Form opened for manual testing', {
      description: 'Test company selection, contact filtering, and validation'
    });
  };

  const getTestStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getTestDescription = (testKey: string): string => {
    const descriptions: Record<string, string> = {
      companiesLoaded: 'Sample companies are loaded in the system',
      contactsLoaded: 'Sample contacts are loaded in the system',
      contactsHaveValidCompanyIds: 'All contacts reference valid company IDs',
      companyDataIntegrity: 'All companies have required fields (id, name)',
      contactDataIntegrity: 'All contacts have required fields (id, firstName, lastName, companyId)',
      someCompaniesHaveContacts: 'At least some companies have associated contacts',
      noOrphanedContacts: 'No contacts reference non-existent companies'
    };
    return descriptions[testKey] || testKey;
  };

  const getCompanyStats = () => {
    const stats = companies.map(company => {
      const companyContacts = contacts.filter(contact => contact.companyId === company.id);
      return {
        company,
        contactCount: companyContacts.length
      };
    });
    return stats.sort((a, b) => b.contactCount - a.contactCount);
  };

  const handleTestOpportunitySave = (opportunity: any) => {
    console.log('Test opportunity saved:', opportunity);
    toast.success('Test opportunity saved successfully!', {
      description: `Company: ${opportunity.companyId}, Contact: ${opportunity.contactId || 'None'}`
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Company & Contact Selection Tests</h2>
          <p className="text-muted-foreground">
            Validate the functionality of company and contact selection in opportunity forms
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runDataIntegrityTests} variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Run Data Tests
          </Button>
          <Button onClick={runFormInteractionTests}>
            <Play className="w-4 h-4 mr-2" />
            Test Form
          </Button>
        </div>
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Companies ({companies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getCompanyStats().slice(0, 5).map(({ company, contactCount }) => (
                <div key={company.id} className="flex items-center justify-between">
                  <span className="text-sm">{company.name}</span>
                  <Badge variant={contactCount > 0 ? "default" : "secondary"}>
                    {contactCount} contact{contactCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
              {companies.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  And {companies.length - 5} more companies...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Contacts ({contacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contacts.slice(0, 5).map(contact => {
                const company = companies.find(c => c.id === contact.companyId);
                return (
                  <div key={contact.id} className="flex items-center justify-between">
                    <span className="text-sm">{contact.firstName} {contact.lastName}</span>
                    <Badge variant={company ? "default" : "destructive"}>
                      {company?.name || 'No Company'}
                    </Badge>
                  </div>
                );
              })}
              {contacts.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  And {contacts.length - 5} more contacts...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(testResults).map(([testKey, passed]) => (
                <div key={testKey} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTestStatusIcon(passed)}
                    <div>
                      <p className="font-medium">{testKey}</p>
                      <p className="text-sm text-muted-foreground">
                        {getTestDescription(testKey)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={passed ? "default" : "destructive"}>
                    {passed ? 'PASS' : 'FAIL'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Issues & Recommendations */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          <strong>Testing Guidelines:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Run "Data Tests" first to verify data integrity</li>
            <li>Use "Test Form" to manually test company/contact selection</li>
            <li>Try selecting companies with and without contacts</li>
            <li>Verify that contact dropdown updates when company changes</li>
            <li>Test form validation with missing company/contact</li>
            <li>Check that selected values persist correctly</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Test Form Modal */}
      <ModernOpportunityEditForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleTestOpportunitySave}
        opportunity={null}
      />
    </div>
  );
}