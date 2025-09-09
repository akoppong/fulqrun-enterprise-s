import { useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Plug,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Link,
  Zap,
  Calendar,
  MessageSquare,
  FileText,
  CreditCard,
  Users,
  BarChart3,
  Globe,
  Shield,
  Clock,
  Activity
} from '@phosphor-icons/react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'productivity' | 'analytics' | 'finance' | 'sales' | 'security';
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastSync?: Date;
  config: IntegrationConfig;
  features: string[];
  authType: 'oauth' | 'api_key' | 'webhook' | 'basic';
  healthScore: number;
  usage: {
    requests: number;
    errors: number;
    lastRequest?: Date;
  };
}

interface IntegrationConfig {
  enabled: boolean;
  apiKey?: string;
  webhookUrl?: string;
  settings: { [key: string]: any };
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  filters: string[];
}

interface WebhookEvent {
  id: string;
  integrationId: string;
  event: string;
  payload: any;
  timestamp: Date;
  status: 'pending' | 'processed' | 'failed';
  retryCount: number;
}

const availableIntegrations: Omit<Integration, 'status' | 'config' | 'healthScore' | 'usage' | 'lastSync'>[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and deal notifications',
    category: 'communication',
    icon: 'MessageSquare',
    features: [
      'Real-time deal notifications',
      'Stage change alerts',
      'Team mentions and updates',
      'Custom bot commands',
      'Channel integrations'
    ],
    authType: 'oauth'
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Enterprise communication and collaboration',
    category: 'communication',
    icon: 'Users',
    features: [
      'Deal update notifications',
      'Meeting integration',
      'File sharing',
      'Team collaboration',
      'Bot interactions'
    ],
    authType: 'oauth'
  },
  {
    id: 'docusign',
    name: 'DocuSign',
    description: 'Digital contract signing and document management',
    category: 'productivity',
    icon: 'FileText',
    features: [
      'Contract automation',
      'Digital signatures',
      'Document status tracking',
      'Template management',
      'Audit trails'
    ],
    authType: 'oauth'
  },
  {
    id: 'gong',
    name: 'Gong.io',
    description: 'Conversation analytics and call intelligence',
    category: 'analytics',
    icon: 'BarChart3',
    features: [
      'Call recording analysis',
      'Deal intelligence',
      'Competitor mentions',
      'Talk time analysis',
      'Keyword tracking'
    ],
    authType: 'api_key'
  },
  {
    id: 'chorus',
    name: 'Chorus (ZoomInfo)',
    description: 'Revenue intelligence and conversation analytics',
    category: 'analytics',
    icon: 'Activity',
    features: [
      'Call transcription',
      'Deal coaching insights',
      'Competitive intelligence',
      'Performance analytics',
      'Automated note-taking'
    ],
    authType: 'oauth'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and subscription management',
    category: 'finance',
    icon: 'CreditCard',
    features: [
      'Payment tracking',
      'Subscription management',
      'Revenue analytics',
      'Churn analysis',
      'Automated invoicing'
    ],
    authType: 'api_key'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and financial management',
    category: 'finance',
    icon: 'DollarSign',
    features: [
      'Invoice synchronization',
      'Payment tracking',
      'Financial reporting',
      'Expense management',
      'Tax preparation'
    ],
    authType: 'oauth'
  },
  {
    id: 'calendly',
    name: 'Calendly',
    description: 'Meeting scheduling and calendar management',
    category: 'productivity',
    icon: 'Calendar',
    features: [
      'Automated scheduling',
      'Meeting confirmations',
      'Calendar sync',
      'Booking analytics',
      'Custom availability'
    ],
    authType: 'oauth'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing automation and CRM sync',
    category: 'sales',
    icon: 'Users',
    features: [
      'Lead synchronization',
      'Email marketing',
      'Contact management',
      'Deal pipeline sync',
      'Analytics integration'
    ],
    authType: 'api_key'
  },
  {
    id: 'okta',
    name: 'Okta',
    description: 'Identity and access management',
    category: 'security',
    icon: 'Shield',
    features: [
      'Single sign-on (SSO)',
      'User provisioning',
      'Access control',
      'Security policies',
      'Audit logging'
    ],
    authType: 'oauth'
  }
];

