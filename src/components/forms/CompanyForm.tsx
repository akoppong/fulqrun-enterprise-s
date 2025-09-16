import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RegionCountrySelector } from '@/components/ui/region-country-selector';
import { toast } from 'sonner';
import { Plus, Building2, Globe, DollarSign, Users, Save, X } from '@phosphor-icons/react';
import { Company } from '@/lib/types';
import { CompanyContactService } from '@/lib/company-contact-service';
import { getCountryByCode, getRegionByCode } from '@/lib/geography-data';

interface CompanyFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCompanyCreated?: (company: Company) => void;
  trigger?: React.ReactNode;
}

interface CompanyFormData {
  name: string;
  industry: string;
  size: string;
  website: string;
  address: string;
  revenue: string;
  employees: string;
  region: string;
  country: string;
}

const initialFormData: CompanyFormData = {
  name: '',
  industry: '',
  size: '',
  website: '',
  address: '',
  revenue: '',
  employees: '',
  region: '',
  country: '',
};

const industryOptions = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Energy',
  'Education',
  'Government',
  'Non-profit',
  'Consulting',
  'Real Estate',
  'Transportation',
  'Media & Entertainment',
  'Agriculture',
  'Construction',
  'Telecommunications',
  'Hospitality',
  'Automotive',
  'Aerospace',
  'Pharmaceutical',
  'Other'
];

const sizeOptions = [
  { value: 'Startup', label: 'Startup (1-10 employees)' },
  { value: 'Small', label: 'Small (11-50 employees)' },
  { value: 'Medium', label: 'Medium (51-250 employees)' },
  { value: 'Large', label: 'Large (251-1000 employees)' },
  { value: 'Enterprise', label: 'Enterprise (1000+ employees)' },
];

export function CompanyForm({
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onCompanyCreated,
  trigger
}: CompanyFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData, string>>>({});

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen;

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Partial<Record<keyof CompanyFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else {
      // Check if company name already exists
      try {
        const existingCompanies = await CompanyContactService.searchCompanies(formData.name.trim());
        const exactMatch = existingCompanies.find(
          company => company.name.toLowerCase() === formData.name.trim().toLowerCase()
        );
        if (exactMatch) {
          newErrors.name = 'A company with this name already exists';
        }
      } catch (error) {
        console.warn('Could not check for duplicate company names:', error);
      }
    }

    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    if (!formData.size) {
      newErrors.size = 'Company size is required';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (formData.revenue && (isNaN(Number(formData.revenue)) || Number(formData.revenue) < 0)) {
      newErrors.revenue = 'Revenue must be a valid positive number';
    }

    if (formData.employees && (isNaN(Number(formData.employees)) || Number(formData.employees) < 0)) {
      newErrors.employees = 'Number of employees must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const formatWebsiteUrl = (url: string): string => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const companyData = {
        name: formData.name.trim(),
        industry: formData.industry,
        size: formData.size,
        website: formData.website ? formatWebsiteUrl(formData.website.trim()) : undefined,
        address: formData.address.trim() || undefined,
        revenue: formData.revenue ? Number(formData.revenue) : undefined,
        employees: formData.employees ? Number(formData.employees) : undefined,
        region: formData.region || undefined,
        country: formData.country || undefined,
        // Keep legacy field for backward compatibility
        geography: formData.region ? getRegionByCode(formData.region)?.name : undefined,
      };

      const newCompany = await CompanyContactService.createCompany(companyData);

      // Get region/country names for toast
      const region = formData.region ? getRegionByCode(formData.region) : null;
      const country = formData.country ? getCountryByCode(formData.country) : null;
      
      toast.success(
        `Company created successfully!`, 
        {
          description: `${formData.name}${country ? `, ${country.name}` : region ? `, ${region.name}` : ''}`
        }
      );

      // Reset form
      setFormData(initialFormData);
      setErrors({});
      
      // Call callback
      if (onCompanyCreated) {
        onCompanyCreated(newCompany);
      }

      // Close dialog
      setIsOpen(false);

    } catch (error) {
      console.error('Error creating company:', error);
      
      let errorMessage = 'Failed to create company. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Validation errors')) {
          errorMessage = 'Please check the form fields and try again.';
        } else if (error.message.includes('name')) {
          errorMessage = 'Company name is required and must be unique.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Please enter a valid email format.';
        } else if (error.message.includes('website')) {
          errorMessage = 'Please enter a valid website URL.';
        } else if (error.message.includes('size')) {
          errorMessage = 'Please select a valid company size.';
        } else if (error.message.includes('industry')) {
          errorMessage = 'Please select a valid industry.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsOpen(false);
  };

  const handleFieldChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Building2 size={20} />
          Basic Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
              placeholder="Enter company name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">
              Industry <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleFieldChange('industry', value)}
            >
              <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select industry..." />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-sm text-destructive">{errors.industry}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">
              Company Size <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.size}
              onValueChange={(value) => handleFieldChange('size', value)}
            >
              <SelectTrigger className={errors.size ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select company size..." />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.size && (
              <p className="text-sm text-destructive">{errors.size}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleFieldChange('website', e.target.value)}
              className={errors.website ? 'border-destructive' : ''}
              placeholder="Enter website URL"
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website}</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign size={20} />
          Financial Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="revenue">Annual Revenue (USD)</Label>
            <Input
              id="revenue"
              type="number"
              min="0"
              value={formData.revenue}
              onChange={(e) => handleFieldChange('revenue', e.target.value)}
              className={errors.revenue ? 'border-destructive' : ''}
              placeholder="Enter annual revenue"
            />
            {errors.revenue && (
              <p className="text-sm text-destructive">{errors.revenue}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              type="number"
              min="0"
              value={formData.employees}
              onChange={(e) => handleFieldChange('employees', e.target.value)}
              className={errors.employees ? 'border-destructive' : ''}
              placeholder="Enter number of employees"
            />
            {errors.employees && (
              <p className="text-sm text-destructive">{errors.employees}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Globe size={20} />
          Location Information
        </h4>

        <RegionCountrySelector
          selectedRegion={formData.region}
          selectedCountry={formData.country}
          onRegionChange={(region) => handleFieldChange('region', region)}
          onCountryChange={(country) => handleFieldChange('country', country)}
        />

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            placeholder="Enter full address (optional)"
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          <X size={16} className="mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Create Company
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 size={20} />
              Create New Company
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 size={20} />
            Create New Company
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

// Convenience component for trigger button
export function CreateCompanyButton({
  onCompanyCreated,
  ...props
}: Omit<CompanyFormProps, 'trigger'> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <CompanyForm
      onCompanyCreated={onCompanyCreated}
      trigger={
        <Button {...props}>
          <Plus size={20} className="mr-2" />
          Add Company
        </Button>
      }
    />
  );
}