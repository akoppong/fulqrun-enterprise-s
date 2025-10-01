import { useState } from 'react';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { DashboardView } from './Dashboard';
import { User } from '@/lib/types';

interface CollapsibleSidebarDemoProps {
  user: User;
}

export function CollapsibleSidebarDemo({ user }: CollapsibleSidebarDemoProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold">
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)} View
            </h1>
            <p className="text-sm text-muted-foreground">
              Collapsible sidebar demo - click the arrow to toggle
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Sidebar: {isCollapsed ? 'Collapsed' : 'Expanded'}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-bold mb-4">🎉 Collapsible Sidebar Demo</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-semibold text-primary mb-2">✨ Enhanced UX Features</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Smooth transition animations</li>
                      <li>• Intelligent icon-only mode when collapsed</li>
                      <li>• Tooltips for collapsed navigation items</li>
                      <li>• Persistent state with localStorage</li>
                      <li>• Responsive design for mobile and desktop</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">🚀 Improved Performance</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• More screen space for content</li>
                      <li>• Better information hierarchy</li>
                      <li>• Faster navigation with icon shortcuts</li>
                      <li>• Adaptive layout system</li>
                      <li>• Enhanced accessibility support</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-800 mb-3">🎯 Current View: {currentView}</h3>
                  <p className="text-blue-700 mb-4">
                    Navigate through different sections using the sidebar. Each item shows detailed tooltips 
                    when the sidebar is collapsed, maintaining full functionality in a compact space.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{isCollapsed ? '64px' : '320px'}</div>
                      <div className="text-xs text-muted-foreground">Sidebar Width</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">300ms</div>
                      <div className="text-xs text-muted-foreground">Transition Duration</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">6</div>
                      <div className="text-xs text-muted-foreground">Core Navigation Items</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">💡 How to Use</h3>
                  <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                    <li>Click the arrow button in the sidebar header to toggle collapse/expand</li>
                    <li>When collapsed, hover over icons to see detailed tooltips</li>
                    <li>The layout automatically adjusts to provide maximum content space</li>
                    <li>Your preference is saved and will persist across sessions</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}