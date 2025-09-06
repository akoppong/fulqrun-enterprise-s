import { WorkflowTemplate, PeakStage } from './types';

/**
 * Industry-specific workflow templates for different business contexts
 */

export const industryWorkflowTemplates: WorkflowTemplate[] = [
  // Technology/SaaS Workflows
  {
    id: 'saas-trial-to-paid',
    name: 'SaaS Trial to Paid Conversion',
    description: 'Convert trial users to paid subscriptions through structured engagement',
    stage: 'acquire',
    steps: [
      {
        id: 'trial-onboarding',
        name: 'Send Trial Welcome Kit',
        description: 'Automated welcome email with onboarding materials',
        type: 'automated',
        dueInDays: 0,
        dependencies: [],
        completionCriteria: 'Welcome email sent with tracking confirmation',
        resources: [
          {
            id: 'welcome-template',
            name: 'Trial Welcome Email Template',
            type: 'template',
            content: 'Welcome to your {opportunity.title} trial! Here are your next steps...'
          }
        ]
      },
      {
        id: 'usage-monitoring',
        name: 'Monitor Trial Usage',
        description: 'Track user engagement and feature adoption',
        type: 'automated',
        dueInDays: 3,
        dependencies: ['trial-onboarding'],
        completionCriteria: 'Usage analytics collected and analyzed',
        resources: []
      },
      {
        id: 'mid-trial-check',
        name: 'Mid-Trial Check-in Call',
        description: 'Schedule call to address questions and demonstrate value',
        type: 'manual',
        assignedRole: 'rep',
        dueInDays: 7,
        dependencies: ['usage-monitoring'],
        completionCriteria: 'Check-in call completed with documented outcomes',
        resources: []
      },
      {
        id: 'conversion-offer',
        name: 'Generate Conversion Proposal',
        description: 'Create customized proposal based on trial usage',
        type: 'automated',
        dueInDays: 12,
        dependencies: ['mid-trial-check'],
        completionCriteria: 'Personalized proposal generated and sent',
        resources: []
      }
    ],
    automationRules: [
      {
        id: 'low-usage-alert',
        trigger: 'usage_threshold',
        conditions: ['usage_below_30_percent'],
        actions: [
          {
            type: 'notification',
            parameters: {
              message: 'Trial user showing low engagement - intervention needed',
              priority: 'high'
            }
          },
          {
            type: 'task',
            parameters: {
              title: 'Reach out to low-engagement trial user',
              assignee: 'rep'
            }
          }
        ],
        isActive: true
      }
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true
  },

  // Manufacturing/B2B Workflows
  {
    id: 'manufacturing-rfq',
    name: 'Manufacturing RFQ Response Process',
    description: 'Systematic response to Request for Quote in manufacturing',
    stage: 'engage',
    steps: [
      {
        id: 'rfq-analysis',
        name: 'Analyze RFQ Requirements',
        description: 'Review technical specifications and requirements',
        type: 'manual',
        assignedRole: 'engineer',
        dueInDays: 1,
        dependencies: [],
        completionCriteria: 'Technical analysis completed with feasibility assessment',
        resources: [
          {
            id: 'rfq-checklist',
            name: 'RFQ Analysis Checklist',
            type: 'checklist',
            content: '- Material specifications\n- Quantity requirements\n- Delivery timeline\n- Quality standards\n- Special requirements'
          }
        ]
      },
      {
        id: 'cost-estimation',
        name: 'Generate Cost Estimate',
        description: 'Calculate material, labor, and overhead costs',
        type: 'manual',
        assignedRole: 'estimator',
        dueInDays: 2,
        dependencies: ['rfq-analysis'],
        completionCriteria: 'Detailed cost breakdown completed with margins',
        resources: []
      },
      {
        id: 'quote-approval',
        name: 'Quote Approval Process',
        description: 'Management approval for pricing and terms',
        type: 'approval',
        assignedRole: 'manager',
        dueInDays: 1,
        dependencies: ['cost-estimation'],
        completionCriteria: 'Quote approved by management',
        resources: []
      },
      {
        id: 'quote-generation',
        name: 'Generate Formal Quote',
        description: 'Create and send formal quotation document',
        type: 'automated',
        dueInDays: 1,
        dependencies: ['quote-approval'],
        completionCriteria: 'Quote document generated and delivered to customer',
        resources: []
      }
    ],
    automationRules: [
      {
        id: 'quote-follow-up',
        trigger: 'time_elapsed',
        conditions: ['7_days_since_quote_sent'],
        actions: [
          {
            type: 'task',
            parameters: {
              title: 'Follow up on outstanding quote',
              assignee: 'rep'
            }
          }
        ],
        isActive: true
      }
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true
  },

  // Professional Services Workflows
  {
    id: 'consulting-proposal',
    name: 'Consulting Services Proposal Process',
    description: 'Professional services proposal development and delivery',
    stage: 'engage',
    steps: [
      {
        id: 'discovery-session',
        name: 'Client Discovery Session',
        description: 'Conduct detailed requirements gathering session',
        type: 'manual',
        assignedRole: 'consultant',
        dueInDays: 3,
        dependencies: [],
        completionCriteria: 'Discovery session completed with documented requirements',
        resources: [
          {
            id: 'discovery-template',
            name: 'Discovery Session Template',
            type: 'document',
            content: 'Structured questionnaire for client requirements gathering'
          }
        ]
      },
      {
        id: 'solution-design',
        name: 'Design Solution Architecture',
        description: 'Develop tailored solution based on discovery findings',
        type: 'manual',
        assignedRole: 'lead-consultant',
        dueInDays: 5,
        dependencies: ['discovery-session'],
        completionCriteria: 'Solution architecture document completed',
        resources: []
      },
      {
        id: 'resource-planning',
        name: 'Resource and Timeline Planning',
        description: 'Plan team resources and project timeline',
        type: 'manual',
        assignedRole: 'project-manager',
        dueInDays: 2,
        dependencies: ['solution-design'],
        completionCriteria: 'Resource plan and timeline finalized',
        resources: []
      },
      {
        id: 'proposal-creation',
        name: 'Create Comprehensive Proposal',
        description: 'Generate detailed proposal with SOW and pricing',
        type: 'manual',
        assignedRole: 'proposal-writer',
        dueInDays: 3,
        dependencies: ['resource-planning'],
        completionCriteria: 'Professional proposal document completed',
        resources: []
      },
      {
        id: 'proposal-review',
        name: 'Internal Proposal Review',
        description: 'Quality review and approval of proposal',
        type: 'approval',
        assignedRole: 'practice-lead',
        dueInDays: 1,
        dependencies: ['proposal-creation'],
        completionCriteria: 'Proposal reviewed and approved for delivery',
        resources: []
      }
    ],
    automationRules: [
      {
        id: 'proposal-delivery',
        trigger: 'step_completed',
        conditions: ['step_id:proposal-review'],
        actions: [
          {
            type: 'email',
            parameters: {
              template: 'proposal-delivery',
              recipient: 'client'
            }
          },
          {
            type: 'task',
            parameters: {
              title: 'Schedule proposal presentation',
              assignee: 'rep'
            }
          }
        ],
        isActive: true
      }
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true
  },

  // E-commerce/Retail Workflows
  {
    id: 'bulk-order-processing',
    name: 'Bulk Order Processing Workflow',
    description: 'Handle large volume orders with special pricing and terms',
    stage: 'acquire',
    steps: [
      {
        id: 'order-verification',
        name: 'Verify Order Details',
        description: 'Validate quantities, pricing, and delivery requirements',
        type: 'manual',
        assignedRole: 'order-specialist',
        dueInDays: 1,
        dependencies: [],
        completionCriteria: 'Order details verified and documented',
        resources: []
      },
      {
        id: 'inventory-check',
        name: 'Inventory Availability Check',
        description: 'Confirm product availability and lead times',
        type: 'automated',
        dueInDays: 0,
        dependencies: ['order-verification'],
        completionCriteria: 'Inventory status confirmed for all items',
        resources: []
      },
      {
        id: 'special-pricing',
        name: 'Apply Volume Pricing',
        description: 'Calculate and apply bulk pricing discounts',
        type: 'automated',
        dueInDays: 0,
        dependencies: ['inventory-check'],
        completionCriteria: 'Volume pricing applied and calculations verified',
        resources: []
      },
      {
        id: 'credit-check',
        name: 'Customer Credit Verification',
        description: 'Verify customer credit for large order amount',
        type: 'automated',
        dueInDays: 1,
        dependencies: ['special-pricing'],
        completionCriteria: 'Credit check completed with approval/conditions',
        resources: []
      },
      {
        id: 'final-approval',
        name: 'Management Approval',
        description: 'Final approval for large order with special terms',
        type: 'approval',
        assignedRole: 'sales-manager',
        dueInDays: 1,
        dependencies: ['credit-check'],
        completionCriteria: 'Management approval obtained',
        resources: []
      }
    ],
    automationRules: [
      {
        id: 'expedite-large-orders',
        trigger: 'order_value_threshold',
        conditions: ['order_value_above_50000'],
        actions: [
          {
            type: 'notification',
            parameters: {
              message: 'Large order detected - expediting approval process',
              recipients: ['sales-manager', 'order-specialist']
            }
          }
        ],
        isActive: true
      }
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true
  }
];

// Export combined templates
export const allWorkflowTemplates = [...industryWorkflowTemplates];