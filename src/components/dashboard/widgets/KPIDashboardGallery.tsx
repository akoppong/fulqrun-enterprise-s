import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash,
  Download,
  Upload,
  Star,
  Target,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  TrendingUp,
  Award,
  Settings,
  Move,
  Maximize
} from '@phosphor-icons/react';
import { PersonalizedKPICard, PersonalizedKPIData, generateSampleKPIData } from './PersonalizedKPICard';
import { KPIBuilderDialog } from './KPIBuilderDialog';
import { toast } from 'sonner';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface KPIDashboardGalleryProps {
  onAddToLayout?: (kpi: PersonalizedKPIData) => void;
}

const CATEGORY_FILTERS = [
  { label: 'All KPIs', value: 'all', icon: Grid },
  { label: 'Sales', value: 'sales', icon: DollarSign },
  { label: 'Performance', value: 'performance', icon: TrendingUp },
  { label: 'Team', value: 'team', icon: Users },
  { label: 'Activity', value: 'activity', icon: Activity },
  { label: 'Targets', value: 'targets', icon: Target },
  { label: 'Achievements', value: 'achievements', icon: Award },
];

const VIEW_MODES = [
  { label: 'Resizable Grid', value: 'grid', icon: Grid },
  { label: 'List View', value: 'list', icon: List },
];

