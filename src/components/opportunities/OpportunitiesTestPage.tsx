import { OpportunitiesTest } from '@/components/opportunities/OpportunitiesTest';

export function OpportunitiesTestPage() {
  const testUser = {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@fulqrun.com',
    role: 'rep' as const,
    avatar: '',
    territory: 'North America'
  };

  return (
    <div className="h-screen">
      <OpportunitiesTest user={testUser} />
    </div>
  );
}