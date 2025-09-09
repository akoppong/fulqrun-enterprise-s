import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';

interface ChartWidgetProps {
  type: 'bar' | 'line' | 'pie' | 'area' | 'gauge';
  data: any;
  config?: {
    color?: string;
    colors?: string[];
    showGrid?: boolean;
    showTooltip?: boolean;
    animated?: boolean;
  };
  height?: number;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
];

export function ChartWidget({ 
  type, 
  data, 
  config = {}, 
  height = 200 
}: ChartWidgetProps) {
  const {
    color = DEFAULT_COLORS[0],
    colors = DEFAULT_COLORS,
    showGrid = true,
    showTooltip = true,
    animated = true
  } = config;

  // Sample data if not provided
  const chartData = data || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{ data: [12, 19, 15, 25, 22, 30] }]
  };

  // Convert data to recharts format
  const rechartsData = chartData.labels?.map((label: string, index: number) => ({
    name: label,
    value: chartData.datasets?.[0]?.data[index] || 0,
    ...chartData.datasets?.reduce((acc: any, dataset: any, datasetIndex: number) => {
      acc[`series${datasetIndex}`] = dataset.data[index] || 0;
      return acc;
    }, {})
  })) || [];

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={rechartsData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
            )}
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[2, 2, 0, 0]}
              animationDuration={animated ? 500 : 0}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={rechartsData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
            )}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 4, fill: color }}
              animationDuration={animated ? 500 : 0}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={rechartsData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
            )}
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              fill={`${color}20`}
              animationDuration={animated ? 500 : 0}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={rechartsData}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.35, 80)}
              dataKey="value"
              animationDuration={animated ? 500 : 0}
            >
              {rechartsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
            )}
          </PieChart>
        );

      case 'gauge':
        // Simple gauge implementation using pie chart
        const gaugeValue = typeof data === 'number' ? data : data?.value || 0;
        const gaugeData = [
          { name: 'Value', value: gaugeValue, fill: color },
          { name: 'Remaining', value: 100 - gaugeValue, fill: 'hsl(var(--muted))' }
        ];

        return (
          <div className="relative flex items-center justify-center h-full">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={Math.min(height * 0.25, 50)}
                outerRadius={Math.min(height * 0.35, 70)}
                dataKey="value"
                animationDuration={animated ? 500 : 0}
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{gaugeValue}%</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Unsupported chart type
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}