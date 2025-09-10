import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Building2,
  Target,
  TrendingUp,
  Users,
  Shield,
  Activity,
  Heart,
  Award,
  Zap,
  BarChart3,
  Search,
  Filter,
  Download,
  Star,
  CheckCircle,
  Plus,
  Eye,
  Copy,
  Sparkle,
  Gauge
} from '@phosphor-icons/react';
import { PersonalizedKPICard, PersonalizedKPIData, KPI_TEMPLATES } from './widgets/PersonalizedKPICard';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

// Pharmaceutical industry-specific KPI categories
const PHARMA_CATEGORIES = {
  'Market Access': {
    icon: Shield,
    color: '#059669',
    description: 'Formulary access, payer coverage, and reimbursement metrics',
    templates: ['formularyAccess', 'payerCoverage', 'hospitalPenetration']
  },
  'Commercial Performance': {
    icon: TrendingUp,
    color: '#dc2626',
    description: 'Sales, market share, and revenue performance indicators',
    templates: ['prescriptionVolume', 'marketShare', 'launchPerformance']
  },
  'Clinical Excellence': {
    icon: Activity,
    color: '#0891b2',
    description: 'Clinical trial metrics, regulatory compliance, and medical affairs',
    templates: ['clinicalEnrollment', 'regulatoryCompliance', 'medicalEngagement']
  },
  'Stakeholder Engagement': {
    icon: Users,
    color: '#ea580c',
    description: 'KOL relationships, patient support, and customer engagement',
    templates: ['kolEngagement', 'patientSupport', 'competitiveIntel']
  }
};

