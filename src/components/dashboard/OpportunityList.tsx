import { useKV } from '@github/spark/hooks';
import { Opportunity, PEAK_STAGES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, getMEDDPICCScore } from '@/lib/crm-utils';
import { Search, Filter, Target } from '@phosphor-icons/react';
import { useState } from 'react';
import { OpportunityDialog } from './OpportunityDialog';

export function OpportunityList() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDialogOpen(true);
  };

  const handleSaveOpportunity = (opportunityData: Partial<Opportunity>) => {
    if (selectedOpportunity) {
      setOpportunities(current => 
        current.map(opp => 
          opp.id === selectedOpportunity.id 
            ? { ...opp, ...opportunityData, updatedAt: new Date() }
            : opp
        )
      );
    }
    setIsDialogOpen(false);
  };

  const getStageConfig = (stage: string) => {
    return PEAK_STAGES.find(s => s.value === stage) || PEAK_STAGES[0];
  };

  const getMEDDPICCBadge = (score: number) => {
    if (score >= 70) return { variant: 'default' as const, label: 'Strong' };
    if (score >= 40) return { variant: 'secondary' as const, label: 'Moderate' };
    return { variant: 'destructive' as const, label: 'Weak' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Opportunities</h2>
          <p className="text-muted-foreground">Manage and track all sales opportunities</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {filteredOpportunities.length} opportunities
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Opportunity Pipeline
          </CardTitle>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search size={16} className="text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-48">
                <Filter size={16} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {PEAK_STAGES.map(stage => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>MEDDPICC</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.map((opportunity) => {
                const stageConfig = getStageConfig(opportunity.stage);
                const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);
                const meddpicBadge = getMEDDPICCBadge(meddpicScore);

                return (
                  <TableRow key={opportunity.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{opportunity.title}</div>
                        {opportunity.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {opportunity.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={stageConfig.color}>
                        {stageConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(opportunity.value)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${opportunity.probability}%` }}
                          />
                        </div>
                        <span className="text-sm">{opportunity.probability}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meddpicBadge.variant}>
                        {meddpicScore}% {meddpicBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditOpportunity(opportunity)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
              <p className="text-muted-foreground">
                {searchTerm || stageFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by creating your first opportunity'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <OpportunityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveOpportunity}
        opportunity={selectedOpportunity}
      />
    </div>
  );
}