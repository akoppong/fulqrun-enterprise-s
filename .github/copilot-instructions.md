# FulQrun Enterprise CRM - AI Coding Assistant Instructions

## Project Overview
FulQrun is a methodology-driven enterprise CRM built with React/TypeScript on Vite, embedding **PEAK** (Prospect → Engage → Acquire → Keep) and **MEDDPICC** qualification frameworks directly into sales workflows. This is a complex application with sophisticated sales methodology integration, AI-powered insights, and comprehensive testing infrastructure.

## Core Architecture Patterns

### Database System
- **KV-Based Repository Pattern**: Built on Spark's `useKV` hook with a sophisticated repository layer (`src/lib/database/`)
- **Transaction Management**: Use `withTransaction()` for multi-table operations
- **Schema Validation**: All entities use Zod schemas in `src/lib/database/schema.ts`
- **Auto-Initialization**: Database auto-initializes with sample data via `ensureDatabaseInitialized()`

```typescript
// Always use repositories, not direct KV access
import { db } from '@/lib/database';
const opportunity = await db.opportunities.create(data);

// For transactional operations
await withTransaction(async () => {
  const company = await db.companies.create(companyData);
  const opportunity = await db.opportunities.create({ ...oppData, company_id: company.id });
});
```

### State Management Convention
- **KV for Persistence**: `useKV('key', initialValue)` for data that needs persistence
- **useState for UI**: Local component state for UI-only concerns
- **Auto-Save Pattern**: Use `useAutoSave` hook for draft functionality with automatic recovery

### MEDDPICC/PEAK Integration
- **MEDDPICC Modules**: Comprehensive qualification with scoring algorithms (`src/components/meddpicc/`)
- **PEAK Stages**: Sales pipeline stages with built-in progression logic
- **Unified Components**: Use `UnifiedMEDDPICCModule` for embedded qualification
- **Scoring Service**: `MEDDPICCScoringService` provides advanced analytics and benchmarking

## Critical Development Workflows

### Running the Application
```bash
npm run dev                    # Start development server
npm run build                  # Production build (uses tsc -b --noCheck)
npm run kill                   # Kill processes on port 5000
```

### Testing Infrastructure
This project has extensive built-in testing components:
- **Validation Testing**: `src/components/dashboard/ComprehensiveValidationTestSuite.tsx`
- **Responsive Testing**: `src/components/testing/ResponsiveLayoutTester.tsx`
- **Form Testing**: `src/components/opportunities/ComprehensiveFormTestSuite.tsx`
- **Performance Testing**: `src/lib/testing-utils.ts` with `TestAutomationEngine`

Use the built-in test runners accessible through the dashboard rather than external testing frameworks.

### Error Handling Pattern
```typescript
// Global error handlers are initialized in App.tsx
import { setupGlobalErrorHandling } from './lib/error-handling';

// Use Enhanced Error Boundary for components
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
```

## Component Architecture

### Layout System
- **Responsive Design**: Built-in responsive utilities in `src/hooks/useResponsiveAutoFix.ts`
- **Dashboard Layout**: Sidebar navigation with role-based access control
- **Unified Components**: Use `Unified*` prefixed components for cross-module functionality

### Form Patterns
- **React Hook Form**: Standard form library with Zod validation
- **Auto-Save**: Implement with `useAutoSave` for draft functionality
- **Validation**: Real-time validation with business rule enforcement

### Role-Based Access Control (RBAC)
- **User Roles**: `admin`, `manager`, `sales_rep` with different feature access
- **Component Guards**: Check `user.role` before rendering sensitive features
- **Dashboard Views**: Different dashboards per role type

## Key Integration Points

### AI Services
- **AI Insights Engine**: `src/lib/ai-insights-engine.ts` for predictive analytics
- **Timeout Wrapper**: `src/lib/ai-timeout-wrapper.ts` for reliable AI calls
- **MEDDPICC AI**: Embedded AI hints and recommendations in qualification modules

### External Dependencies
- **Spark Framework**: Core UI and KV storage (@github/spark)
- **Radix UI**: Component primitives with extensive customization
- **Tailwind CSS**: Utility-first styling with custom configuration
- **Phosphor Icons**: Consistent icon system throughout

### Cross-Component Communication
- **Event-Driven**: Use Sonner toast for user feedback
- **State Lifting**: Lift state to common ancestors for complex interactions
- **Dashboard Context**: Central dashboard state manages navigation and user context

## File Organization Patterns

```
src/
├── components/           # Feature-based component organization
│   ├── opportunities/    # Opportunity management with PEAK/MEDDPICC
│   ├── meddpicc/        # Qualification framework components
│   ├── dashboard/       # Dashboard and analytics
│   ├── auth/           # Authentication components
│   └── ui/             # Reusable UI components
├── lib/                # Business logic and utilities
│   ├── database/       # Repository pattern implementation
│   ├── services/       # Business services
│   └── analytics/      # Performance and predictive analytics
├── hooks/              # Custom React hooks
└── data/               # Static data and configurations
```

## Performance Considerations

### KV Storage Optimization
- **Rate Limiting**: Built-in rate limiting in `useKVWithRateLimit.ts`
- **Error Recovery**: Automatic fallback mechanisms in `src/lib/kv-storage-manager.ts`
- **Data Validation**: Use `validateKVData()` for data integrity

### Large Dataset Handling
- **Pagination**: Implement pagination for large opportunity lists
- **Virtual Scrolling**: Consider for extensive data tables
- **Lazy Loading**: Load MEDDPICC data on-demand

## Business Logic Specifics

### Sales Methodology Enforcement
- **MEDDPICC Scoring**: Weighted scoring with stage readiness requirements
- **PEAK Progression**: Stage gates with qualification requirements
- **Pipeline Configuration**: Customizable pipeline stages via `PipelineConfigRepository`

### Analytics Integration
- **CSTPV Metrics**: Close, Size, Time, Probability, Value tracking
- **Predictive Analytics**: AI-powered deal outcome prediction
- **Performance Dashboards**: Real-time financial tracking with live updates

## Common Pitfalls to Avoid

1. **Don't bypass repositories**: Always use `db.tableName` instead of direct KV access
2. **Handle async initialization**: Database initialization is async - use `ensureDatabaseInitialized()`
3. **RBAC enforcement**: Always check user roles before rendering admin features
4. **Auto-save conflicts**: Use unique keys for auto-save to prevent data conflicts
5. **Component testing**: Use built-in test suites rather than external tools

## Extension Points

### Adding New Sales Methodologies
- Extend `src/data/meddpicc-config.ts` for new qualification frameworks
- Implement scoring services following `MEDDPICCScoringService` pattern
- Add new repository in `src/lib/database/repositories.ts`

### Custom Analytics
- Extend `PredictiveAnalytics` class for new prediction models
- Add new KPI metrics via `KPIMetricRepository`
- Implement custom dashboards following existing patterns

Remember: This is a methodology-driven CRM - sales processes and frameworks should guide technical implementation decisions.