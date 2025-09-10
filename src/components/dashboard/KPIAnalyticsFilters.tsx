import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import type { DateRange } from 'react-day-picker';
import { 
  Filter, X, Calendar as CalendarIcon, ChevronDown,
  MapPin, Users, DollarSign, TrendingUp, Building,
  Target, Star, Activity, Clock, CheckCircle
} from '@phosphor-icons/react';
import { format } from 'date-fns';

interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  options?: string[];
  value?: any;
  min?: number;
  max?: number;
  icon?: React.ComponentType<any>;
}

interface FilterCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  filters: FilterOption[];
  expanded: boolean;
}

interface KPIAnalyticsFiltersProps {
  onFiltersChange: (filters: Record<string, any>) => void;
  availableFilters?: FilterCategory[];
  activeFilters: Record<string, any>;
}

const defaultFilterCategories: FilterCategory[] = [
  {
    id: 'time',
    name: 'Time Period',
    icon: CalendarIcon,
    expanded: true,
    filters: [
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'date',
        icon: CalendarIcon
      },
      {
        id: 'period',
        label: 'Period',
        type: 'select',
        options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
        icon: Clock
      },
      {
        id: 'comparePrevious',
        label: 'Compare with Previous Period',
        type: 'boolean',
        icon: TrendingUp
      }
    ]
  },
  {
    id: 'performance',
    name: 'Performance',
    icon: Target,
    expanded: false,
    filters: [
      {
        id: 'performanceLevel',
        label: 'Performance Level',
        type: 'multiselect',
        options: ['Above Target', 'At Target', 'Below Target', 'Critical'],
        icon: Target
      },
      {
        id: 'trendDirection',
        label: 'Trend Direction',
        type: 'multiselect',
        options: ['Improving', 'Stable', 'Declining'],
        icon: TrendingUp
      },
      {
        id: 'riskLevel',
        label: 'Risk Level',
        type: 'select',
        options: ['Low', 'Medium', 'High', 'Critical'],
        icon: Star
      }
    ]
  },
  {
    id: 'business',
    name: 'Business Segments',
    icon: Building,
    expanded: false,
    filters: [
      {
        id: 'customerSegment',
        label: 'Customer Segment',
        type: 'multiselect',
        options: ['Strategic Partners', 'Reference Customers', 'Vector Control', 'Enterprise', 'SMB'],
        icon: Users
      },
      {
        id: 'geography',
        label: 'Geography',
        type: 'multiselect',
        options: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
        icon: MapPin
      },
      {
        id: 'industry',
        label: 'Industry',
        type: 'multiselect',
        options: ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail'],
        icon: Building
      }
    ]
  },
  {
    id: 'financial',
    name: 'Financial',
    icon: DollarSign,
    expanded: false,
    filters: [
      {
        id: 'revenueRange',
        label: 'Revenue Range',
        type: 'range',
        min: 0,
        max: 10000000,
        icon: DollarSign
      },
      {
        id: 'dealSize',
        label: 'Deal Size Category',
        type: 'multiselect',
        options: ['< $10K', '$10K - $50K', '$50K - $250K', '$250K - $1M', '> $1M'],
        icon: DollarSign
      },
      {
        id: 'paymentTerms',
        label: 'Payment Terms',
        type: 'multiselect',
        options: ['Net 15', 'Net 30', 'Net 60', 'Net 90', 'Annual', 'Monthly'],
        icon: CheckCircle
      }
    ]
  },
  {
    id: 'operational',
    name: 'Operational',
    icon: Activity,
    expanded: false,
    filters: [
      {
        id: 'salesRep',
        label: 'Sales Representative',
        type: 'multiselect',
        options: ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'Robert Wilson'],
        icon: Users
      },
      {
        id: 'leadSource',
        label: 'Lead Source',
        type: 'multiselect',
        options: ['Inbound Marketing', 'Outbound Sales', 'Referral', 'Event', 'Partner Channel'],
        icon: Activity
      },
      {
        id: 'pipelineStage',
        label: 'Pipeline Stage',
        type: 'multiselect',
        options: ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
        icon: Target
      }
    ]
  }
];

