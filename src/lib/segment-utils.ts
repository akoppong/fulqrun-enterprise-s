import { Company, CustomerSegment, SegmentAssignment, CUSTOMER_SEGMENT_TEMPLATES } from '@/lib/types';

/**
 * Utility functions for customer segment management
 */
export class SegmentUtils {
  
  /**
   * Automatically assign segments to companies based on their characteristics
   */
  static autoAssignSegments(companies: Company[], segments: CustomerSegment[]): Company[] {
    return companies.map(company => {
      if (company.segmentId) {
        return company; // Already assigned
      }

      const bestMatch = this.findBestSegmentMatch(company, segments);
      if (bestMatch) {
        const assignment: SegmentAssignment = {
          id: crypto.randomUUID(),
          companyId: company.id,
          segmentId: bestMatch.segment.id,
          confidence: bestMatch.confidence,
          assignedBy: 'automated',
          assignedAt: new Date().toISOString(),
          reason: bestMatch.reason,
          previousSegments: []
        };

        return {
          ...company,
          segmentId: bestMatch.segment.id,
          segmentAssignment: assignment
        };
      }

      return company;
    });
  }

  /**
   * Find the best segment match for a company
   */
  static findBestSegmentMatch(company: Company, segments: CustomerSegment[]): {
    segment: CustomerSegment;
    confidence: number;
    reason: string;
  } | null {
    let bestMatch: { segment: CustomerSegment; confidence: number; reason: string } | null = null;

    for (const segment of segments.filter(s => s.isActive)) {
      const score = this.calculateSegmentScore(company, segment);
      if (score.confidence > 70 && (!bestMatch || score.confidence > bestMatch.confidence)) {
        bestMatch = {
          segment,
          confidence: score.confidence,
          reason: score.reason
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate how well a company fits a segment
   */
  static calculateSegmentScore(company: Company, segment: CustomerSegment): {
    confidence: number;
    reason: string;
  } {
    let score = 0;
    let maxScore = 0;
    const reasons: string[] = [];

    // Revenue criteria (weight: 30)
    maxScore += 30;
    if (company.revenue && (segment.criteria.revenue.min || segment.criteria.revenue.max)) {
      const { min, max } = segment.criteria.revenue;
      if (
        (!min || company.revenue >= min) && 
        (!max || company.revenue <= max)
      ) {
        score += 30;
        reasons.push('Revenue fits segment criteria');
      } else if (min && company.revenue < min) {
        const ratio = company.revenue / min;
        score += Math.max(0, 15 * ratio);
        reasons.push('Revenue partially matches (below minimum)');
      } else if (max && company.revenue > max) {
        const ratio = max / company.revenue;
        score += Math.max(0, 15 * ratio);
        reasons.push('Revenue partially matches (above maximum)');
      }
    } else if (!company.revenue) {
      score += 10; // Partial score for missing data
    }

    // Industry criteria (weight: 25)
    maxScore += 25;
    if (segment.criteria.industry.length > 0) {
      if (segment.criteria.industry.includes(company.industry)) {
        score += 25;
        reasons.push(`Industry match: ${company.industry}`);
      } else {
        // Check for similar industries
        const similarIndustries = this.findSimilarIndustries(company.industry, segment.criteria.industry);
        if (similarIndustries.length > 0) {
          score += 10;
          reasons.push(`Similar industry: ${company.industry}`);
        }
      }
    }

    // Company size criteria (weight: 20)
    maxScore += 20;
    if (company.employees && (segment.criteria.companySize.min || segment.criteria.companySize.max)) {
      const { min, max } = segment.criteria.companySize;
      if (
        (!min || company.employees >= min) && 
        (!max || company.employees <= max)
      ) {
        score += 20;
        reasons.push('Company size fits criteria');
      } else {
        score += 5; // Partial match
      }
    }

    // Geography criteria (weight: 15)
    maxScore += 15;
    if (segment.criteria.geography.length > 0 && company.geography) {
      if (segment.criteria.geography.includes(company.geography)) {
        score += 15;
        reasons.push(`Geography match: ${company.geography}`);
      } else if (segment.criteria.geography.includes('Global')) {
        score += 10;
        reasons.push('Global segment includes all geographies');
      }
    }

    // Custom fields criteria (weight: 10)
    maxScore += 10;
    if (segment.criteria.customFields.length > 0 && company.customFields) {
      let customScore = 0;
      for (const customField of segment.criteria.customFields) {
        const companyValue = company.customFields[customField.field];
        if (companyValue !== undefined) {
          if (this.matchesCustomField(companyValue, customField)) {
            customScore += customField.weight;
            reasons.push(`Custom field match: ${customField.field}`);
          }
        }
      }
      // Normalize to 10 points max
      const maxCustomScore = segment.criteria.customFields.reduce((sum, cf) => sum + cf.weight, 0);
      score += Math.min(10, (customScore / maxCustomScore) * 10);
    }

    const confidence = Math.round((score / maxScore) * 100);
    const reason = reasons.slice(0, 3).join(', '); // Top 3 reasons

    return { confidence, reason };
  }

  /**
   * Check if a value matches a custom field criterion
   */
  private static matchesCustomField(value: any, criterion: any): boolean {
    switch (criterion.operator) {
      case 'equals':
        return value === criterion.value;
      case 'contains':
        return String(value).toLowerCase().includes(String(criterion.value).toLowerCase());
      case 'greater_than':
        return Number(value) > Number(criterion.value);
      case 'less_than':
        return Number(value) < Number(criterion.value);
      case 'between':
        const [min, max] = criterion.value;
        return Number(value) >= Number(min) && Number(value) <= Number(max);
      default:
        return false;
    }
  }

  /**
   * Find similar industries for partial matching
   */
  private static findSimilarIndustries(companyIndustry: string, segmentIndustries: string[]): string[] {
    const similar: string[] = [];
    const industry = companyIndustry.toLowerCase();

    for (const segmentIndustry of segmentIndustries) {
      const target = segmentIndustry.toLowerCase();
      
      // Check for partial matches
      if (
        industry.includes(target) || 
        target.includes(industry) ||
        this.hasCommonWords(industry, target)
      ) {
        similar.push(segmentIndustry);
      }
    }

    return similar;
  }

  /**
   * Check if two industry names have common words
   */
  private static hasCommonWords(industry1: string, industry2: string): boolean {
    const words1 = industry1.split(/\s+/).filter(w => w.length > 3);
    const words2 = industry2.split(/\s+/).filter(w => w.length > 3);
    
    return words1.some(w1 => words2.some(w2 => w1.includes(w2) || w2.includes(w1)));
  }

  /**
   * Get segment performance summary
   */
  static getSegmentPerformance(segmentId: string, companies: Company[]): {
    totalCompanies: number;
    avgRevenue: number;
    totalRevenue: number;
    industries: Record<string, number>;
  } {
    const segmentCompanies = companies.filter(c => c.segmentId === segmentId);
    
    const totalRevenue = segmentCompanies.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const avgRevenue = segmentCompanies.length > 0 ? totalRevenue / segmentCompanies.length : 0;

    const industries: Record<string, number> = {};
    segmentCompanies.forEach(c => {
      industries[c.industry] = (industries[c.industry] || 0) + 1;
    });

    return {
      totalCompanies: segmentCompanies.length,
      avgRevenue,
      totalRevenue,
      industries
    };
  }

  /**
   * Generate segment recommendations for a company
   */
  static getSegmentRecommendations(company: Company, segments: CustomerSegment[]): {
    segment: CustomerSegment;
    confidence: number;
    reason: string;
  }[] {
    return segments
      .filter(s => s.isActive)
      .map(segment => ({
        segment,
        ...this.calculateSegmentScore(company, segment)
      }))
      .filter(rec => rec.confidence > 30)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }
}