// Sample pharmaceutical KPI data with realistic values
const PHARMACEUTICAL_SAMPLE_DATA: Record<string, PersonalizedKPIData> = {
  formularyAccess: {
    id: 'formulary-access-demo',
    title: 'Formulary Access Rate',
    subtitle: 'Products covered by health plans',
    value: 92,
    target: 95,
    format: 'percentage',
    trend: 'up',
    trendValue: '+3.2%',
    trendLabel: 'vs last quarter',
    progress: 97,
    status: 'success',
    icon: 'shield',
    color: '#059669',
    style: 'modern',
    borderRadius: 'large',
    shadow: 'medium',
    animation: 'slide',
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'area',
      data: [78, 82, 85, 88, 90, 92],
      color: '#059669',
      height: 60,
    },
    customFields: [
      { label: 'Tier 1 Plans', value: '95%', icon: 'star' },
      { label: 'Tier 2 Plans', value: '88%', icon: 'award' },
    ],
    lastUpdated: new Date(),
  },
  hospitalPenetration: {
    id: 'hospital-penetration-demo',
    title: 'Hospital System Penetration',
    subtitle: 'Key accounts with active products',
    value: 82,
    previousValue: 75,
    format: 'percentage',
    trend: 'up',
    trendValue: '+7pts',
    trendLabel: 'this quarter',
    status: 'success',
    icon: 'building',
    color: '#0ea5e9',
    style: 'glassmorphic',
    borderRadius: 'large',
    shadow: 'glow',
    animation: 'fade',
    showTrend: true,
    showProgress: true,
    backgroundColor: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.1))',
    customFields: [
      { label: 'Tier 1 Systems', value: '24/30', icon: 'building' },
      { label: 'New Accounts', value: '3', icon: 'target' },
    ],
    lastUpdated: new Date(),
  },
  prescriptionVolume: {
    id: 'prescription-volume-demo',
    title: 'Prescription Volume',
    subtitle: 'Monthly total Rx volume',
    value: 175000,
    previousValue: 163000,
    format: 'number',
    unit: 'TRx',
    trend: 'up',
    trendValue: '+7.4%',
    trendLabel: 'vs last month',
    status: 'success',
    icon: 'chart',
    color: '#7c3aed',
    style: 'gradient',
    borderRadius: 'large',
    shadow: 'large',
    animation: 'slide',
    backgroundColor: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    textColor: '#ffffff',
    showTrend: true,
    showSparkline: true,
    sparklineData: [145000, 152000, 148000, 163000, 170000, 175000],
    customFields: [
      { label: 'New Rx', value: '28.5K', icon: 'sparkle' },
      { label: 'Refills', value: '146.5K', icon: 'activity' },
    ],
    lastUpdated: new Date(),
  },
  marketShare: {
    id: 'market-share-demo',
    title: 'Market Share',
    subtitle: 'Therapeutic area dominance',
    value: 24.5,
    previousValue: 22.1,
    format: 'percentage',
    trend: 'up',
    trendValue: '+2.4%',
    trendLabel: 'vs competitor',
    progress: 82,
    status: 'success',
    icon: 'target',
    color: '#dc2626',
    style: 'modern',
    borderRadius: 'medium',
    shadow: 'medium',
    animation: 'pulse',
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'donut',
      data: [24.5],
      color: '#dc2626',
      height: 80,
    },
    customFields: [
      { label: 'vs Competitor A', value: '+2.3%', icon: 'trending-up' },
      { label: 'vs Competitor B', value: '-0.8%', icon: 'trending-down' },
    ],
    lastUpdated: new Date(),
  },
  kolEngagement: {
    id: 'kol-engagement-demo',
    title: 'KOL Engagement Score',
    subtitle: 'Key opinion leader relationships',
    value: 94,
    target: 90,
    format: 'number',
    suffix: '/100',
    trend: 'up',
    trendValue: '+8pts',
    trendLabel: 'this quarter',
    progress: 94,
    status: 'success',
    icon: 'users',
    color: '#ea580c',
    style: 'gradient',
    borderRadius: 'full',
    shadow: 'large',
    animation: 'slide',
    backgroundColor: 'linear-gradient(135deg, #ea580c, #f97316)',
    textColor: '#ffffff',
    showTrend: true,
    showSparkline: true,
    sparklineData: [82, 85, 88, 86, 91, 94],
    customFields: [
      { label: 'Tier 1 KOLs', value: '15/18', icon: 'star' },
      { label: 'Advisory Boards', value: '4', icon: 'users' },
    ],
    lastUpdated: new Date(),
  },
  patientSupport: {
    id: 'patient-support-demo',
    title: 'Patient Support Enrollment',
    subtitle: 'Hub services utilization',
    value: 1720,
    previousValue: 1580,
    format: 'number',
    trend: 'up',
    trendValue: '+140',
    trendLabel: 'new enrollments',
    status: 'info',
    icon: 'heart',
    color: '#be185d',
    style: 'gradient',
    borderRadius: 'large',
    shadow: 'large',
    animation: 'fade',
    backgroundColor: 'linear-gradient(135deg, #be185d, #ec4899)',
    textColor: '#ffffff',
    showTrend: true,
    showSparkline: true,
    sparklineData: [1250, 1385, 1420, 1580, 1650, 1720],
    customFields: [
      { label: 'Copay Cards', value: '1,234', icon: 'dollar' },
      { label: 'Prior Auth', value: '486', icon: 'shield' },
    ],
    lastUpdated: new Date(),
  },
};

interface PharmaceuticalKPITemplatesProps {
  onApplyTemplate?: (templateData: PersonalizedKPIData) => void;
  onCreateKPI?: (kpiData: PersonalizedKPIData) => void;
}

