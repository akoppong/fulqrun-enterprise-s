import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Company, CustomerSegment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Search, Plus, Users, MapPin, Globe, Target } from '@phosphor-icons/react';
import { SegmentAssignmentDialog } from '../segments/SegmentAssignmentDialog';
import { CompanyContactService } from '@/lib/company-contact-service';
import { DemoDataGenerator } from '@/lib/demo-data';
import { CreateCompanyButton } from '@/components/forms/CompanyForm';
import { getCountryByCode, getRegionByCode } from '@/lib/geography-data';
import { toast } from 'sonner';

export function CompaniesView() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [segments] = useKV<CustomerSegment[]>('customer-segments', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize company data from the centralized service
  const loadCompanies = async () => {
    setIsLoading(true);
    try {
      await CompanyContactService.initializeSampleData();
      const serviceCompanies = await CompanyContactService.getAllCompanies();
      setCompanies(serviceCompanies);
      console.log('Loaded companies from service:', serviceCompanies.length);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
      // Fallback to demo data
      const demoCompanies = DemoDataGenerator.generateCompanies();
      setCompanies(demoCompanies);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Handle company creation
  const handleCompanyCreated = async (newCompany: Company) => {
    try {
      // Refresh the entire companies list from the service to ensure consistency
      await loadCompanies();
      toast.success(`Company "${newCompany.name}" created successfully`);
    } catch (error) {
      console.error('Error refreshing companies after creation:', error);
      toast.error('Company created but failed to refresh list');
      // Fallback: add to existing list if refresh fails
      setCompanies(prev => [...prev, newCompany]);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSegment = segmentFilter === 'all' || 
      (segmentFilter === 'unassigned' && !company.segmentId) ||
      company.segmentId === segmentFilter;

    return matchesSearch && matchesSegment;
  });

  const getLocationDisplay = (company: Company) => {
    if (!company.region && !company.country && !company.geography) return null;
    
    // Use new region/country fields if available
    if (company.region || company.country) {
      const region = company.region ? getRegionByCode(company.region) : null;
      const country = company.country ? getCountryByCode(company.country) : null;
      
      if (country) {
        return country.name;
      } else if (region) {
        return region.name;
      }
    }
    
    // Fallback to legacy geography field
    if (company.geography) {
      return company.geography;
    }
    
    return null;
  };

  const getSegmentInfo = (segmentId?: string) => {
    if (!segmentId) return null;
    return segments.find(s => s.id === segmentId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleAssignSegment = (updatedCompany: Company) => {
    setCompanies(current => 
      current.map(company => 
        company.id === updatedCompany.id ? updatedCompany : company
      )
    );
    setSelectedCompany(null);
  };

  const segmentStats = segments.reduce((acc, segment) => {
    const count = companies.filter(c => c.segmentId === segment.id).length;
    acc[segment.id] = count;
    return acc;
  }, {} as Record<string, number>);

  const unassignedCount = companies.filter(c => !c.segmentId).length;

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Users className="h-4 w-4" />;
      case 'Trophy': return <Target className="h-4 w-4" />;
      case 'Shield': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Companies</h2>
          <p className="text-muted-foreground">Manage your company database and customer segments</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {filteredCompanies.length} companies
          </Badge>
          <CreateCompanyButton
            onCompanyCreated={handleCompanyCreated}
          />
        </div>
      </div>

      {/* Segment Overview */}
      {segments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Segment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {segments.map((segment) => (
                <div key={segment.id} className="text-center">
                  <div 
                    className="h-12 w-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: `${segment.color}20` }}
                  >
                    <div style={{ color: segment.color }}>
                      {getIconComponent(segment.icon)}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{segmentStats[segment.id] || 0}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">{segment.name}</div>
                </div>
              ))}
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center mx-auto mb-2 bg-gray-100">
                  <Building2 className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-2xl font-bold">{unassignedCount}</div>
                <div className="text-sm text-muted-foreground">Unassigned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by segment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Segments</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {segments.map((segment) => (
              <SelectItem key={segment.id} value={segment.id}>
                <div className="flex items-center gap-2">
                  <div style={{ color: segment.color }}>
                    {getIconComponent(segment.icon)}
                  </div>
                  {segment.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Companies List */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4">
            {filteredCompanies.map((company) => {
              const segment = getSegmentInfo(company.segmentId);
              
              return (
                <Card key={company.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{company.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{company.industry}</span>
                            <span>•</span>
                            <span>{company.size}</span>
                            {company.revenue && (
                              <>
                                <span>•</span>
                                <span>{formatCurrency(company.revenue)}</span>
                              </>
                            )}
                          </div>
                          {company.website && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              <a 
                                href={company.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline"
                              >
                                {company.website}
                              </a>
                            </div>
                          )}
                          {company.address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{company.address}</span>
                            </div>
                          )}
                          
                          {getLocationDisplay(company) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              <span>{getLocationDisplay(company)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        {segment ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-6 w-6 rounded-md flex items-center justify-center"
                              style={{ backgroundColor: `${segment.color}20` }}
                            >
                              <div style={{ color: segment.color }}>
                                {getIconComponent(segment.icon)}
                              </div>
                            </div>
                            <Badge style={{ backgroundColor: segment.color, color: 'white' }}>
                              {segment.name}
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            No Segment
                          </Badge>
                        )}
                        
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCompany(company)}
                            className="flex items-center gap-2"
                          >
                            <Target className="h-3 w-3" />
                            {segment ? 'Change Segment' : 'Assign Segment'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {company.segmentAssignment && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700">
                            Assigned {new Date(company.segmentAssignment.assignedAt).toLocaleDateString()}
                          </span>
                          <span className="text-blue-600">
                            Confidence: {company.segmentAssignment.confidence}%
                          </span>
                        </div>
                        {company.segmentAssignment.reason && (
                          <p className="text-sm text-blue-700 mt-1">
                            {company.segmentAssignment.reason}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCompanies.length === 0 && !isInitializing && (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No companies found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search criteria or filters'
                  : 'Start by adding your first company'
                }
              </p>
              {companies.length === 0 && (
                <Button 
                  onClick={() => {
                    CompanyContactService.initializeSampleData().then(() => {
                      window.location.reload();
                    });
                  }}
                  className="mt-4"
                  variant="outline"
                >
                  Load Sample Data
                </Button>
              )}
            </div>
          )}

          {isInitializing && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading companies...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segment Assignment Dialog */}
      {selectedCompany && (
        <SegmentAssignmentDialog
          company={selectedCompany}
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onAssign={handleAssignSegment}
        />
      )}
    </div>
  );
}