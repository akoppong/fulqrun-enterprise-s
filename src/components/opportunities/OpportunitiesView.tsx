import { OpportunityDetailTestRunner } from './OpportunityDetailTestRunner';

interface OpportunitiesViewProps {
  className?: string;
}

export function OpportunitiesView({ className }: OpportunitiesViewProps) {
  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <OpportunityDetailTestRunner />
    </div>
  );
}
}