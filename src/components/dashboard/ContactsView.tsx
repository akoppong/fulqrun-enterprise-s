import { useKV } from '@github/spark/hooks';
import { Contact, Company } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AddressBook, Plus, Search, Building2, Phone, Envelope } from '@phosphor-icons/react';
import { useState } from 'react';

export function ContactsView() {
  const [contacts] = useKV<Contact[]>('contacts', []);
  const [companies] = useKV<Company[]>('companies', []);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(contact => 
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    return company?.name || 'Unknown Company';
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      champion: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'decision-maker': { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      influencer: { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      user: { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
      blocker: { variant: 'destructive' as const, color: 'bg-orange-100 text-orange-800' }
    };
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Contacts</h2>
          <p className="text-muted-foreground">Manage your customer relationships and key contacts</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {filteredContacts.length} contacts
          </Badge>
          <Button>
            <Plus size={20} className="mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AddressBook size={20} />
            Contact Directory
          </CardTitle>
          <div className="flex items-center gap-2">
            <Search size={16} className="text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Building2 size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground truncate">
                          {getCompanyName(contact.companyId)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <Badge className={getRoleBadge(contact.role).color}>
                      {contact.role.replace('-', ' ')}
                    </Badge>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Envelope size={12} />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone size={12} />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <AddressBook size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No contacts found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Start by adding your first contact'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Roles Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['champion', 'decision-maker', 'influencer', 'user', 'blocker'].map(role => {
                const count = contacts.filter(c => c.role === role).length;
                const percentage = contacts.length > 0 ? (count / contacts.length) * 100 : 0;
                const roleConfig = getRoleBadge(role);
                
                return (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={roleConfig.color}>
                        {role.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Companies Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companies.slice(0, 5).map(company => {
                const contactCount = contacts.filter(c => c.companyId === company.id).length;
                
                return (
                  <div key={company.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <h4 className="font-medium text-sm">{company.name}</h4>
                      <p className="text-xs text-muted-foreground">{company.industry}</p>
                    </div>
                    <Badge variant="outline">{contactCount} contacts</Badge>
                  </div>
                );
              })}
              
              {companies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No companies added yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}