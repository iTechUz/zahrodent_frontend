import { useLeads } from '../hooks/useLeads';
import { PageHeader } from '@/components';
import { Lead, LeadStatus } from '@/shared/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatUzS } from '@/shared/lib/formatters';
import { Phone, MessageSquare, Trash2, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new', label: 'Yangi', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'contacted', label: 'Bog\'lanildi', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'converted', label: 'Qabulga yozildi', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'cancelled', label: 'Bekor qilindi', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function LeadsPage() {
  const { leads, isLoading, updateStatus, deleteLead } = useLeads();
  const navigate = useNavigate();

  const handleConvertToPatient = (lead: Lead) => {
    // Navigate to patients page with state to open create dialog automatically
    // For simplicity, we just pass state
    navigate('/patients', { state: { createFromLead: lead } });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Yuklanmoqda...</div>;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Murojaatlar (Lidlar)"
        description="Telegram bot orqali tushgan barcha murojaatlar"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATUS_COLUMNS.map(column => {
          const columnLeads = leads.filter(l => l.status === column.id);
          
          return (
            <div key={column.id} className="bg-muted/30 rounded-xl p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <Badge variant="secondary" className="rounded-full">{columnLeads.length}</Badge>
              </div>
              
              <div className="space-y-3 flex-1">
                {columnLeads.length === 0 ? (
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
                          <SelectTrigger className="h-7 text-xs w-[130px]">
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
    </div>
  );
}
