import { useState } from 'react';
import { useLeads } from '../hooks/useLeads';
import { PageHeader } from '@/shared/components/PageHeader';
import { Lead, LeadStatus } from '@/shared/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  MessageSquare, 
  Trash2, 
  CalendarPlus, 
  Search, 
  LayoutGrid, 
  List, 
  Copy, 
  ExternalLink,
  MessageCircle,
  Clock,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Column } from '@/shared/components/DataTable';
import { formatDate } from '@/shared/lib/formatters';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string; bgColor: string }[] = [
  { id: 'new', label: 'Yangi', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  { id: 'contacted', label: 'Bog\'lanildi', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  { id: 'converted', label: 'Qabulga yozildi', color: 'text-green-700', bgColor: 'bg-green-50' },
  { id: 'cancelled', label: 'Bekor qilindi', color: 'text-red-700', bgColor: 'bg-red-50' },
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

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as LeadStatus;
    updateStatus({ id: draggableId, status: newStatus });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nusxalandi: " + text);
  };

  const columns: Column<Lead>[] = [
    { 
      header: 'Ism', 
      accessor: (l) => (
        <div className="flex flex-col">
          <span className="font-medium">{l.name}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDate(l.createdAt)}
          </span>
        </div>
      )
    },
    { 
      header: 'Telefon', 
      accessor: (l) => (
        <div className="flex items-center gap-2">
          <span>{l.phone}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(l.phone)}>
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      )
    },
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
            {STATUS_COLUMNS.map(column => {
              const columnLeads = leads.filter(l => l.status === column.id);
              
              return (
                <div key={column.id} className={`${column.bgColor}/30 border rounded-xl flex flex-col min-h-[600px] min-w-[320px]`}>
                  <div className="flex items-center justify-between p-4 border-b bg-white/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${column.color.replace('text', 'bg')}`} />
                      <h3 className="font-semibold text-sm">{column.label}</h3>
                    </div>
                    <Badge variant="outline" className="bg-white">{columnLeads.length}</Badge>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`p-3 space-y-3 flex-1 transition-colors ${snapshot.isDraggingOver ? 'bg-white/40' : ''}`}
                      >
                        {isLoading ? (
                          <div className="text-xs text-muted-foreground text-center py-8">Yuklanmoqda...</div>
                        ) : columnLeads.length === 0 ? (
                          <div className="text-xs text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg opacity-50">
                            Murojaatlar yo'q
                          </div>
                        ) : (
                          columnLeads.map((lead, index) => (
                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-card p-4 rounded-lg border shadow-sm flex flex-col gap-3 group hover:border-primary/50 transition-all ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-2 ring-primary/20' : ''}`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                                        <h4 className="font-semibold text-sm">{lead.name}</h4>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <a href={`tel:${lead.phone}`} className="text-xs text-primary font-medium flex items-center hover:underline">
                                          <Phone className="w-3 h-3 mr-1" />
                                          {lead.phone}
                                        </a>
                                        <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={(e) => { e.preventDefault(); copyToClipboard(lead.phone); }}>
                                          <Copy className="w-2.5 h-2.5" />
                                        </Button>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-muted/50">
                                      {lead.source === 'telegram_bot' ? 'Bot' : 'Web'}
                                    </Badge>
                                  </div>
                                  
                                  {lead.service && (
                                    <div className="text-[11px] bg-primary/10 text-primary px-2 py-1.5 rounded border border-primary/20 font-semibold uppercase tracking-wider">
                                      {lead.service}
                                    </div>
                                  )}
                                  
                                  {lead.message && (
                                    <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-muted/50 leading-relaxed">
                                      <MessageSquare className="w-3 h-3 inline mr-1 opacity-70" />
                                      {lead.message}
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between mt-1 pt-2 border-t">
                                    <div className="flex items-center gap-1.5">
                                      <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50 border-green-100" asChild>
                                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                                          <MessageCircle className="w-4 h-4" />
                                        </a>
                                      </Button>
                                      <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 border-blue-100" asChild title="Telegramda yozish">
                                        <a href={`https://t.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                                          <ExternalLink className="w-4 h-4" />
                                        </a>
                                      </Button>
                                    </div>
                                    
                                    <div className="flex gap-1.5">
                                      {lead.status !== 'converted' && (
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700 bg-green-50/50" 
                                          onClick={() => handleConvertToPatient(lead)} 
                                          title="Bemorga aylantirish"
                                        >
                                          <CalendarPlus className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-destructive hover:bg-red-100 hover:text-red-700" 
                                        onClick={() => deleteLead(lead.id)} 
                                        title="O'chirish"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
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
