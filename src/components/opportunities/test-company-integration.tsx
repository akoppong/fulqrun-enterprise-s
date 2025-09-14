import { useState, useEffect } from 'react';
import { CompanyContactService } from '@/lib/company-contact-service';
import { Company } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function TestCompanyIntegration() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      await CompanyContactService.initializeSampleData();
      const allCompanies = await CompanyContactService.getAllCompanies();
      setCompanies(allCompanies);
      console.log('Test: Loaded companies:', allCompanies);
    } catch (error) {
      console.error('Test: Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const createTestCompany = async () => {
    try {
      const testCompany = await CompanyContactService.createCompany({
        name: `Test Company ${Date.now()}`,
        industry: 'Technology',
        size: 'Medium',
        region: 'NA',
        country: 'US'
      });
      console.log('Test: Created company:', testCompany);
      await loadCompanies(); // Refresh the list
    } catch (error) {
      console.error('Test: Error creating company:', error);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Company Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={loadCompanies} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh Companies'}
          </Button>
          <Button onClick={createTestCompany} variant="outline">
            Create Test Company
          </Button>
        </div>
        
        <div>
          <Badge>{companies.length} companies loaded</Badge>
        </div>
        
        <div className="space-y-2">
          {companies.map((company) => (
            <div key={company.id} className="p-2 border rounded">
              <strong>{company.name}</strong> - {company.industry}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}