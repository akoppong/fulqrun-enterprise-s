import { CustomerSegment, CUSTOMER_SEGMENT_TEMPLATES } from '@/lib/types';

/**
 * Service for managing customer segments initialization and operations
 */
export class CustomerSegmentsService {
  
  /**
   * Initialize default customer segment templates
   */
  static initializeDefaultSegments(): CustomerSegment[] {
    return CUSTOMER_SEGMENT_TEMPLATES.map(template => ({
      ...template,
      id: crypto.randomUUID(),
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Ensure customer segments are available, initialize if needed
   */
  static ensureSegmentsInitialized(currentSegments: CustomerSegment[]): CustomerSegment[] {
    if (currentSegments.length === 0) {
      return this.initializeDefaultSegments();
    }
    return currentSegments;
  }

  /**
   * Get active segments only
   */
  static getActiveSegments(segments: CustomerSegment[]): CustomerSegment[] {
    return segments.filter(s => s.isActive);
  }

  /**
   * Find segment by ID
   */
  static findSegmentById(segments: CustomerSegment[], segmentId: string): CustomerSegment | undefined {
    return segments.find(s => s.id === segmentId);
  }

  /**
   * Get segment display name with fallback
   */
  static getSegmentDisplayName(segments: CustomerSegment[], segmentId: string): string {
    const segment = this.findSegmentById(segments, segmentId);
    return segment?.name || 'Unknown Segment';
  }

  /**
   * Validate segment configuration
   */
  static validateSegment(segment: Partial<CustomerSegment>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!segment.name?.trim()) {
      errors.push('Segment name is required');
    }

    if (!segment.description?.trim()) {
      errors.push('Segment description is required');
    }

    if (!segment.color) {
      errors.push('Segment color is required');
    }

    if (!segment.icon) {
      errors.push('Segment icon is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get segment statistics
   */
  static getSegmentStats(segments: CustomerSegment[]) {
    const total = segments.length;
    const active = segments.filter(s => s.isActive).length;
    const inactive = total - active;

    return {
      total,
      active,
      inactive,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  }

  /**
   * Sort segments by name
   */
  static sortSegmentsByName(segments: CustomerSegment[]): CustomerSegment[] {
    return [...segments].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Filter segments by criteria
   */
  static filterSegments(
    segments: CustomerSegment[], 
    criteria: {
      isActive?: boolean;
      searchTerm?: string;
    }
  ): CustomerSegment[] {
    let filtered = segments;

    if (criteria.isActive !== undefined) {
      filtered = filtered.filter(s => s.isActive === criteria.isActive);
    }

    if (criteria.searchTerm?.trim()) {
      const searchLower = criteria.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }
}