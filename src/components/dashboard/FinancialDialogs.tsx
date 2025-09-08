import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { InventoryItem, POSTransaction } from '@/lib/types';
import { Package, ShoppingCart } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface InventoryFormData {
  sku: string;
  name: string;
  category: string;
  quantity: number | '';
  unitPrice: number | '';
  supplier: string;
}

interface POSFormData {
  transactionId: string;
  amount: number | '';
  paymentMethod: string;
  items: string;
  customerId: string;
}

interface AddInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => void;
}

interface AddPOSTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: Omit<POSTransaction, 'id' | 'timestamp'>) => void;
}

export function AddInventoryDialog({ open, onOpenChange, onSave }: AddInventoryDialogProps) {
  const [formData, setFormData] = useState<InventoryFormData>({
    sku: '',
    name: '',
    category: '',
    quantity: '',
    unitPrice: '',
    supplier: ''
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  const autoSave = useAutoSave({
    key: 'inventory_item_new',
    data: formData,
    enabled: open,
    onSave: () => {
      setHasUnsavedChanges(false);
    },
    onLoad: (savedData) => {
      if (savedData) {
        setFormData(savedData);
        toast.info('Draft restored from auto-save');
      }
    }
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        sku: '',
        name: '',
        category: '',
        quantity: '',
        unitPrice: '',
        supplier: ''
      });
      setHasUnsavedChanges(false);
      autoSave.clearDraft();
    }
  }, [open, autoSave]);

  // Track changes
  useEffect(() => {
    const hasData = formData.sku || formData.name || formData.supplier;
    setHasUnsavedChanges(hasData);
  }, [formData]);

  // Show draft restoration dialog
  useEffect(() => {
    if (open && autoSave.hasDraft) {
      setTimeout(() => {
        const shouldRestore = window.confirm(
          'A saved draft was found. Would you like to restore it and continue where you left off?'
        );
        
        if (shouldRestore && autoSave.savedDraft) {
          setFormData(autoSave.savedDraft);
          toast.success('Draft restored successfully');
        }
      }, 100);
    }
  }, [open, autoSave.hasDraft, autoSave.savedDraft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantity || !formData.unitPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSave({
      sku: formData.sku,
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      supplier: formData.supplier
    });

    // Clear draft after successful save
    autoSave.clearDraft();
    setHasUnsavedChanges(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to close? Your changes will be auto-saved as a draft.'
      );
      if (!shouldDiscard) return;
    }
    onOpenChange(false);
  };

  const updateField = (field: keyof InventoryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package size={20} />
              Add Inventory Item
            </DialogTitle>
            
            <AutoSaveIndicator
              enabled={open}
              lastSaved={autoSave.lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              onSaveNow={autoSave.saveNow}
              onClearDraft={autoSave.clearDraft}
              hasDraft={autoSave.hasDraft}
              className="text-sm"
            />
          </div>
          <DialogDescription>
            Add a new product or service to your inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => updateField('sku', e.target.value)}
                placeholder="e.g., PROD-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Enterprise License"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => updateField('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => updateField('supplier', e.target.value)}
                placeholder="e.g., Software Corp"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => updateField('unitPrice', e.target.value ? Number(e.target.value) : '')}
                placeholder="0.00"
                min="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddPOSTransactionDialog({ open, onOpenChange, onSave }: AddPOSTransactionDialogProps) {
  const [formData, setFormData] = useState<POSFormData>({
    transactionId: '',
    amount: '',
    paymentMethod: '',
    items: '',
    customerId: ''
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  const autoSave = useAutoSave({
    key: 'pos_transaction_new',
    data: formData,
    enabled: open,
    onSave: () => {
      setHasUnsavedChanges(false);
    },
    onLoad: (savedData) => {
      if (savedData) {
        setFormData(savedData);
        toast.info('Draft restored from auto-save');
      }
    }
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        transactionId: '',
        amount: '',
        paymentMethod: '',
        items: '',
        customerId: ''
      });
      setHasUnsavedChanges(false);
      autoSave.clearDraft();
    }
  }, [open, autoSave]);

  // Track changes
  useEffect(() => {
    const hasData = formData.transactionId || formData.items || formData.customerId;
    setHasUnsavedChanges(hasData);
  }, [formData]);

  // Show draft restoration dialog
  useEffect(() => {
    if (open && autoSave.hasDraft) {
      setTimeout(() => {
        const shouldRestore = window.confirm(
          'A saved draft was found. Would you like to restore it and continue where you left off?'
        );
        
        if (shouldRestore && autoSave.savedDraft) {
          setFormData(autoSave.savedDraft);
          toast.success('Draft restored successfully');
        }
      }, 100);
    }
  }, [open, autoSave.hasDraft, autoSave.savedDraft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.transactionId) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSave({
      transactionId: formData.transactionId,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      items: formData.items.split(',').map(item => item.trim()).filter(Boolean),
      customerId: formData.customerId
    });

    // Clear draft after successful save
    autoSave.clearDraft();
    setHasUnsavedChanges(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to close? Your changes will be auto-saved as a draft.'
      );
      if (!shouldDiscard) return;
    }
    onOpenChange(false);
  };

  const updateField = (field: keyof POSFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart size={20} />
              Record POS Transaction
            </DialogTitle>
            
            <AutoSaveIndicator
              enabled={open}
              lastSaved={autoSave.lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              onSaveNow={autoSave.saveNow}
              onClearDraft={autoSave.clearDraft}
              hasDraft={autoSave.hasDraft}
              className="text-sm"
            />
          </div>
          <DialogDescription>
            Record a new point of sale transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionId">Transaction ID *</Label>
              <Input
                id="transactionId"
                value={formData.transactionId}
                onChange={(e) => updateField('transactionId', e.target.value)}
                placeholder="e.g., TXN-001"
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value ? Number(e.target.value) : '')}
                placeholder="0.00"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select 
                value={formData.paymentMethod} 
                onValueChange={(value) => updateField('paymentMethod', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="ACH Transfer">ACH Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                value={formData.customerId}
                onChange={(e) => updateField('customerId', e.target.value)}
                placeholder="e.g., CUST-001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="items">Items (comma-separated SKUs) *</Label>
            <Input
              id="items"
              value={formData.items}
              onChange={(e) => updateField('items', e.target.value)}
              placeholder="PROD-001, SERV-001, SUPP-001"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Record Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}