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
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function CompaniesView() {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [segments] = useKV<CustomerSegment[]>('customer-segments', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize company data
  useEffect(() => {
    const initializeCompanies = async () => {
      if (companies.length === 0 && !isInitializing) {
        setIsInitializing(true);
        try {
          // First try to get data from CompanyContactService
          await CompanyContactService.initializeSampleData();
          const serviceCompanies = await CompanyContactService.getAllCompanies();
          
          if (serviceCompanies.length > 0) {
            setCompanies(serviceCompanies);
          } else {
            // Fallback to demo data
            const demoCompanies = DemoDataGenerator.generateCompanies();
            setCompanies(demoCompanies);
          }
        } catch (error) {
          console.error('Error initializing companies:', error);
          // Fallback to demo data on error
          const demoCompanies = DemoDataGenerator.generateCompanies();
          setCompanies(demoCompanies);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeCompanies();
  }, [companies, setCompanies, isInitializing]);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSegment = segmentFilter === 'all' || 
      (segmentFilter === 'unassigned' && !company.segmentId) ||
      company.segmentId === segmentFilter;

    return matchesSearch && matchesSegment;
  });

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

  const handleAddCompany = async (companyData: Partial<Company>) => {
    try {
      const newCompany = await CompanyContactService.createCompany({
        name: companyData.name || '',
        industry: companyData.industry || '',
        size: companyData.size || '',
        website: companyData.website,
        address: companyData.address,
        revenue: companyData.revenue,
        employees: companyData.employees,
        geography: companyData.geography,
        customFields: companyData.customFields
      });

      setCompanies(current => [...current, newCompany]);
      setShowAddCompany(false);
      toast.success('Company added successfully!');
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to add company. Please try again.');
    }
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
          <Button 
            onClick={() => setShowAddCompany(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Company
          </Button>
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

      {/* Add Company Dialog */}
      <AddCompanyDialog 
        isOpen={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        onSubmit={handleAddCompany}
      />
    </div>
  );
}

function AddCompanyDialog({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: Partial<Company>) => void; 
}) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    website: '',
    address: '',
    revenue: '',
    employees: '',
    geography: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.industry.trim()) {
      toast.error('Please fill in required fields (Company Name and Industry)');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      industry: formData.industry.trim(),
      size: formData.size.trim() || 'Unknown',
      website: formData.website.trim() || undefined,
      address: formData.address.trim() || undefined,
      revenue: formData.revenue ? parseInt(formData.revenue) : undefined,
      employees: formData.employees ? parseInt(formData.employees) : undefined,
      geography: formData.geography.trim() || undefined,
    });

    // Reset form
    setFormData({
      name: '',
      industry: '',
      size: '',
      website: '',
      address: '',
      revenue: '',
      employees: '',
      geography: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Add New Company
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="required">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry" className="required">Industry *</Label>
              <Select 
                value={formData.industry} 
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Financial Services">Financial Services</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                  <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Select 
                value={formData.size} 
                onValueChange={(value) => handleInputChange('size', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1001-5000">1001-5000 employees</SelectItem>
                  <SelectItem value="5000+">5000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Annual Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                value={formData.revenue}
                onChange={(e) => handleInputChange('revenue', e.target.value)}
                placeholder="1000000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employees">Number of Employees</Label>
              <Input
                id="employees"
                type="number"
                value={formData.employees}
                onChange={(e) => handleInputChange('employees', e.target.value)}
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="geography">Geography</Label>
            <Input
              id="geography"
              value={formData.geography}
              onChange={(e) => handleInputChange('geography', e.target.value)}
              placeholder="North America, Europe, Asia Pacific, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Company address"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Company
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}