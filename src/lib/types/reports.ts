/**
 * Reporting and visualization types
 */

export interface PipelineReport {
  id: string;
  name: string;
  type: 'conversion_funnel' | 'velocity_analysis' | 'bottleneck_report' | 'forecast_accuracy' | 'stage_performance';
  filters: ReportFilter[];
  data: Record<string, any>;
  visualizations: ReportVisualization[];
  generatedAt: string; // ISO date string for reliable serialization
  generatedBy: string;
  period: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  label: string;
}

export interface ReportVisualization {
  type: 'bar_chart' | 'line_chart' | 'funnel' | 'gauge' | 'table' | 'heatmap';
  title: string;
  data: any;
  configuration: Record<string, any>;
}