export function PharmaceuticalKPITemplates({ 
  onApplyTemplate, 
  onCreateKPI 
}: PharmaceuticalKPITemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewKPI, setPreviewKPI] = useState<PersonalizedKPIData | null>(null);
  const [customizing, setCustomizing] = useState<string | null>(null);
  const [customData, setCustomData] = useState<Partial<PersonalizedKPIData>>({});

  // Filter templates based on search and category
  const filteredTemplates = Object.entries(KPI_TEMPLATES).filter(([key, template]) => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      Object.values(PHARMA_CATEGORIES).some(category => 
        category.templates.includes(key) && 
        (selectedCategory === 'all' || Object.keys(PHARMA_CATEGORIES).find(catKey => 
          PHARMA_CATEGORIES[catKey as keyof typeof PHARMA_CATEGORIES] === category
        ) === selectedCategory)
      );
    return matchesSearch && matchesCategory;
  });

  const handleApplyTemplate = (templateKey: string) => {
    const template = KPI_TEMPLATES[templateKey as keyof typeof KPI_TEMPLATES];
    const sampleData = PHARMACEUTICAL_SAMPLE_DATA[templateKey];
    
    if (sampleData && onApplyTemplate) {
      onApplyTemplate({
        ...sampleData,
        id: `${templateKey}-${Date.now()}`,
        title: customData.title || template.title,
        ...customData,
        lastUpdated: new Date(),
      });
      toast.success(`${template.title} template applied successfully`);
    }
  };

  const handleCustomizeTemplate = (templateKey: string) => {
    const template = KPI_TEMPLATES[templateKey as keyof typeof KPI_TEMPLATES];
    const sampleData = PHARMACEUTICAL_SAMPLE_DATA[templateKey];
    
    if (sampleData) {
      setCustomData(sampleData);
      setCustomizing(templateKey);
    }
  };

  const handleSaveCustomization = () => {
    if (customizing && onCreateKPI && customData) {
      const finalKPI: PersonalizedKPIData = {
        id: `custom-${Date.now()}`,
        title: 'Custom KPI',
        value: 0,
        format: 'number',
        icon: 'target',
        color: '#3b82f6',
        showTrend: false,
        showProgress: false,
        showSparkline: false,
        lastUpdated: new Date(),
        ...customData,
      };
      
      onCreateKPI(finalKPI);
      setCustomizing(null);
      setCustomData({});
      toast.success('Custom KPI created successfully');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = PHARMA_CATEGORIES[categoryName as keyof typeof PHARMA_CATEGORIES];
    return category?.icon || Target;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = PHARMA_CATEGORIES[categoryName as keyof typeof PHARMA_CATEGORIES];
    return category?.color || '#3b82f6';
  };

  const getTemplateCategory = (templateKey: string) => {
    for (const [categoryName, category] of Object.entries(PHARMA_CATEGORIES)) {
      if (category.templates.includes(templateKey)) {
        return categoryName;
      }
    }
    return 'General';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold gradient-text bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pharmaceutical B2B Sales KPI Templates
            </h2>
            <p className="text-muted-foreground max-w-4xl">
              Industry-specific KPI templates designed for high-performance pharmaceutical sales operations, 
              featuring market access, clinical metrics, and stakeholder engagement indicators.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>FDA Audit Ready</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>13 Industry Templates</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-w-fit">
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600">
              Beta Release
            </Badge>
            <div className="text-xs text-muted-foreground text-right">
              Updated for 2024 industry standards
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">4</div>
            <div className="text-xs text-muted-foreground">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">13</div>
            <div className="text-xs text-muted-foreground">Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-xs text-muted-foreground">Customizable</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">∞</div>
            <div className="text-xs text-muted-foreground">Use Cases</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Templates
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Guide
          </Button>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="templates">All Templates</TabsTrigger>
          <TabsTrigger value="preview">Template Gallery</TabsTrigger>
          <TabsTrigger value="guide">Implementation Guide</TabsTrigger>
        </TabsList>

        {/* Category View */}
        <TabsContent value="categories" className="space-y-6">
          {Object.entries(PHARMA_CATEGORIES).map(([categoryName, category]) => {
            const IconComponent = category.icon;
            const categoryTemplates = category.templates.filter(templateKey => 
              KPI_TEMPLATES[templateKey as keyof typeof KPI_TEMPLATES]?.title
                .toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (categoryTemplates.length === 0) return null;

            return (
              <Card key={categoryName} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-background to-muted/30">
                  <CardTitle className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent 
                        className="h-6 w-6" 
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{categoryName}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {category.description}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryTemplates.length} templates
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTemplates.map(templateKey => {
                      const template = KPI_TEMPLATES[templateKey as keyof typeof KPI_TEMPLATES];
                      const sampleData = PHARMACEUTICAL_SAMPLE_DATA[templateKey];
                      
                      if (!template || !sampleData) return null;

                      return (
                        <Card key={templateKey} className="group hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-medium text-sm">{template.title}</h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {sampleData.subtitle || 'Performance metric'}
                                  </p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ borderColor: template.color, color: template.color }}
                                >
                                  {template.format}
                                </Badge>
                              </div>

                              <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center">
                                <PersonalizedKPICard
                                  data={{
                                    ...sampleData,
                                    id: `preview-${templateKey}`,
                                  }}
                                  variant="minimal"
                                  size="sm"
                                  className="w-full h-full border-0 shadow-none bg-transparent"
                                />
                              </div>

                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => setPreviewKPI(sampleData)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCustomizeTemplate(templateKey)}
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Use
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Templates List View */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(([templateKey, template]) => {
              const sampleData = PHARMACEUTICAL_SAMPLE_DATA[templateKey];
              const category = getTemplateCategory(templateKey);
              
              if (!sampleData) return null;

              return (
                <Card key={templateKey} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${getCategoryColor(category)}20`,
                                color: getCategoryColor(category)
                              }}
                            >
                              {category}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{template.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {sampleData.subtitle || 'Performance tracking metric'}
                          </p>
                        </div>
                      </div>

                      <div className="h-32">
                        <PersonalizedKPICard
                          data={sampleData}
                          variant="compact"
                          size="sm"
                          className="w-full h-full"
                        />
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setPreviewKPI(sampleData)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCustomizeTemplate(templateKey)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Gallery Preview */}
        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(PHARMACEUTICAL_SAMPLE_DATA).map(([key, sampleData]) => (
              <PersonalizedKPICard
                key={key}
                data={sampleData}
                variant="default"
                className="cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleCustomizeTemplate(key)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Implementation Guide */}
        <TabsContent value="guide" className="space-y-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Pharmaceutical KPI Implementation Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Start */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Start (5 minutes)
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Select 3-5 KPIs that align with your role (Sales Rep, Manager, etc.)</li>
                    <li>Preview templates to understand data requirements</li>
                    <li>Customize targets and thresholds to match your goals</li>
                    <li>Apply templates to your dashboard</li>
                    <li>Set up alerts for critical metrics</li>
                  </ol>
                </div>

                {/* Role-Based Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Sales Representatives</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">Recommended Templates:</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Prescription Volume (daily tracking)</li>
                          <li>Hospital System Penetration</li>
                          <li>KOL Engagement Score</li>
                          <li>Patient Support Enrollment</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Brand Managers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">Recommended Templates:</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Market Share (competitive analysis)</li>
                          <li>Product Launch Velocity</li>
                          <li>Formulary Access Rate</li>
                          <li>Competitive Intelligence</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Regional Managers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">Recommended Templates:</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>All Commercial Performance metrics</li>
                          <li>Territory-level aggregations</li>
                          <li>Team performance comparisons</li>
                          <li>Goal achievement tracking</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Medical Affairs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="font-medium">Recommended Templates:</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>KOL Engagement Score</li>
                          <li>Medical Affairs Engagement</li>
                          <li>Clinical Trial Enrollment</li>
                          <li>Regulatory Compliance</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Best Practices */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Best Practices
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="font-medium text-green-600">✓ Do</div>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Start with 3-5 core metrics</li>
                        <li>Set realistic targets based on historical data</li>
                        <li>Review KPIs regularly with your team</li>
                        <li>Use trend analysis to identify patterns</li>
                        <li>Customize alerts for proactive monitoring</li>
                        <li>Connect to your existing data sources</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-red-600">✗ Avoid</div>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Creating too many KPIs initially</li>
                        <li>Setting unrealistic targets</li>
                        <li>Ignoring data quality issues</li>
                        <li>Not updating metrics regularly</li>
                        <li>Focusing only on lagging indicators</li>
                        <li>Neglecting team communication</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Data Sources */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    Common Data Sources
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <Badge variant="outline">IQVIA</Badge>
                    <Badge variant="outline">Symphony Health</Badge>
                    <Badge variant="outline">Salesforce CRM</Badge>
                    <Badge variant="outline">Veeva CRM</Badge>
                    <Badge variant="outline">FormularyDecisions</Badge>
                    <Badge variant="outline">Medicare.gov</Badge>
                    <Badge variant="outline">ClinicalTrials.gov</Badge>
                    <Badge variant="outline">Internal Sales Data</Badge>
                    <Badge variant="outline">Market Research</Badge>
                  </div>
                </div>

                {/* Support */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Need Help?</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                    Our implementation team can help you set up these templates for your specific use case.
                  </p>
                  <Button size="sm" variant="outline" className="text-xs">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      {previewKPI && (
        <Dialog open={!!previewKPI} onOpenChange={() => setPreviewKPI(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>KPI Template Preview: {previewKPI.title}</DialogTitle>
              <DialogDescription>
                Preview how this KPI template will look with sample data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Compact View</Label>
                  <PersonalizedKPICard
                    data={previewKPI}
                    variant="compact"
                    size="sm"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Default View</Label>
                  <PersonalizedKPICard
                    data={previewKPI}
                    variant="default"
                  />
                </div>
              </div>
              
              {/* KPI Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Format</Label>
                      <div>{previewKPI.format}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <div>{getTemplateCategory(previewKPI.id.replace('-demo', ''))}</div>
                    </div>
                  </div>
                  {previewKPI.customFields && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Additional Metrics</Label>
                      <div className="space-y-1">
                        {previewKPI.customFields.map((field, index) => (
                          <div key={index} className="text-xs">
                            <span className="font-medium">{field.label}:</span> {field.value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewKPI(null)}>
                Close
              </Button>
              <Button onClick={() => {
                const templateKey = previewKPI.id.replace('-demo', '');
                handleCustomizeTemplate(templateKey);
                setPreviewKPI(null);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Customization Dialog */}
      {customizing && (
        <Dialog open={!!customizing} onOpenChange={() => setCustomizing(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                Customize {KPI_TEMPLATES[customizing as keyof typeof KPI_TEMPLATES]?.title}
              </DialogTitle>
              <DialogDescription>
                Adjust the template settings to match your specific requirements
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="custom-title">Title</Label>
                    <Input
                      id="custom-title"
                      value={customData.title || ''}
                      onChange={(e) => setCustomData({ ...customData, title: e.target.value })}
                      placeholder="Enter KPI title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-subtitle">Subtitle</Label>
                    <Input
                      id="custom-subtitle"
                      value={customData.subtitle || ''}
                      onChange={(e) => setCustomData({ ...customData, subtitle: e.target.value })}
                      placeholder="Enter subtitle (optional)"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="custom-value">Current Value</Label>
                    <Input
                      id="custom-value"
                      type="number"
                      value={customData.value || ''}
                      onChange={(e) => setCustomData({ ...customData, value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-target">Target Value</Label>
                    <Input
                      id="custom-target"
                      type="number"
                      value={customData.target || ''}
                      onChange={(e) => setCustomData({ ...customData, target: parseFloat(e.target.value) || 0 })}
                      placeholder="Target value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-trend">Trend Value</Label>
                    <Input
                      id="custom-trend"
                      value={customData.trendValue || ''}
                      onChange={(e) => setCustomData({ ...customData, trendValue: e.target.value })}
                      placeholder="+12.5%"
                    />
                  </div>
                </div>

                {customData && (
                  <div className="mt-6 p-4 border rounded-lg">
                    <Label className="text-sm font-medium">Preview</Label>
                    <div className="mt-2">
                      <PersonalizedKPICard
                        data={{
                          id: 'customization-preview',
                          title: 'Preview KPI',
                          value: 0,
                          format: 'number',
                          icon: 'target',
                          color: '#3b82f6',
                          showTrend: false,
                          showProgress: false,
                          showSparkline: false,
                          lastUpdated: new Date(),
                          ...customData,
                        }}
                        variant="compact"
                      />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCustomizing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCustomization}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create KPI
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}