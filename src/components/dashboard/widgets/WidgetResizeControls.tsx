import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Move,
  Maximize,
  Minimize,
  Trash,
  Settings,
  Palette,
  Layout,
  Grid3x3,
  ArrowsOut,
  ArrowsIn,
  Eye,
  EyeSlash,
  Star
} from '@phosphor-icons/react';

export interface WidgetSize {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetResizeControlsProps {
  itemId: string;
  itemName: string;
  currentSize: WidgetSize;
  visible?: boolean;
  onResize: (itemId: string, sizeChange: 'increase' | 'decrease' | 'custom', customSize?: WidgetSize) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onVisibilityToggle?: (itemId: string, visible: boolean) => void;
  onCustomize?: (itemId: string, customizations: any) => void;
  className?: string;
}

const PRESET_SIZES = [
  { name: 'Small', w: 2, h: 2, icon: <ArrowsIn className="h-3 w-3" /> },
  { name: 'Medium', w: 4, h: 3, icon: <Grid3x3 className="h-3 w-3" /> },
  { name: 'Large', w: 6, h: 4, icon: <ArrowsOut className="h-3 w-3" /> },
  { name: 'Wide', w: 8, h: 2, icon: <Layout className="h-3 w-3" /> },
  { name: 'Tall', w: 3, h: 6, icon: <Layout className="h-3 w-3" /> },
];

export function WidgetResizeControls({
  itemId,
  itemName,
  currentSize,
  visible = true,
  onResize,
  onDelete,
  onVisibilityToggle,
  onCustomize,
  className = ''
}: WidgetResizeControlsProps) {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState([currentSize.w]);
  const [customHeight, setCustomHeight] = useState([currentSize.h]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePresetSize = (preset: typeof PRESET_SIZES[0]) => {
    onResize(itemId, 'custom', { 
      w: preset.w, 
      h: preset.h,
      minW: currentSize.minW,
      minH: currentSize.minH,
      maxW: currentSize.maxW,
      maxH: currentSize.maxH
    });
    setIsConfigDialogOpen(false);
  };

  const handleCustomResize = () => {
    onResize(itemId, 'custom', {
      w: customWidth[0],
      h: customHeight[0],
      minW: currentSize.minW,
      minH: currentSize.minH,
      maxW: currentSize.maxW,
      maxH: currentSize.maxH
    });
    setIsConfigDialogOpen(false);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Quick Resize Controls */}
      <Button
        variant="secondary"
        size="sm"
        className="h-7 w-7 p-0 bg-background/95 backdrop-blur-sm border shadow-sm hover:scale-105 transition-transform"
        onClick={() => onResize(itemId, 'decrease')}
        title="Make smaller"
        disabled={currentSize.w <= (currentSize.minW || 2) && currentSize.h <= (currentSize.minH || 1)}
      >
        <Minimize className="h-3 w-3" />
      </Button>

      <Button
        variant="secondary"
        size="sm"
        className="h-7 w-7 p-0 bg-background/95 backdrop-blur-sm border shadow-sm hover:scale-105 transition-transform"
        onClick={() => onResize(itemId, 'increase')}
        title="Make larger"
        disabled={currentSize.w >= (currentSize.maxW || 8) && currentSize.h >= (currentSize.maxH || 6)}
      >
        <Maximize className="h-3 w-3" />
      </Button>

      {/* Advanced Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 w-7 p-0 bg-background/95 backdrop-blur-sm border shadow-sm hover:scale-105 transition-transform"
            title="Advanced settings"
          >
            <Settings className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Resize "{itemName}"
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Current Size Display */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Current Size</span>
              <Badge variant="outline">
                {currentSize.w} × {currentSize.h}
              </Badge>
            </div>

            {/* Preset Sizes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SIZES.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 h-auto p-3"
                    onClick={() => handlePresetSize(preset)}
                  >
                    {preset.icon}
                    <div className="text-left">
                      <div className="text-sm font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.w}×{preset.h}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Size Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Custom Size</Label>
                <Switch
                  checked={showAdvanced}
                  onCheckedChange={setShowAdvanced}
                />
              </div>
              
              {showAdvanced && (
                <div className="space-y-4 p-3 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Width: {customWidth[0]} columns</Label>
                    </div>
                    <Slider
                      value={customWidth}
                      onValueChange={setCustomWidth}
                      min={currentSize.minW || 1}
                      max={currentSize.maxW || 12}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Height: {customHeight[0]} rows</Label>
                    </div>
                    <Slider
                      value={customHeight}
                      onValueChange={setCustomHeight}
                      min={currentSize.minH || 1}
                      max={currentSize.maxH || 8}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={handleCustomResize}
                    size="sm"
                    className="w-full"
                  >
                    Apply Custom Size
                  </Button>
                </div>
              )}
            </div>

            {/* Additional Options */}
            {(onVisibilityToggle || onCustomize) && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-sm font-medium">Widget Options</Label>
                <div className="space-y-2">
                  {onVisibilityToggle && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {visible ? <Eye className="h-4 w-4" /> : <EyeSlash className="h-4 w-4" />}
                        <span className="text-sm">Visibility</span>
                      </div>
                      <Switch
                        checked={visible}
                        onCheckedChange={(checked) => onVisibilityToggle(itemId, checked)}
                      />
                    </div>
                  )}
                  
                  {onCustomize && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        onCustomize(itemId, {});
                        setIsConfigDialogOpen(false);
                      }}
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Customize Appearance
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfigDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visibility Toggle */}
      {onVisibilityToggle && (
        <Button
          variant="secondary"
          size="sm"
          className={`h-7 w-7 p-0 bg-background/95 backdrop-blur-sm border shadow-sm hover:scale-105 transition-transform ${
            !visible ? 'opacity-50' : ''
          }`}
          onClick={() => onVisibilityToggle(itemId, !visible)}
          title={visible ? "Hide widget" : "Show widget"}
        >
          {visible ? <Eye className="h-3 w-3" /> : <EyeSlash className="h-3 w-3" />}
        </Button>
      )}

      {/* Delete Button */}
      <Button
        variant="destructive"
        size="sm"
        className="h-7 w-7 p-0 bg-background/95 backdrop-blur-sm border shadow-sm hover:scale-105 transition-transform"
        onClick={() => onDelete(itemId, itemName)}
        title="Remove widget"
      >
        <Trash className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Drag Handle Component
export function WidgetDragHandle({ className = '' }: { className?: string }) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className={`h-7 w-7 p-0 bg-background/95 backdrop-blur-sm border shadow-sm drag-handle cursor-move hover:scale-105 transition-transform ${className}`}
      title="Drag to move"
    >
      <Move className="h-3 w-3" />
    </Button>
  );
}

// Widget Info Badge
export function WidgetInfoBadge({ 
  width, 
  height, 
  className = '' 
}: { 
  width: number; 
  height: number; 
  className?: string; 
}) {
  return (
    <Badge 
      variant="secondary" 
      className={`text-xs bg-background/95 backdrop-blur-sm pointer-events-none select-none ${className}`}
    >
      {width}×{height}
    </Badge>
  );
}