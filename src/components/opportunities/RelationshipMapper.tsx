import React, { useEffect, useState } from 'react';
import { Opportunity, Company, Contact } from '@/lib/types';

interface RelationshipMapperProps {
  opportunities?: Opportunity[];
  companies?: Company[];
  contacts?: Contact[];
}

export function RelationshipMapper({ opportunities, companies, contacts }: RelationshipMapperProps) {
  const [relationships, setRelationships] = useState<any[]>([]);

  useEffect(() => {
    const loadRelationshipData = () => {
      try {
        // Ensure all inputs are arrays
        const validOpportunities = Array.isArray(opportunities) ? opportunities : [];
        const validCompanies = Array.isArray(companies) ? companies : [];
        const validContacts = Array.isArray(contacts) ? contacts : [];

        // Build relationships between opportunities, companies, and contacts
        const mappedRelationships = validOpportunities.map(opp => ({
          opportunityId: opp.id,
          companyId: opp.companyId,
          contactId: opp.contactId,
          company: validCompanies.find(c => c.id === opp.companyId),
          contact: validContacts.find(c => c.id === opp.contactId)
        }));

        setRelationships(mappedRelationships);
      } catch (error) {
        console.error('Error loading relationship data:', error);
        setRelationships([]);
      }
    };

    loadRelationshipData();
  }, [opportunities, companies, contacts]);

  // This component doesn't render anything visible - it just manages relationship mapping
  return null;
}

export default RelationshipMapper;