export function KPIAnalyticsFilters({ 
  onFiltersChange, 
  availableFilters = defaultFilterCategories,
  activeFilters 
}: KPIAnalyticsFiltersProps) {
  const [filterCategories, setFilterCategories] = useState<FilterCategory[]>(availableFilters);
  const [tempFilters, setTempFilters] = useState<Record<string, any>>(activeFilters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const toggleCategory = (categoryId: string) => {
    setFilterCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
      )
    );
  };

  const updateFilter = (filterId: string, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setIsDialogOpen(false);
  };

  const resetFilters = () => {
    setTempFilters({});
    onFiltersChange({});
    setIsDialogOpen(false);
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => {
      const value = activeFilters[key];
      return value !== undefined && value !== null && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  };

  const renderFilterControl = (filter: FilterOption) => {
    const value = tempFilters[filter.id];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => updateFilter(filter.id, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = value || [];
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  {selectedValues.length > 0 
                    ? `${selectedValues.length} selected`
                    : `Select ${filter.label.toLowerCase()}`
                  }
                  <ChevronDown className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filter.options?.map((option) => {
                    const isSelected = selectedValues.includes(option);
                    return (
                      <div key={option} className="flex items-center space-x-2">
                        <Switch
                          id={`${filter.id}-${option}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const newValues = checked
                              ? [...selectedValues, option]
                              : selectedValues.filter((v: string) => v !== option);
                            updateFilter(filter.id, newValues);
                          }}
                        />
                        <Label htmlFor={`${filter.id}-${option}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((selectedValue: string) => (
                  <Badge key={selectedValue} variant="secondary" className="text-xs">
                    {selectedValue}
                    <button
                      onClick={() => {
                        const newValues = selectedValues.filter((v: string) => v !== selectedValue);
                        updateFilter(filter.id, newValues);
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case 'range':
        const rangeValue = value || { min: filter.min, max: filter.max };
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Min</Label>
                <Input
                  type="number"
                  value={rangeValue.min || ''}
                  onChange={(e) => updateFilter(filter.id, {
                    ...rangeValue,
                    min: e.target.value ? parseInt(e.target.value) : filter.min
                  })}
                  placeholder="Min"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max</Label>
                <Input
                  type="number"
                  value={rangeValue.max || ''}
                  onChange={(e) => updateFilter(filter.id, {
                    ...rangeValue,
                    max: e.target.value ? parseInt(e.target.value) : filter.max
                  })}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  'Pick a date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  updateFilter(filter.id, range);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={filter.id}
              checked={value || false}
              onCheckedChange={(checked) => updateFilter(filter.id, checked)}
            />
            <Label htmlFor={filter.id} className="text-sm">
              {value ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="flex items-center space-x-2">
      {/* Quick filters */}
      <Select
        value={activeFilters.period || ''}
        onValueChange={(value) => onFiltersChange({ ...activeFilters, period: value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={activeFilters.customerSegment?.[0] || ''}
        onValueChange={(value) => onFiltersChange({ 
          ...activeFilters, 
          customerSegment: value ? [value] : [] 
        })}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Customer Segment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Segments</SelectItem>
          <SelectItem value="Strategic Partners">Strategic Partners</SelectItem>
          <SelectItem value="Reference Customers">Reference Customers</SelectItem>
          <SelectItem value="Vector Control">Vector Control</SelectItem>
          <SelectItem value="Enterprise">Enterprise</SelectItem>
          <SelectItem value="SMB">SMB</SelectItem>
        </SelectContent>
      </Select>

      {/* Advanced filters dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-2 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl dialog-content max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Advanced KPI Filters</DialogTitle>
            <DialogDescription>
              Configure detailed filters to refine your KPI analysis and drill-down views
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {filterCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader 
                    className="cursor-pointer py-3"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center space-x-2">
                        <category.icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform ${
                          category.expanded ? 'rotate-180' : ''
                        }`} 
                      />
                    </CardTitle>
                  </CardHeader>
                  {category.expanded && (
                    <CardContent className="pt-0 space-y-4">
                      {category.filters.map((filter) => (
                        <div key={filter.id} className="space-y-2">
                          <Label className="text-sm font-medium flex items-center space-x-2">
                            {filter.icon && <filter.icon className="h-4 w-4" />}
                            <span>{filter.label}</span>
                          </Label>
                          {renderFilterControl(filter)}
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>

          <Separator />

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Reset All
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear active filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({})}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}