import { useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, Eye, Edit, Trash2, Grid } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { KPIDashboard, DashboardLayout, KPITarget, User } from '@/lib/types';
import { DraggableWidget } from './DraggableWidget';
import { KPIWidgetRenderer } from './KPIWidgetRenderer';
import { AdvancedKPIDashboard } from './AdvancedKPIDashboard';

interface KPIDashboardBuilderProps {
  currentUser: User;
  kpiTargets: KPITarget[];
}

export function KPIDashboardBuilder({ currentUser, kpiTargets }: KPIDashboardBuilderProps) {
  const [dashboards, setDashboards] = useKV<KPIDashboard[]>('kpi-dashboards', []);
  const [selectedDashboard, setSelectedDashboard] = useState<KPIDashboard | null>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [useAdvancedGrid, setUseAdvancedGrid] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form states
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardDescription, setNewDashboardDescription] = useState('');
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && selectedDashboard) {
      const activeIndex = selectedDashboard.layout.findIndex(item => item.kpiId === active.id);
      const overIndex = selectedDashboard.layout.findIndex(item => item.kpiId === over.id);

      const newLayout = arrayMove(selectedDashboard.layout, activeIndex, overIndex);
      
      const updatedDashboard = {
        ...selectedDashboard,
        layout: newLayout.map((item, index) => ({
          ...item,
          position: {
            ...item.position,
            y: index * 2, // Adjust vertical positioning
          }
        })),
        updatedAt: new Date(),
      };

      // Update dashboards array
      setDashboards(current => 
        current.map(dashboard => 
          dashboard.id === selectedDashboard.id ? updatedDashboard : dashboard
        )
      );
      
      setSelectedDashboard(updatedDashboard);
      toast.success('Dashboard layout updated');
    }
  }, [selectedDashboard, setDashboards]);

  const createDashboard = useCallback(() => {
    if (!newDashboardName.trim()) {
      toast.error('Dashboard name is required');
      return;
    }

    const newDashboard: KPIDashboard = {
      id: `dashboard-${Date.now()}`,
      name: newDashboardName,
      description: newDashboardDescription,
      ownerId: currentUser.id,
      kpiIds: selectedKPIs,
      layout: selectedKPIs.map((kpiId, index) => ({
        kpiId,
        position: {
          x: 0,
          y: index * 2,
          width: 6,
          height: 2,
        },
        chartType: 'number',
        displayOptions: {},
      })),
      filters: [],
      refreshInterval: 30,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDashboards(current => [...current, newDashboard]);
    setSelectedDashboard(newDashboard);
    setNewDashboardName('');
    setNewDashboardDescription('');
    setSelectedKPIs([]);
    setIsCreateDialogOpen(false);
    toast.success('Dashboard created successfully');
  }, [newDashboardName, newDashboardDescription, selectedKPIs, currentUser.id, setDashboards]);

  const updateWidgetType = useCallback((kpiId: string, chartType: DashboardLayout['chartType']) => {
    if (!selectedDashboard) return;

    const updatedDashboard = {
      ...selectedDashboard,
      layout: selectedDashboard.layout.map(item =>
        item.kpiId === kpiId ? { ...item, chartType } : item
      ),
      updatedAt: new Date(),
    };

    setDashboards(current =>
      current.map(dashboard =>
        dashboard.id === selectedDashboard.id ? updatedDashboard : dashboard
      )
    );
    
    setSelectedDashboard(updatedDashboard);
  }, [selectedDashboard, setDashboards]);

  const removeWidget = useCallback((kpiId: string) => {
    if (!selectedDashboard) return;

    const updatedDashboard = {
      ...selectedDashboard,
      kpiIds: selectedDashboard.kpiIds.filter(id => id !== kpiId),
      layout: selectedDashboard.layout.filter(item => item.kpiId !== kpiId),
      updatedAt: new Date(),
    };

    setDashboards(current =>
      current.map(dashboard =>
        dashboard.id === selectedDashboard.id ? updatedDashboard : dashboard
      )
    );
    
    setSelectedDashboard(updatedDashboard);
    toast.success('Widget removed');
  }, [selectedDashboard, setDashboards]);

  const deleteDashboard = useCallback((dashboardId: string) => {
    setDashboards(current => current.filter(d => d.id !== dashboardId));
    if (selectedDashboard?.id === dashboardId) {
      setSelectedDashboard(null);
    }
    toast.success('Dashboard deleted');
  }, [selectedDashboard, setDashboards]);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">KPI Dashboard Builder</h2>
          <p className="text-muted-foreground">
            Create and customize your KPI dashboards with drag-and-drop widgets
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dashboard-name">Dashboard Name</Label>
                  <Input
                    id="dashboard-name"
                    value={newDashboardName}
                    onChange={(e) => setNewDashboardName(e.target.value)}
                    placeholder="Enter dashboard name"
                  />
                </div>
                <div>
                  <Label htmlFor="dashboard-description">Description</Label>
                  <Input
                    id="dashboard-description"
                    value={newDashboardDescription}
                    onChange={(e) => setNewDashboardDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                  />
                </div>
                <div>
                  <Label>Select KPIs</Label>
                  <Select 
                    value={selectedKPIs.length > 0 ? selectedKPIs[0] : ''} 
                    onValueChange={(value) => {
                      if (value && !selectedKPIs.includes(value)) {
                        setSelectedKPIs([...selectedKPIs, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add KPIs to dashboard" />
                    </SelectTrigger>
                    <SelectContent>
                      {kpiTargets
                        .filter(kpi => !selectedKPIs.includes(kpi.id))
                        .map(kpi => (
                          <SelectItem key={kpi.id} value={kpi.id}>
                            {kpi.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {selectedKPIs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedKPIs.map(kpiId => {
                        const kpi = kpiTargets.find(k => k.id === kpiId);
                        return kpi ? (
                          <span
                            key={kpiId}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm flex items-center gap-1"
                          >
                            {kpi.name}
                            <button
                              onClick={() => setSelectedKPIs(prev => prev.filter(id => id !== kpiId))}
                              className="hover:bg-destructive hover:text-destructive-foreground rounded px-1"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createDashboard}>
                    Create Dashboard
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {selectedDashboard && (
            <div className="flex items-center gap-2">
              <Button
                variant={useAdvancedGrid ? "default" : "outline"}
                size="sm"
                onClick={() => setUseAdvancedGrid(!useAdvancedGrid)}
              >
                <Grid className="h-4 w-4 mr-2" />
                Advanced Grid
              </Button>
              <Button
                variant={isBuilderMode ? "default" : "outline"}
                onClick={() => setIsBuilderMode(!isBuilderMode)}
              >
                {isBuilderMode ? <Eye className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                {isBuilderMode ? 'Preview' : 'Edit'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard List */}
      {!selectedDashboard && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboards.map(dashboard => (
            <Card key={dashboard.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{dashboard.name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDashboard(dashboard);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDashboard(dashboard.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent onClick={() => setSelectedDashboard(dashboard)}>
                <p className="text-sm text-muted-foreground mb-2">{dashboard.description}</p>
                <p className="text-xs text-muted-foreground">
                  {dashboard.kpiIds.length} widgets • Updated {dashboard.updatedAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
          
          {dashboards.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Dashboards Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first KPI dashboard to start tracking performance
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dashboard Builder/Viewer */}
      {selectedDashboard && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">{selectedDashboard.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedDashboard.description}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedDashboard(null)}>
              ← Back to Dashboards
            </Button>
          </div>

          {isBuilderMode ? (
            useAdvancedGrid ? (
              <AdvancedKPIDashboard
                kpiTargets={kpiTargets}
                layout={selectedDashboard.layout}
                onLayoutChange={(newLayout) => {
                  const updatedDashboard = {
                    ...selectedDashboard,
                    layout: newLayout,
                    updatedAt: new Date(),
                  };

                  setDashboards(current =>
                    current.map(dashboard =>
                      dashboard.id === selectedDashboard.id ? updatedDashboard : dashboard
                    )
                  );
                  
                  setSelectedDashboard(updatedDashboard);
                }}
                isEditMode={true}
              />
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
              >
                <SortableContext
                  items={selectedDashboard.layout.map(item => item.kpiId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {selectedDashboard.layout.map(layoutItem => {
                      const kpi = kpiTargets.find(k => k.id === layoutItem.kpiId);
                      if (!kpi) return null;

                      return (
                        <DraggableWidget
                          key={layoutItem.kpiId}
                          id={layoutItem.kpiId}
                          kpi={kpi}
                          layoutItem={layoutItem}
                          onUpdateType={updateWidgetType}
                          onRemove={removeWidget}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )
          ) : (
            <AdvancedKPIDashboard
              kpiTargets={kpiTargets}
              layout={selectedDashboard.layout}
              onLayoutChange={(newLayout) => {
                const updatedDashboard = {
                  ...selectedDashboard,
                  layout: newLayout,
                  updatedAt: new Date(),
                };

                setDashboards(current =>
                  current.map(dashboard =>
                    dashboard.id === selectedDashboard.id ? updatedDashboard : dashboard
                  )
                );
                
                setSelectedDashboard(updatedDashboard);
              }}
              isEditMode={false}
            />
          )}
        </div>
      )}
    </div>
  );
}