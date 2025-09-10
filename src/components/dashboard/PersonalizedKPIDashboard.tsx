import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PersonalizedKPIManager } from './PersonalizedKPIManager';
import { KPIShowcase } from './KPIShowcase';
import { PersonalizedKPIData } from './widgets/PersonalizedKPICard';
import { 
  Plus, 
  Star, 
  Eye, 
  Settings,
  BarChart3,
  Target,
  Palette,
  Grid
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PersonalizedKPIDashboardProps {
  className?: string;
}

export function PersonalizedKPIDashboard({ className = '' }: PersonalizedKPIDashboardProps) {
  const [activeTab, setActiveTab] = useState('manager');
  const [selectedTemplate, setSelectedTemplate] = useState<PersonalizedKPIData | null>(null);

  const handleTemplateSelect = (kpi: PersonalizedKPIData) => {
    setSelectedTemplate(kpi);
    setActiveTab('manager');
    toast.success('Template selected! Edit and customize in the KPI Manager.');
  };

  const stats = [
    {
      title: 'Available Templates',
      value: '20+',
      description: 'Professional KPI card designs',
      icon: Star,
      color: '#10b981'
    },
    {
      title: 'Customization Options',
      value: '50+',
      description: 'Colors, icons, formats & layouts',
      icon: Palette,
      color: '#8b5cf6'
    },
    {
      title: 'Chart Types',
      value: '8',
      description: 'Sparklines, progress bars & gauges',
      icon: BarChart3,
      color: '#3b82f6'
    },
    {
      title: 'Real-time Updates',
      value: '100%',
      description: 'Live data with auto-refresh',
      icon: Target,
      color: '#f59e0b'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Personalized KPI Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Create stunning, personalized KPI cards with advanced customization
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Star className="h-3 w-3 mr-1" />
            Professional
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Real-time
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg" 
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <IconComponent 
                      className="h-5 w-5" 
                      style={{ color: stat.color }} 
                    />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm font-medium">{stat.title}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manager" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              KPI Manager
            </TabsTrigger>
            <TabsTrigger value="showcase" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Template Gallery
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Live Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manager" className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">KPI Manager</h2>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and customize your personalized KPI cards
                </p>
              </div>
              {selectedTemplate && (
                <div className="text-right">
                  <p className="text-sm font-medium">Template Selected:</p>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.title}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(null)}
                    className="mt-1"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </div>
            
            <PersonalizedKPIManager />
          </TabsContent>

          <TabsContent value="showcase" className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Template Gallery</h2>
              <p className="text-sm text-muted-foreground">
                Explore professional KPI card templates and copy them to your dashboard
              </p>
            </div>
            
            <KPIShowcase onSelectKPI={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Live KPI Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                View all your personalized KPIs in a unified dashboard
              </p>
            </div>
            
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Live Dashboard Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Your custom KPIs will appear here with real-time data updates
                </p>
                <div className="flex justify-center gap-2">
                  <Button 
                    onClick={() => setActiveTab('manager')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First KPI
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab('showcase')}
                    className="flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Browse Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. Browse Templates</h4>
              <p className="text-muted-foreground">
                Explore our gallery of professionally designed KPI cards with various styles and layouts.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Customize Design</h4>
              <p className="text-muted-foreground">
                Use the KPI Manager to personalize colors, icons, formats, and add your own data.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">3. Deploy Live</h4>
              <p className="text-muted-foreground">
                Your KPIs automatically sync to your dashboard with real-time data updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}