export function KPIDashboardGallery({ onAddToLayout }: KPIDashboardGalleryProps) {
  const [customKPIs, setCustomKPIs] = useKV<PersonalizedKPIData[]>('custom-kpis', []);
  const [favoriteKPIs, setFavoriteKPIs] = useKV<string[]>('favorite-kpis', []);
  
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<PersonalizedKPIData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTab, setSelectedTab] = useState('gallery');

  // Combine sample and custom KPIs
  const sampleKPIs = useMemo(() => generateSampleKPIData(), []);
  const allKPIs = useMemo(() => [...sampleKPIs, ...customKPIs], [sampleKPIs, customKPIs]);

  // Filter KPIs based on search and category
  const filteredKPIs = useMemo(() => {
    return allKPIs.filter(kpi => {
      const matchesSearch = kpi.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (kpi.subtitle && kpi.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (categoryFilter === 'all') return matchesSearch;
      
      // Simple category matching based on title and icon
      const categoryMatches = {
        sales: kpi.icon === 'dollar' || kpi.title.toLowerCase().includes('revenue') || kpi.title.toLowerCase().includes('sales'),
        performance: kpi.icon === 'activity' || kpi.title.toLowerCase().includes('performance') || kpi.title.toLowerCase().includes('conversion'),
        team: kpi.icon === 'users' || kpi.title.toLowerCase().includes('team'),
        activity: kpi.icon === 'activity' || kpi.title.toLowerCase().includes('activity'),
        targets: kpi.icon === 'target' || kpi.showProgress,
        achievements: kpi.icon === 'award' || kpi.icon === 'star',
      };
      
      return matchesSearch && (categoryMatches[categoryFilter as keyof typeof categoryMatches] || false);
    });
  }, [allKPIs, searchTerm, categoryFilter]);

  const handleCreateKPI = (kpiData: PersonalizedKPIData) => {
    setCustomKPIs(current => [...current, kpiData]);
    setIsBuilderOpen(false);
  };

  const handleUpdateKPI = (kpiData: PersonalizedKPIData) => {
    setCustomKPIs(current => 
      current.map(kpi => kpi.id === kpiData.id ? kpiData : kpi)
    );
    setEditingKPI(null);
    setIsBuilderOpen(false);
  };

  const handleEditKPI = (kpi: PersonalizedKPIData) => {
    setEditingKPI(kpi);
    setIsBuilderOpen(true);
  };

  const handleDeleteKPI = (kpiId: string) => {
    setCustomKPIs(current => current.filter(kpi => kpi.id !== kpiId));
    setFavoriteKPIs(current => current.filter(id => id !== kpiId));
    toast.success('KPI deleted successfully');
  };

  const handleToggleFavorite = (kpiId: string) => {
    setFavoriteKPIs(current => {
      const isFavorite = current.includes(kpiId);
      if (isFavorite) {
        toast.success('Removed from favorites');
        return current.filter(id => id !== kpiId);
      } else {
        toast.success('Added to favorites');
        return [...current, kpiId];
      }
    });
  };

  const handleExportKPIs = () => {
    const dataStr = JSON.stringify(customKPIs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-kpis.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('KPIs exported successfully');
  };

  const handleImportKPIs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedKPIs = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedKPIs)) {
          setCustomKPIs(current => [...current, ...importedKPIs]);
          toast.success(`Imported ${importedKPIs.length} KPIs successfully`);
        } else {
          toast.error('Invalid KPI file format');
        }
      } catch (error) {
        toast.error('Failed to import KPIs');
      }
    };
    reader.readAsText(file);
  };

  const renderResizableKPICard = (kpi: PersonalizedKPIData, isCustom: boolean) => {
    const isFavorite = favoriteKPIs.includes(kpi.id);

    return (
      <div key={kpi.id} className="relative group h-full">
        <PersonalizedKPICard 
          data={kpi}
          variant="compact"
          className="h-full transition-all duration-200 group-hover:shadow-lg"
        />
        
        {/* Action Overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
            onClick={() => handleToggleFavorite(kpi.id)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`h-3 w-3 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          </Button>
          
          {onAddToLayout && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
              onClick={() => onAddToLayout(kpi)}
              title="Add to dashboard"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}

          {isCustom && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                onClick={() => handleEditKPI(kpi)}
                title="Edit KPI"
              >
                <Edit className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white text-destructive hover:text-destructive"
                onClick={() => handleDeleteKPI(kpi.id)}
                title="Delete KPI"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2">
          {isFavorite && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
              Favorite
            </Badge>
          )}
        </div>

        {/* Resize Handle */}
        <div className="absolute bottom-0 right-0 w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity cursor-se-resize">
          <div className="w-full h-full bg-gradient-to-tl from-primary/60 to-transparent rounded-tl-lg flex items-end justify-end">
            <div className="w-4 h-4 flex flex-col items-end justify-end gap-0.5 p-0.5">
              <div className="w-2 h-0.5 bg-primary/90 rounded-full" />
              <div className="w-1.5 h-0.5 bg-primary/90 rounded-full" />
              <div className="w-1 h-0.5 bg-primary/90 rounded-full" />
            </div>
          </div>
        </div>

        {/* Size indicator */}
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
            <Maximize className="h-3 w-3 mr-1" />
            Resizable
          </Badge>
        </div>
      </div>
    );
  };
    const isFavorite = favoriteKPIs.includes(kpi.id);

    return (
      <div key={kpi.id} className="relative group">
        <PersonalizedKPICard 
          data={kpi}
          variant="compact"
          className="transition-all duration-200 group-hover:shadow-lg"
        />
        
        {/* Action Overlay */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
            onClick={() => handleToggleFavorite(kpi.id)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`h-3 w-3 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          </Button>
          
          {onAddToLayout && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
              onClick={() => onAddToLayout(kpi)}
              title="Add to dashboard"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}

          {isCustom && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
                onClick={() => handleEditKPI(kpi)}
                title="Edit KPI"
              >
                <Edit className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 bg-white/90 hover:bg-white text-destructive hover:text-destructive"
                onClick={() => handleDeleteKPI(kpi.id)}
                title="Delete KPI"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2">
          {isFavorite && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
              Favorite
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      {filteredKPIs.map(kpi => {
        const isCustom = customKPIs.some(custom => custom.id === kpi.id);
        const isFavorite = favoriteKPIs.includes(kpi.id);
        
        return (
          <Card key={kpi.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16">
                  <PersonalizedKPICard 
                    data={kpi}
                    variant="minimal"
                    size="sm"
                    className="w-full h-full"
                  />
                </div>
                
                <div>
                  <h3 className="font-medium">{kpi.title}</h3>
                  {kpi.subtitle && (
                    <p className="text-sm text-muted-foreground">{kpi.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {isFavorite && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                        Favorite
                      </Badge>
                    )}
                    {isCustom && (
                      <Badge variant="outline" className="text-xs">Custom</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFavorite(kpi.id)}
                  className={isFavorite ? 'text-yellow-500' : ''}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500' : ''}`} />
                </Button>
                
                {onAddToLayout && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddToLayout(kpi)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Dashboard
                  </Button>
                )}

                {isCustom && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditKPI(kpi)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteKPI(kpi.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderGridView = () => {
    // Create grid layout for each KPI card with resize capabilities
    const generateGridItems = () => {
      return filteredKPIs.map((kpi, index) => {
        const isCustom = customKPIs.some(custom => custom.id === kpi.id);
        return {
          i: kpi.id,
          x: (index % 4) * 3,
          y: Math.floor(index / 4) * 3,
          w: 3,
          h: 3,
          minW: 2,
          minH: 2,
          maxW: 6,
          maxH: 6,
          kpi,
          isCustom
        };
      });
    };

    const gridItems = generateGridItems();

    return (
      <div className="min-h-[400px] relative">
        <ResponsiveGridLayout
          className="layout"
          layouts={{
            lg: gridItems,
            md: gridItems,
            sm: gridItems,
            xs: gridItems,
            xxs: gridItems,
          }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          isDraggable={false}
          isResizable={true}
          useCSSTransforms={true}
          preventCollision={false}
          autoSize={true}
          resizeHandles={['se']}
          compactType="vertical"
        >
          {gridItems.map(({ kpi, isCustom }) => 
            renderResizableKPICard(kpi, isCustom)
          )}
        </ResponsiveGridLayout>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">KPI Gallery</h2>
          <p className="text-muted-foreground">
            Browse, customize, and add personalized KPI cards to your dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsBuilderOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create KPI
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({favoriteKPIs.length})
          </TabsTrigger>
          <TabsTrigger value="custom">
            Custom ({customKPIs.length})
          </TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search KPIs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_FILTERS.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>
                    <div className="flex items-center gap-2">
                      <filter.icon className="h-4 w-4" />
                      {filter.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              {VIEW_MODES.map(mode => (
                <Button
                  key={mode.value}
                  variant={viewMode === mode.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode.value as 'grid' | 'list')}
                  className="h-8 px-3"
                >
                  <mode.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredKPIs.length} KPIs
              {categoryFilter !== 'all' && ` in ${CATEGORY_FILTERS.find(f => f.value === categoryFilter)?.label}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>

          {/* Help tip for resizable grid */}
          {viewMode === 'grid' && filteredKPIs.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Maximize className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Resize Tip:</span>
                <span className="text-muted-foreground">
                  Hover over cards and drag the resize handle in the bottom-right corner to adjust size
                </span>
              </div>
            </div>
          )}

          {/* KPI Grid/List */}
          {filteredKPIs.length > 0 ? (
            viewMode === 'grid' ? renderGridView() : renderListView()
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No KPIs Found</h3>
                <p className="text-muted-foreground mb-4">
                  No KPIs match your current search and filter criteria
                </p>
                {searchTerm || categoryFilter !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={() => setIsBuilderOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First KPI
                  </Button>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          {favoriteKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allKPIs
                .filter(kpi => favoriteKPIs.includes(kpi.id))
                .map(kpi => {
                  const isCustom = customKPIs.some(custom => custom.id === kpi.id);
                  return renderKPICard(kpi, isCustom);
                })}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Favorite KPIs</h3>
                <p className="text-muted-foreground mb-4">
                  Add KPIs to your favorites to access them quickly
                </p>
                <Button onClick={() => setSelectedTab('gallery')}>
                  Browse Gallery
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {customKPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {customKPIs.map(kpi => renderKPICard(kpi, true))}
            </div>
          ) : (
            <Card className="p-8">
              <div className="text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Custom KPIs</h3>
                <p className="text-muted-foreground mb-4">
                  Create your own personalized KPI cards with custom metrics
                </p>
                <Button onClick={() => setIsBuilderOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom KPI
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Export KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your custom KPIs to share or backup
                </p>
                <Button onClick={handleExportKPIs} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export KPIs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Import KPIs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Import KPIs from a backup file
                </p>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportKPIs}
                    className="hidden"
                    id="import-kpis"
                  />
                  <Button 
                    onClick={() => document.getElementById('import-kpis')?.click()}
                    className="w-full"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import KPIs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total KPIs:</span>
                  <span className="font-medium">{allKPIs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Custom KPIs:</span>
                  <span className="font-medium">{customKPIs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Favorites:</span>
                  <span className="font-medium">{favoriteKPIs.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* KPI Builder Dialog */}
      <KPIBuilderDialog
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setEditingKPI(null);
        }}
        onSave={editingKPI ? handleUpdateKPI : handleCreateKPI}
        editingKPI={editingKPI}
      />
    </div>
  );
}