export function IntegrationHub() {
  const [integrations, setIntegrations] = useKV<Integration[]>('integrations', []);
  const [webhookEvents, setWebhookEvents] = useKV<WebhookEvent[]>('webhook-events', []);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      MessageSquare, Users, FileText, BarChart3, Activity, CreditCard, 
      DollarSign, Calendar, Shield, Globe, Clock
    };
    const IconComponent = icons[iconName] || Plug;
    return IconComponent;
  };

  const addIntegration = useCallback((template: typeof availableIntegrations[0]) => {
    const newIntegration: Integration = {
      ...template,
      status: 'disconnected',
      config: {
        enabled: false,
        settings: {},
        syncFrequency: 'hourly',
        filters: []
      },
      healthScore: 0,
      usage: {
        requests: 0,
        errors: 0
      }
    };

    setIntegrations(current => [...current, newIntegration]);
    setSelectedIntegration(newIntegration);
    setShowAddDialog(false);
    toast.success(`${template.name} integration added`);
  }, [setIntegrations]);

  const updateIntegration = useCallback((updatedIntegration: Integration) => {
    setIntegrations(current =>
      current.map(integration =>
        integration.id === updatedIntegration.id ? updatedIntegration : integration
      )
    );
    setSelectedIntegration(updatedIntegration);
  }, [setIntegrations]);

  const removeIntegration = useCallback((integrationId: string) => {
    setIntegrations(current => current.filter(i => i.id !== integrationId));
    if (selectedIntegration?.id === integrationId) {
      setSelectedIntegration(null);
    }
    toast.success('Integration removed');
  }, [setIntegrations, selectedIntegration]);

  const connectIntegration = useCallback(async (integration: Integration) => {
    setIsConfiguring(true);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const connectedIntegration = {
        ...integration,
        status: 'connected' as const,
        lastSync: new Date(),
        healthScore: Math.random() * 40 + 60, // 60-100
        config: {
          ...integration.config,
          enabled: true
        }
      };
      
      updateIntegration(connectedIntegration);
      toast.success(`${integration.name} connected successfully`);
    } catch (error) {
      const errorIntegration = {
        ...integration,
        status: 'error' as const
      };
      updateIntegration(errorIntegration);
      toast.error(`Failed to connect ${integration.name}`);
    } finally {
      setIsConfiguring(false);
    }
  }, [updateIntegration]);

  const disconnectIntegration = useCallback((integration: Integration) => {
    const disconnectedIntegration = {
      ...integration,
      status: 'disconnected' as const,
      healthScore: 0,
      config: {
        ...integration.config,
        enabled: false
      }
    };
    
    updateIntegration(disconnectedIntegration);
    toast.success(`${integration.name} disconnected`);
  }, [updateIntegration]);

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'configuring': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: Integration['category']) => {
    switch (category) {
      case 'communication': return MessageSquare;
      case 'productivity': return FileText;
      case 'analytics': return BarChart3;
      case 'finance': return CreditCard;
      case 'sales': return Users;
      case 'security': return Shield;
      default: return Plug;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Hub v1.0</h2>
          <p className="text-muted-foreground">Connect external tools and automate your sales workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync All
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Available Integrations</DialogTitle>
              </DialogHeader>
              <IntegrationMarketplace 
                available={availableIntegrations}
                installed={integrations}
                onAdd={addIntegration}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Plug className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-sm text-muted-foreground">Total Integrations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
            <p className="text-sm text-muted-foreground">Connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">
              {integrations.reduce((acc, i) => acc + i.usage.requests, 0)}
            </div>
            <p className="text-sm text-muted-foreground">API Requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">
              {integrations.reduce((acc, i) => acc + i.usage.errors, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Integrations List */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Installed Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {integrations.map(integration => {
                    const IconComponent = getIconComponent(integration.icon);
                    return (
                      <div
                        key={integration.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedIntegration?.id === integration.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-8 w-8 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{integration.name}</h3>
                              <Badge 
                                className={`text-xs ${getStatusColor(integration.status)}`}
                                variant="secondary"
                              >
                                {integration.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {integration.description}
                            </p>
                            {integration.status === 'connected' && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-xs text-muted-foreground">
                                  Health: {Math.round(integration.healthScore)}%
                                </div>
                                {integration.lastSync && (
                                  <div className="text-xs text-muted-foreground">
                                    Last sync: {new Date(integration.lastSync).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {integrations.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Plug className="h-12 w-12 mx-auto mb-4" />
                      <p>No integrations installed yet</p>
                      <p className="text-sm mt-2">Add your first integration to get started</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Integration Details */}
        <div className="lg:col-span-7">
          {selectedIntegration ? (
            <IntegrationDetails
              integration={selectedIntegration}
              onUpdate={updateIntegration}
              onConnect={connectIntegration}
              onDisconnect={disconnectIntegration}
              onRemove={removeIntegration}
              isConfiguring={isConfiguring}
              webhookEvents={webhookEvents.filter(e => e.integrationId === selectedIntegration.id)}
            />
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>Select an integration to configure</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function IntegrationMarketplace({
  available,
  installed,
  onAdd
}: {
  available: typeof availableIntegrations;
  installed: Integration[];
  onAdd: (template: typeof availableIntegrations[0]) => void;
}) {
  const installedIds = new Set(installed.map(i => i.id));
  const categories = Array.from(new Set(available.map(i => i.category)));

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'communication': return MessageSquare;
      case 'productivity': return FileText;
      case 'analytics': return BarChart3;
      case 'finance': return CreditCard;
      case 'sales': return Users;
      case 'security': return Shield;
      default: return Plug;
    }
  };

  return (
    <div className="space-y-6">
      {categories.map(category => {
        const CategoryIcon = getCategoryIcon(category);
        const categoryIntegrations = available.filter(i => i.category === category);

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <CategoryIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold capitalize">{category}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryIntegrations.map(integration => {
                const IconComponent = integration.icon === 'MessageSquare' ? MessageSquare : 
                  integration.icon === 'Users' ? Users :
                  integration.icon === 'FileText' ? FileText :
                  integration.icon === 'BarChart3' ? BarChart3 :
                  integration.icon === 'Activity' ? Activity :
                  integration.icon === 'CreditCard' ? CreditCard :
                  integration.icon === 'DollarSign' ? DollarSign :
                  integration.icon === 'Calendar' ? Calendar :
                  integration.icon === 'Shield' ? Shield : Plug;
                
                const isInstalled = installedIds.has(integration.id);

                return (
                  <Card key={integration.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-8 w-8 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{integration.name}</h4>
                            <Badge variant={integration.authType === 'oauth' ? 'default' : 'secondary'} className="text-xs">
                              {integration.authType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {integration.description}
                          </p>
                          
                          <div className="mt-3">
                            <p className="text-xs font-medium mb-1">Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {integration.features.slice(0, 3).map((feature, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {integration.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{integration.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            className="w-full mt-3"
                            disabled={isInstalled}
                            onClick={() => onAdd(integration)}
                          >
                            {isInstalled ? 'Already Installed' : 'Add Integration'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IntegrationDetails({
  integration,
  onUpdate,
  onConnect,
  onDisconnect,
  onRemove,
  isConfiguring,
  webhookEvents
}: {
  integration: Integration;
  onUpdate: (integration: Integration) => void;
  onConnect: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
  onRemove: (integrationId: string) => void;
  isConfiguring: boolean;
  webhookEvents: WebhookEvent[];
}) {
  const IconComponent = getIconComponent(integration.icon);
  
  function getIconComponent(iconName: string) {
    const icons: { [key: string]: any } = {
      MessageSquare, Users, FileText, BarChart3, Activity, CreditCard,
      DollarSign, Calendar, Shield, Globe, Clock
    };
    return icons[iconName] || Plug;
  }

  const updateConfig = useCallback((newConfig: Partial<IntegrationConfig>) => {
    onUpdate({
      ...integration,
      config: {
        ...integration.config,
        ...newConfig
      }
    });
  }, [integration, onUpdate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className="h-8 w-8" />
            <div>
              <CardTitle className="flex items-center gap-2">
                {integration.name}
                <Badge className={getStatusColor(integration.status)} variant="secondary">
                  {integration.status}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {integration.description}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {integration.status === 'connected' ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDisconnect(integration)}
              >
                Disconnect
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={() => onConnect(integration)}
                disabled={isConfiguring}
              >
                {isConfiguring ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRemove(integration.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enabled">Enable Integration</Label>
                  <Switch
                    id="enabled"
                    checked={integration.config.enabled}
                    onCheckedChange={(enabled) => updateConfig({ enabled })}
                  />
                </div>

                <div>
                  <Label htmlFor="sync-frequency">Sync Frequency</Label>
                  <Select 
                    value={integration.config.syncFrequency} 
                    onValueChange={(syncFrequency: any) => updateConfig({ syncFrequency })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {integration.authType === 'api_key' && (
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="Enter API key"
                      value={integration.config.apiKey || ''}
                      onChange={(e) => updateConfig({ apiKey: e.target.value })}
                    />
                  </div>
                )}

                {integration.authType === 'webhook' && (
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-webhook-url.com"
                      value={integration.config.webhookUrl || ''}
                      onChange={(e) => updateConfig({ webhookUrl: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="filters">Event Filters</Label>
                  <Textarea
                    id="filters"
                    placeholder="Enter filters (one per line)"
                    value={integration.config.filters.join('\n')}
                    onChange={(e) => updateConfig({ 
                      filters: e.target.value.split('\n').filter(f => f.trim()) 
                    })}
                    rows={4}
                  />
                </div>

                {integration.status === 'connected' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Connected</span>
                    </div>
                    <div className="text-sm text-green-800 space-y-1">
                      <div>Health Score: {Math.round(integration.healthScore)}%</div>
                      {integration.lastSync && (
                        <div>Last Sync: {integration.lastSync.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-6">
            <div>
              <h4 className="font-medium mb-3">Available Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integration.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Integration Benefits</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Automated data synchronization</li>
                <li>• Real-time notifications and updates</li>
                <li>• Reduced manual data entry</li>
                <li>• Improved workflow efficiency</li>
                <li>• Enhanced reporting capabilities</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{integration.usage.requests}</div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{integration.usage.errors}</div>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {integration.usage.requests > 0 
                      ? Math.round((1 - integration.usage.errors / integration.usage.requests) * 100)
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 border rounded">
                    <Activity className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm">Successful sync completed</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(Date.now() - i * 3600000).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4 mt-6">
            <div>
              <h4 className="font-medium mb-3">Webhook Events</h4>
              {webhookEvents.length > 0 ? (
                <div className="space-y-2">
                  {webhookEvents.slice(0, 10).map(event => (
                    <div key={event.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{event.event}</span>
                        <Badge 
                          variant={event.status === 'processed' ? 'default' : 
                                   event.status === 'failed' ? 'destructive' : 'secondary'}
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {event.timestamp.toLocaleString()}
                        {event.retryCount > 0 && ` • ${event.retryCount} retries`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Globe className="h-8 w-8 mx-auto mb-2" />
                  <p>No webhook events yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: Integration['status']) {
  switch (status) {
    case 'connected': return 'text-green-600 bg-green-100';
    case 'error': return 'text-red-600 bg-red-100';
    case 'configuring': return 'text-yellow-600 bg-yellow-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}