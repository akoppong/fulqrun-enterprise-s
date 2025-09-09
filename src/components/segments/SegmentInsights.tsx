import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { CustomerSegment, Company } from '@/lib/types';
import { AIService } from '@/lib/ai-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, TrendingUp, Target, Lightbulb, Shield, Loader2, RefreshCw } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SegmentInsightsCardProps {
  segment: CustomerSegment;
  companies: Company[];
}

export function SegmentInsightsCard({ segment, companies }: SegmentInsightsCardProps) {
  const [insights, setInsights] = useState<{
    performance: string;
    trends: string[];
    opportunities: string[];
    recommendations: string[];
    competitivePosition: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const segmentCompanies = companies.filter(c => c.segmentId === segment.id);
  const totalRevenue = segmentCompanies.reduce((sum, c) => sum + (c.revenue || 0), 0);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const result = await AIService.generateSegmentInsights(segment, companies);
      setInsights(result);
      setLastUpdated(new Date());
      toast.success(`Strategic insights updated for ${segment.name}`);
    } catch (error) {
      console.error('Error loading segment insights:', error);
      toast.error('Failed to load segment insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load insights when component mounts if there are companies in this segment
    if (segmentCompanies.length > 0 && !insights) {
      loadInsights();
    }
  }, [segment.id, segmentCompanies.length]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (segmentCompanies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Strategic Insights
            </CardTitle>
            <Badge variant="outline">No Companies</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-muted-foreground">No Companies in Segment</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Assign companies to this segment to generate AI insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Strategic Insights
            </CardTitle>
            {lastUpdated && (
              <CardDescription>
                Last updated: {lastUpdated.toLocaleString()}
              </CardDescription>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadInsights}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isLoading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Segment Metrics */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Companies</div>
            <div className="text-lg font-semibold">{segmentCompanies.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-lg font-semibold">{formatCurrency(totalRevenue)}</div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Generating strategic insights...</p>
          </div>
        ) : insights ? (
          <div className="space-y-6">
            {/* Performance Assessment */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Performance Assessment
              </h4>
              <p className="text-sm text-muted-foreground">{insights.performance}</p>
            </div>

            <Separator />

            {/* Market Trends */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Market Trends
              </h4>
              <div className="space-y-2">
                {insights.trends.map((trend, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{trend}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Growth Opportunities */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-purple-600" />
                Growth Opportunities
              </h4>
              <div className="space-y-2">
                {insights.opportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{opportunity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Strategic Recommendations */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-orange-600" />
                Strategic Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Competitive Position */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-red-600" />
                Competitive Position
              </h4>
              <p className="text-sm text-muted-foreground">{insights.competitivePosition}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-muted-foreground">Generate Insights</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Get AI-powered strategic insights for this segment
            </p>
            <Button onClick={loadInsights} className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AllSegmentsInsightsProps {
  segments: CustomerSegment[];
  companies: Company[];
}

export function AllSegmentsInsights({ segments, companies }: AllSegmentsInsightsProps) {
  const activeSegments = segments.filter(s => s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Segment Intelligence</h2>
          <p className="text-muted-foreground mt-1">
            AI-powered strategic insights and recommendations for each customer segment
          </p>
        </div>
      </div>

      {activeSegments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Active Segments</h3>
            <p className="text-muted-foreground">
              Create and activate customer segments to generate strategic insights
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {activeSegments.map((segment) => (
            <div key={segment.id}>
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${segment.color}20` }}
                >
                  <div style={{ color: segment.color }} className="font-semibold">
                    {segment.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{segment.name}</h3>
                  <p className="text-sm text-muted-foreground">{segment.description}</p>
                </div>
              </div>
              <SegmentInsightsCard segment={segment} companies={companies} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}