import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RegionCountrySelector } from '@/components/ui/region-country-selector';
import { toast } from 'sonner';
import { Plus, User, Building2, Mail, Phone, MapPin, Save, X } from '@phosphor-icons/react';
import { Contact, Company } from '@/lib/types';
import { CompanyContactService } from '@/lib/company-contact-service';
import { getCountryByCode, getRegionByCode } from '@/lib/geography-data';

interface ContactFormProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onContactCreated?: (contact: Contact) => void;
  companies?: Company[];
  preselectedCompanyId?: string;
  trigger?: React.ReactNode;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  role: 'champion' | 'decision-maker' | 'influencer' | 'user' | 'blocker';
  companyId: string;
  region: string;
  country: string;
  address: string;
}

const initialFormData: ContactFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  role: 'influencer',
  companyId: '',
  region: '',
  country: '',
  address: '',
};

const roleOptions = [
  { value: 'champion', label: 'Champion', description: 'Advocates for your solution' },
  { value: 'decision-maker', label: 'Decision Maker', description: 'Final authority on purchases' },
  { value: 'influencer', label: 'Influencer', description: 'Influences the decision process' },
  { value: 'user', label: 'User', description: 'Will use the product/service' },
  { value: 'blocker', label: 'Blocker', description: 'Opposes or blocks the decision' },
];

export function ContactForm({
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onContactCreated,
  companies = [],
  preselectedCompanyId,
  trigger
}: ContactFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>(companies);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen;

  // Load companies if not provided
  useEffect(() => {
    if (companies.length === 0) {
      loadCompanies();
    }
  }, [companies]);

  // Set preselected company
  useEffect(() => {
    if (preselectedCompanyId) {
      setFormData(prev => ({ ...prev, companyId: preselectedCompanyId }));
    }
  }, [preselectedCompanyId]);

  const loadCompanies = async () => {
    try {
      const companiesData = await CompanyContactService.getAllCompanies();
      setAvailableCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.phone && !/^[\+\-\s\(\)\d]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const contactData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        title: formData.title.trim(),
        role: formData.role,
        companyId: formData.companyId,
        region: formData.region || undefined,
        country: formData.country || undefined,
        address: formData.address.trim() || undefined,
      };

      const newContact = await CompanyContactService.createContact(contactData);

      // Get company and region/country names for toast
      const company = availableCompanies.find(c => c.id === formData.companyId);
      const region = formData.region ? getRegionByCode(formData.region) : null;
      const country = formData.country ? getCountryByCode(formData.country) : null;
      
      toast.success(
        `Contact created successfully!`, 
        {
          description: `${formData.firstName} ${formData.lastName} at ${company?.name || 'Unknown Company'}${country ? `, ${country.name}` : ''}`
        }
      );

      // Reset form
      setFormData(initialFormData);
      setErrors({});
      
      // Call callback
      if (onContactCreated) {
        onContactCreated(newContact);
      }

      // Close dialog
      setIsOpen(false);

    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Failed to create contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsOpen(false);
  };

  const handleFieldChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <User size={20} />
          Personal Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              className={errors.firstName ? 'border-destructive' : ''}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              className={errors.lastName ? 'border-destructive' : ''}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              className={errors.phone ? 'border-destructive' : ''}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Building2 size={20} />
          Professional Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
              placeholder="Enter job title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleFieldChange('role', value)}
            >
              <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">
            Company <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.companyId}
            onValueChange={(value) => handleFieldChange('companyId', value)}
          >
            <SelectTrigger className={errors.companyId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select company..." />
            </SelectTrigger>
            <SelectContent>
              {availableCompanies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  <div>
                    <div className="font-medium">{company.name}</div>
                    <div className="text-xs text-muted-foreground">{company.industry}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyId && (
            <p className="text-sm text-destructive">{errors.companyId}</p>
          )}
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <MapPin size={20} />
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
              Create Contact
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
              <User size={20} />
              Create New Contact
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
            <User size={20} />
            Create New Contact
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

// Convenience component for trigger button
export function CreateContactButton({
  onContactCreated,
  companies,
  preselectedCompanyId,
  ...props
}: Omit<ContactFormProps, 'trigger'> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <ContactForm
      onContactCreated={onContactCreated}
      companies={companies}
      preselectedCompanyId={preselectedCompanyId}
      trigger={
        <Button {...props}>
          <Plus size={20} className="mr-2" />
          Add Contact
        </Button>
      }
    />
  );
}