# FulQrun CRM - Professional Enterprise Sales Platform

FulQrun is a methodology-driven CRM that embeds PEAK (Prospect → Engage → Acquire → Keep) and MEDDPICC qualification frameworks directly into sales workflows, enabling enterprise teams to execute consistent, high-performance sales operations.

**Experience Qualities**:
1. **Professional** - Clean, enterprise-grade interface that instills confidence in executive users
2. **Systematic** - Methodology-driven workflows that guide reps through proven sales processes
3. **Intelligent** - Data-driven insights that surface actionable next steps and pipeline risks

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Multi-role dashboard system with sophisticated sales methodology integration, pipeline management, and analytics requiring extensive state management and user permissions.

## Essential Features

**Authentication & Role Management**
- Functionality: Secure login with role-based access (Rep, Manager, Admin)
- Purpose: Enterprise security and appropriate feature access per user type
- Trigger: Application launch and route navigation
- Progression: Login → Role detection → Dashboard routing → Feature access control
- Success criteria: Users see only features appropriate to their role

**Opportunity Pipeline Management**
- Functionality: Visual pipeline with PEAK stages (Prospect, Engage, Acquire, Keep) and drag-and-drop progression
- Purpose: Clear visibility into deal progression using proven sales methodology
- Trigger: Creating new opportunities or updating existing ones
- Progression: Create opportunity → MEDDPICC qualification → Stage progression → Deal closure tracking
- Success criteria: Pipeline accurately reflects deal status with embedded methodology guidance

**MEDDPICC Qualification Framework**
- Functionality: Structured qualification forms with Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Implicate Pain, Champion tracking
- Purpose: Ensure thorough opportunity qualification using industry-standard framework
- Trigger: Opportunity creation or qualification review
- Progression: Opportunity selected → MEDDPICC form → Qualification scoring → Risk assessment → Action recommendations
- Success criteria: Sales reps complete qualification consistently with scoring guidance

**Contact & Company Management**
- Functionality: Customer relationship database with company hierarchies and contact roles
- Purpose: Centralize customer information and relationship mapping
- Trigger: New prospect identification or existing customer interaction
- Progression: Add company → Add contacts → Define relationships → Track interactions → Update statuses
- Success criteria: Complete customer profiles with clear relationship mapping

**Analytics Dashboard**
- Functionality: Pipeline analytics, conversion rates, deal velocity, and CSTPV (Close, Size, Time, Probability, Value) metrics
- Purpose: Data-driven insights for sales performance optimization
- Trigger: Dashboard access or reporting request
- Progression: Select date range → Choose metrics → View visualizations → Drill down details → Export insights
- Success criteria: Clear visualization of sales performance with actionable insights

## Edge Case Handling
- **Incomplete Data**: Graceful handling of missing opportunity information with clear prompts
- **Role Conflicts**: Clear error messaging when users attempt unauthorized actions
- **Data Sync Issues**: Offline capability with sync conflict resolution
- **Large Datasets**: Pagination and filtering for enterprise-scale data volumes
- **Browser Compatibility**: Fallbacks for unsupported features across enterprise browsers

## Design Direction
The design should feel sophisticated, trustworthy, and executive-ready - conveying enterprise reliability while maintaining modern usability. Clean, data-rich interface that prioritizes information density without overwhelming users.

## Color Selection
Complementary (opposite colors) - Professional blue primary with strategic orange accents to create trust (blue) while highlighting critical actions and alerts (orange).

- **Primary Color**: Deep Professional Blue (oklch(0.45 0.15 240)) - Communicates trust, stability, and corporate professionalism
- **Secondary Colors**: Light Blue (oklch(0.85 0.08 240)) for backgrounds and Neutral Gray (oklch(0.65 0 0)) for supporting elements
- **Accent Color**: Strategic Orange (oklch(0.65 0.18 45)) - Draws attention to CTAs, warnings, and important metrics
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 16.4:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 240)): White text (oklch(1 0 0)) - Ratio 7.2:1 ✓
  - Accent (Strategic Orange oklch(0.65 0.18 45)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Card (Light Gray oklch(0.98 0 0)): Dark Gray text (oklch(0.2 0 0)) - Ratio 15.8:1 ✓

## Font Selection
Professional, highly legible typeface that conveys authority and clarity for data-heavy enterprise interfaces.

- **Typographic Hierarchy**: 
  - H1 (Dashboard Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing  
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Primary Content): Inter Regular/16px/relaxed line height
  - Caption (Metadata): Inter Regular/14px/compact spacing

## Animations
Subtle, professional transitions that enhance usability without distracting from business-critical information.

- **Purposeful Meaning**: Smooth state transitions that guide attention to updated data and confirm user actions
- **Hierarchy of Movement**: 
  - High Priority: Pipeline stage transitions, data updates, alert notifications
  - Medium Priority: Navigation transitions, modal appearances
  - Low Priority: Hover states, micro-interactions

## Component Selection
- **Components**: Cards for opportunity summaries, Tabs for dashboard sections, Dialog for MEDDPICC forms, Tables for contact lists, Progress bars for pipeline stages, Badges for deal status, Select dropdowns for filters
- **Customizations**: Custom pipeline visualization component, MEDDPICC scoring widget, CSTPV metrics dashboard
- **States**: Loading states for data fetching, empty states for new users, error states with recovery options, success confirmations for important actions
- **Icon Selection**: Phosphor icons - professional, consistent iconography focusing on business/analytics icons
- **Spacing**: Consistent 4px base unit (Tailwind's spacing-4, spacing-6, spacing-8) for enterprise-appropriate information density
- **Mobile**: Responsive design with collapsible sidebar, simplified pipeline view, and touch-optimized form inputs for field sales access