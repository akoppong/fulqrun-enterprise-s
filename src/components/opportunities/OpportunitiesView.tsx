import { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreHorizontal, DollarSign, Calendar, User, Briefcase, TrendingUp, Clock, MapPin, Star } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OpportunityService, type Opportunity } from "@/lib/opportunity-service";
import { OpportunityEditForm } from "./OpportunityEditForm";
import { ResponsiveOpportunityDetail } from "./ResponsiveOpportunityDetail";
import { toast } from "sonner";

interface OpportunitiesViewProps {
  className?: string;
}

export function OpportunitiesView({ className }: OpportunitiesViewProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load opportunities on component mount
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setIsLoading(true);
        await OpportunityService.initializeSampleData();
        const data = await OpportunityService.getAllOpportunities();
        // Ensure data is always an array
        const safeData = Array.isArray(data) ? data : [];
        setOpportunities(safeData);
        setFilteredOpportunities(safeData);
      } catch (error) {
        console.error("Error loading opportunities:", error);
        toast.error("Failed to load opportunities");
        // Set empty arrays on error
        setOpportunities([]);
        setFilteredOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  // Apply filters
  useEffect(() => {
    // Ensure opportunities is always an array
    let filtered = Array.isArray(opportunities) ? opportunities : [];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (opp) =>
          opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opp.primaryContact.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Stage filter
    if (stageFilter !== "all") {
      filtered = filtered.filter((opp) => opp.stage === stageFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((opp) => opp.priority === priorityFilter);
    }

    setFilteredOpportunities(filtered);
  }, [opportunities, searchQuery, stageFilter, priorityFilter]);

  const handleCreateOpportunity = async (data: Partial<Opportunity>) => {
    try {
      await OpportunityService.createOpportunity(data);
      const updatedOpportunities = await OpportunityService.getAllOpportunities();
      const safeData = Array.isArray(updatedOpportunities) ? updatedOpportunities : [];
      setOpportunities(safeData);
      setShowCreateForm(false);
      toast.success("Opportunity created successfully!");
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast.error("Failed to create opportunity");
    }
  };

  const handleUpdateOpportunity = async (id: string, data: Partial<Opportunity>) => {
    try {
      await OpportunityService.updateOpportunity(id, data);
      const updatedOpportunities = await OpportunityService.getAllOpportunities();
      const safeData = Array.isArray(updatedOpportunities) ? updatedOpportunities : [];
      setOpportunities(safeData);
      setSelectedOpportunity(null);
      toast.success("Opportunity updated successfully!");
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast.error("Failed to update opportunity");
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    try {
      await OpportunityService.deleteOpportunity(id);
      const updatedOpportunities = await OpportunityService.getAllOpportunities();
      const safeData = Array.isArray(updatedOpportunities) ? updatedOpportunities : [];
      setOpportunities(safeData);
      toast.success("Opportunity deleted successfully!");
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast.error("Failed to delete opportunity");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "prospect": return "bg-blue-100 text-blue-800 border-blue-200";
      case "engage": return "bg-purple-100 text-purple-800 border-purple-200";
      case "acquire": return "bg-green-100 text-green-800 border-green-200";
      case "keep": return "bg-teal-100 text-teal-800 border-teal-200";
      case "closed-won": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "closed-lost": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getDaysUntilClose = (closeDate: Date) => {
    const today = new Date();
    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStageProgress = (stage: string) => {
    const stageMap = {
      "prospect": 25,
      "engage": 50,
      "acquire": 75,
      "keep": 90,
      "closed-won": 100,
      "closed-lost": 0,
    };
    return stageMap[stage as keyof typeof stageMap] || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-content-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`flex flex-col h-full space-y-6 p-6 overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
            <p className="text-muted-foreground">
              Manage your sales pipeline and track deal progress
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Opportunity
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities, companies, or contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="engage">Engage</SelectItem>
              <SelectItem value="acquire">Acquire</SelectItem>
              <SelectItem value="keep">Keep</SelectItem>
              <SelectItem value="closed-won">Closed Won</SelectItem>
              <SelectItem value="closed-lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Opportunities Table */}
        <div className="flex-1 overflow-hidden">
          <div className="opportunities-table-container h-full overflow-auto">
            <div className="opportunities-table-wrapper">
              <table className="opportunities-table">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="col-opportunity-details text-left font-semibold">
                      Opportunity Details
                    </th>
                    <th className="col-company-contact text-left font-semibold">
                      Company & Contact
                    </th>
                    <th className="col-stage-progress text-left font-semibold">
                      Stage & Progress
                    </th>
                    <th className="col-deal-value text-left font-semibold">
                      Deal Value
                    </th>
                    <th className="col-win-probability text-left font-semibold">
                      Win Probability
                    </th>
                    <th className="col-priority text-left font-semibold">
                      Priority
                    </th>
                    <th className="col-timeline text-left font-semibold">
                      Timeline
                    </th>
                    <th className="col-actions text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredOpportunities) && filteredOpportunities.map((opportunity) => {
                    const daysUntilClose = getDaysUntilClose(opportunity.expectedCloseDate);
                    const stageProgress = getStageProgress(opportunity.stage);

                    return (
                      <tr
                        key={opportunity.id}
                        className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedOpportunity(opportunity)}
                      >
                        {/* Opportunity Details */}
                        <td className="col-opportunity-details">
                          <div className="cell-content">
                            <div className="font-semibold text-sm mb-1 truncate-content">
                              {opportunity.name}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2 truncate-content">
                              {opportunity.description}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {opportunity.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs px-1 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {opportunity.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  +{opportunity.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Company & Contact */}
                        <td className="col-company-contact">
                          <div className="cell-content">
                            <div className="flex items-center gap-2 mb-1">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium text-sm truncate-content">
                                {opportunity.company}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate-content">
                                {opportunity.primaryContact}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {opportunity.industry}
                            </div>
                          </div>
                        </td>

                        {/* Stage & Progress */}
                        <td className="col-stage-progress">
                          <div className="cell-content">
                            <Badge
                              className={`mb-2 text-xs ${getStageColor(opportunity.stage)}`}
                            >
                              {opportunity.stage.charAt(0).toUpperCase() + opportunity.stage.slice(1)}
                            </Badge>
                            <Progress value={stageProgress} className="h-2 mb-1" />
                            <div className="text-xs text-muted-foreground">
                              {stageProgress}% complete
                            </div>
                          </div>
                        </td>

                        {/* Deal Value */}
                        <td className="col-deal-value">
                          <div className="cell-content">
                            <div className="flex items-center gap-1 mb-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="font-semibold text-sm">
                                {formatCurrency(opportunity.value)}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Est. value
                            </div>
                          </div>
                        </td>

                        {/* Win Probability */}
                        <td className="col-win-probability">
                          <div className="cell-content">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-3 w-3 text-blue-600" />
                              <span className="font-semibold text-sm">
                                {opportunity.probability}%
                              </span>
                            </div>
                            <Progress value={opportunity.probability} className="h-2 mb-1" />
                            <div className="text-xs text-muted-foreground">
                              Win probability
                            </div>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="col-priority">
                          <div className="cell-content">
                            <Badge
                              className={`text-xs ${getPriorityColor(opportunity.priority)}`}
                            >
                              {opportunity.priority.charAt(0).toUpperCase() + opportunity.priority.slice(1)}
                            </Badge>
                          </div>
                        </td>

                        {/* Timeline */}
                        <td className="col-timeline">
                          <div className="cell-content">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="h-3 w-3 text-orange-600" />
                              <span className="text-xs font-medium">
                                {formatDate(opportunity.expectedCloseDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span
                                className={`text-xs ${
                                  daysUntilClose < 0
                                    ? "text-red-600"
                                    : daysUntilClose < 30
                                    ? "text-orange-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {daysUntilClose < 0
                                  ? `${Math.abs(daysUntilClose)}d overdue`
                                  : daysUntilClose === 0
                                  ? "Due today"
                                  : `${daysUntilClose}d left`}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="col-actions">
                          <div className="cell-content">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOpportunity(opportunity);
                                  }}
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle edit - you could open edit form here
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOpportunity(opportunity.id);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {Array.isArray(filteredOpportunities) && filteredOpportunities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || stageFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Get started by creating your first opportunity."}
            </p>
            {(!searchQuery && stageFilter === "all" && priorityFilter === "all") && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Opportunity
              </Button>
            )}
          </div>
        )}

        {/* Create/Edit Opportunity Dialog */}
        {showCreateForm && (
          <OpportunityEditForm
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
            onSave={handleCreateOpportunity}
          />
        )}

        {/* Opportunity Detail Dialog */}
        {selectedOpportunity && (
          <ResponsiveOpportunityDetail
            opportunity={selectedOpportunity}
            open={!!selectedOpportunity}
            onOpenChange={(open) => !open && setSelectedOpportunity(null)}
            onSave={(data) => handleUpdateOpportunity(selectedOpportunity.id, data)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}