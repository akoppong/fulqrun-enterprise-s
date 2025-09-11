import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  ArrowsOutCardinal,
  CaretUp,
  CaretDown,
  MagnifyingGlass,
  Funnel,
  Export,
  GridFour,
  List,
  Eye,
  PencilSimple,
  Trash
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ResponsiveShow, ResponsiveContainer, ResponsiveGrid, ResponsiveFlex } from '../layout/EnhancedResponsiveLayout';

interface Column<T> {
  id: string;
  label: string;
  accessor: keyof T | string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  mobileRender?: (value: any, row: T, index: number) => React.ReactNode;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  sticky?: boolean;
  priority?: 'high' | 'medium' | 'low'; // For column prioritization on smaller screens
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  onEdit?: (row: T, index: number) => void;
  onDelete?: (row: T, index: number) => void;
  onView?: (row: T, index: number) => void;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
  variant?: 'table' | 'cards' | 'auto'; // auto switches based on screen size
  stickyHeader?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  filterable = true,
  sortable = true,
  exportable = false,
  selectable = false,
  pagination = false,
  pageSize = 10,
  emptyMessage = 'No data available',
  loading = false,
  variant = 'auto',
  stickyHeader = true
}: ResponsiveTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(variant === 'auto' ? 'table' : variant);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(column => {
          const value = column.accessor.includes('.') 
            ? column.accessor.split('.').reduce((obj, key) => obj?.[key], row)
            : row[column.accessor as keyof T];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Sort
    if (sortState.column && sortState.direction) {
      const column = columns.find(col => col.id === sortState.column);
      if (column) {
        result.sort((a, b) => {
          const aValue = column.accessor.includes('.') 
            ? column.accessor.split('.').reduce((obj, key) => obj?.[key], a)
            : a[column.accessor as keyof T];
          const bValue = column.accessor.includes('.') 
            ? column.accessor.split('.').reduce((obj, key) => obj?.[key], b)
            : b[column.accessor as keyof T];

          if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, searchTerm, sortState, columns]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize, pagination]);

  const totalPages = pagination ? Math.ceil(processedData.length / pageSize) : 1;

  // Column prioritization for responsive display
  const prioritizedColumns = useMemo(() => {
    return columns.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const aPriority = priorityOrder[a.priority || 'medium'];
      const bPriority = priorityOrder[b.priority || 'medium'];
      return aPriority - bPriority;
    });
  }, [columns]);

  const handleSort = (columnId: string) => {
    if (!sortable) return;
    
    setSortState(prev => {
      if (prev.column === columnId) {
        return {
          column: columnId,
          direction: prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        };
      }
      return { column: columnId, direction: 'asc' };
    });
  };

  const handleSelectRow = (index: number) => {
    if (!selectable) return;
    
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const renderCellValue = (column: Column<T>, row: T, index: number) => {
    const value = column.accessor.includes('.') 
      ? column.accessor.split('.').reduce((obj, key) => obj?.[key], row)
      : row[column.accessor as keyof T];

    if (column.render) {
      return column.render(value, row, index);
    }

    return String(value || '');
  };

  const renderTableView = () => (
    <div className="w-full">
      <div className="overflow-auto border rounded-lg">
        <Table className={cn('min-w-full', className)}>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-background z-10')}>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(paginatedData.map((_, i) => i)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  />
                </TableHead>
              )}
              {prioritizedColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    'whitespace-nowrap',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sticky && 'sticky left-0 bg-background z-10',
                    column.hideOnMobile && 'hidden sm:table-cell',
                    column.hideOnTablet && 'hidden lg:table-cell',
                    sortable && column.sortable !== false && 'cursor-pointer hover:bg-muted'
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                  onClick={() => sortable && column.sortable !== false && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <div className="flex flex-col">
                        <CaretUp 
                          size={12} 
                          className={cn(
                            'transition-colors',
                            sortState.column === column.id && sortState.direction === 'asc' 
                              ? 'text-primary' 
                              : 'text-muted-foreground'
                          )} 
                        />
                        <CaretDown 
                          size={12} 
                          className={cn(
                            'transition-colors -mt-1',
                            sortState.column === column.id && sortState.direction === 'desc' 
                              ? 'text-primary' 
                              : 'text-muted-foreground'
                          )} 
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
              {(onView || onEdit || onDelete) && (
                <TableHead className="w-32 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={index}
                className={cn(
                  onRowClick && 'cursor-pointer hover:bg-muted/50',
                  selectedRows.has(index) && 'bg-muted'
                )}
                onClick={() => onRowClick?.(row, index)}
              >
                {selectable && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(index)}
                      onChange={() => handleSelectRow(index)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                {prioritizedColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(
                      'whitespace-nowrap',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sticky && 'sticky left-0 bg-background',
                      column.hideOnMobile && 'hidden sm:table-cell',
                      column.hideOnTablet && 'hidden lg:table-cell'
                    )}
                  >
                    {renderCellValue(column, row, index)}
                  </TableCell>
                ))}
                {(onView || onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(row, index);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye size={14} />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(row, index);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <PencilSimple size={14} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(row, index);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderCardView = () => (
    <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
      {paginatedData.map((row, index) => (
        <Card
          key={index}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selectedRows.has(index) && 'ring-2 ring-primary'
          )}
          onClick={() => onRowClick?.(row, index)}
        >
          <CardContent className="p-4">
            {prioritizedColumns
              .filter(col => col.priority === 'high' || !col.hideOnMobile)
              .slice(0, 4)
              .map((column) => {
                const value = renderCellValue(column, row, index);
                return (
                  <div key={column.id} className="flex justify-between items-center mb-2 last:mb-0">
                    <span className="text-sm text-muted-foreground font-medium">
                      {column.label}:
                    </span>
                    <span className="text-sm font-medium">
                      {column.mobileRender ? column.mobileRender(value, row, index) : value}
                    </span>
                  </div>
                );
              })}
            
            {(onView || onEdit || onDelete) && (
              <div className="flex justify-end gap-1 mt-4 pt-2 border-t border-border">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(row, index);
                    }}
                  >
                    <Eye size={14} className="mr-1" />
                    View
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row, index);
                    }}
                  >
                    <PencilSimple size={14} className="mr-1" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(row, index);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash size={14} className="mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </ResponsiveGrid>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ResponsiveContainer className={className}>
      {/* Table Controls */}
      <ResponsiveFlex 
        direction="col" 
        gap="md" 
        responsive={{ lg: { direction: 'row', justify: 'between', align: 'center' } }}
        className="mb-6"
      >
        <ResponsiveFlex gap="sm" wrap>
          {searchable && (
            <div className="relative min-w-64">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          
          {filterable && (
            <Button variant="outline" size="sm">
              <Funnel size={16} className="mr-2" />
              Filter
            </Button>
          )}
          
          {exportable && (
            <Button variant="outline" size="sm">
              <Export size={16} className="mr-2" />
              Export
            </Button>
          )}
        </ResponsiveFlex>

        <ResponsiveFlex gap="sm" align="center">
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none"
            >
              <List size={16} />
              <ResponsiveShow above="sm">
                <span className="ml-2">Table</span>
              </ResponsiveShow>
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-l-none border-l"
            >
              <GridFour size={16} />
              <ResponsiveShow above="sm">
                <span className="ml-2">Cards</span>
              </ResponsiveShow>
            </Button>
          </div>

          {/* Results count */}
          <Badge variant="outline">
            {processedData.length} result{processedData.length !== 1 ? 's' : ''}
          </Badge>
        </ResponsiveFlex>
      </ResponsiveFlex>

      {/* Table/Cards Content */}
      {processedData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Always show table on desktop, cards on mobile, toggle on tablet */}
          <ResponsiveShow above="lg">
            {renderTableView()}
          </ResponsiveShow>
          
          <ResponsiveShow below="lg">
            {viewMode === 'table' ? renderTableView() : renderCardView()}
          </ResponsiveShow>
          
          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <ResponsiveFlex justify="between" align="center" className="mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} results
              </p>
              
              <ResponsiveFlex gap="sm" align="center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </ResponsiveFlex>
            </ResponsiveFlex>
          )}
        </>
      )}
    </ResponsiveContainer>
  );
}