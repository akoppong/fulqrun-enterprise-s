import { useState } from 'react';
import { User } from '@/lib/types';
import { CollapsibleSidebarDemo } from './dashboard/CollapsibleSidebarDemo';

interface SimpleAppProps {
  user: User;
  onLogout?: () => void;
}

export function SimpleApp({ user, onLogout }: SimpleAppProps) {
  return <CollapsibleSidebarDemo user={user} />;
}