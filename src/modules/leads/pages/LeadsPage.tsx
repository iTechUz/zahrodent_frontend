import { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { PageHeader } from '@/shared/components/PageHeader';
import { Lead, LeadStatus } from '@/shared/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, MessageSquare, Trash2, CalendarPlus, Search, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/shared/components/DataTable';
import { formatDate } from '@/shared/lib/formatters';

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Yangi', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'contacted', label: 'Bog\'lanildi', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'converted', label: 'Qabulga yozildi', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'cancelled', label: 'Bekor qilindi', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function LeadsPage() {
  const { 
    leads, 
    isLoading, 
    updateStatus, 
    deleteLead,
    search,
    setSearch,
    filters,
    setFilters,
    page,
    setPage,
    totalPages,
    totalCount
  } = useLeads();
  
  const navigate = useNavigate();
  const [view, setView] = useState<'board' | 'table'>('board');

  const handleConvertToPatient = (lead: Lead) => {
    navigate('/patients', { state: { createFromLead: lead } });
  };

  const columns: Column<Lead>[] = [
    { 
      header: 'Ism', 
      accessor: (l) => <span className="font-medium">{l.name}</span>
    },
    { header: 'Telefon', accessor: 'phone' },
    { header: 'Xizmat turi', accessor: (l) => l.service || '—' },
    { 
      header: 'Holati', 
      accessor: (l) => {
        const statusObj = STATUS_COLUMNS.find(s => s.id === l.status);
        return (
          <Select
            value={l.status}
            onValueChange={(v: LeadStatus) => updateStatus({ id: l.id, status: v })}
          >
            <SelectTrigger className="h-8 text-xs w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_COLUMNS.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
    },
    { 
      header: 'Sana', 
      accessor: (l) => <span className="text-xs text-muted-foreground">{formatDate(l.createdAt)}</span> 
    },
    {
      header: 'Amallar',
      accessor: (l) => (
        <div className="flex gap-2">
          {l.status !== 'converted' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => handleConvertToPatient(l)} title="Bemorga aylantirish">
              <CalendarPlus className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteLead(l.id)} title="O'chirish">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Murojaatlar (Lidlar)"
        description="Telegram bot orqali tushgan barcha murojaatlar"
      />

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Ism yoki telefon qidirish..." 
              className="pl-9" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(val) => setFilters('status', val === 'all' ? undefined : val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Barcha holatlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha holatlar</SelectItem>
              {STATUS_COLUMNS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={view} onValueChange={(v: any) => setView(v)} className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="board"><LayoutGrid className="w-4 h-4 mr-2"/> Doska</TabsTrigger>
            <TabsTrigger value="table"><List className="w-4 h-4 mr-2"/> Jadval</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map(column => {
            const columnLeads = leads.filter(l => l.status === column.id);
            
            return (
              <div key={column.id} className="bg-muted/30 rounded-xl p-4 flex flex-col min-h-[500px] min-w-[300px]">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-semibold text-sm">{column.label}</h3>
                  <Badge variant="secondary" className="rounded-full">{columnLeads.length}</Badge>
                </div>
                
                <div className="space-y-3 flex-1">
                  {isLoading ? (
                    <div className="text-xs text-muted-foreground text-center py-8">Yuklanmoqda...</div>
                  ) : columnLeads.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-8">
                      Murojaatlar yo'q
                    </div>
                  ) : (
                    columnLeads.map(lead => (
                      <div key={lead.id} className="bg-card p-4 rounded-lg border shadow-sm flex flex-col gap-3 group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{lead.name}</h4>
                            <a href={`tel:${lead.phone}`} className="text-xs text-primary flex items-center mt-1 hover:underline">
                              <Phone className="w-3 h-3 mr-1" />
                              {lead.phone}
                            </a>
                          </div>
                        </div>
                        
                        {lead.service && (
                          <div className="text-xs bg-muted p-1.5 rounded-md text-muted-foreground">
                            Xizmat: <span className="font-medium text-foreground">{lead.service}</span>
                          </div>
                        )}
                        
                        {lead.message && (
                          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md line-clamp-3">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            {lead.message}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1 pt-2 border-t">
                          <Select
                            value={lead.status}
                            onValueChange={(v: LeadStatus) => updateStatus({ id: lead.id, status: v })}
                          >
                            <SelectTrigger className="h-7 text-xs w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_COLUMNS.map(s => (
                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {lead.status !== 'converted' && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => handleConvertToPatient(lead)}>
                                <CalendarPlus className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteLead(lead.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <DataTable 
            data={leads} 
            columns={columns} 
            isLoading={isLoading}
          />
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card rounded-b-xl border-x">
              <p className="text-xs text-muted-foreground">Jami: {totalCount} ta murojaat</p>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Oldingi
                </Button>
                <div className="flex items-center px-4 text-sm font-medium">
                  {page + 1} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                >
                  Keyingi
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
