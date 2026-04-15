import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { useServerTable } from '@/shared/hooks/useServerTable';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatCard } from '@/shared/components/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, MessageSquare, ChevronLeft, ChevronRight, Bell, ShieldCheck, 
  Calendar, CheckSquare, Square, Search, RefreshCcw, Loader2, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { patientsApi, notificationsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import { Notification } from '@/shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useBulkSms, DatePreset } from '../hooks/useBulkSms';

const notifStatusLabels: Record<string, string> = {
  sent: 'Yuborilgan', delivered: 'Yetkazilgan', failed: 'Xatolik',
};

function NotificationsHistoryTab({ table, patients }: { table: any, patients: any[] }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bemor</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Turi</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Xabar</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Yuborilgan vaqt</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Holat</th>
          </tr></thead>
          <tbody className={cn(table.isLoading && 'opacity-50')}>
            {table.data.map((n: Notification) => {
              const patient = patients.find((p) => p.id === n.patientId);
              return (
                <tr key={n.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{patient?.firstName} {patient?.lastName}</div>
                    <div className="text-[10px] text-muted-foreground">{patient?.phone}</div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className={cn('text-xs', n.type === 'telegram' ? 'bg-info/15 text-info border-info/30' : 'bg-secondary text-secondary-foreground border-none')}>SMS</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={n.message}>{n.message}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(n.sentAt).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={cn('text-xs', n.status === 'delivered' ? 'bg-success/15 text-success border-success/30' : n.status === 'failed' ? 'bg-destructive/15 text-destructive border-destructive/30' : 'bg-warning/15 text-warning border-warning/30')}>{notifStatusLabels[n.status]}</Badge></td>
                </tr>
              );
            })}
            {table.data.length === 0 && !table.isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Bildirishnomalar topilmadi</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {table.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground">Jami: {table.totalCount} ta</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => table.setPage(table.page - 1)} disabled={table.page === 0}><ChevronLeft className="w-4 h-4 mr-1" /> Oldingi</Button>
            <div className="flex items-center px-4 text-sm font-medium">{table.page + 1} / {table.totalPages}</div>
            <Button variant="outline" size="sm" onClick={() => table.setPage(table.page + 1)} disabled={table.page === table.totalPages - 1}>Keyingi <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

function BulkSmsTab() {
  const {
    recipients,
    isLoading,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    datePreset,
    setDatePreset,
    message,
    setMessage,
    handleSend,
    isSending,
  } = useBulkSms();

  const presets: { id: DatePreset; label: string }[] = [
    { id: 'tomorrow', label: 'Ertaga' },
    { id: 'nextWeek', label: 'Keyingi hafta' },
    { id: 'nextMonth', label: 'Keyingi oy' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <Button 
              key={p.id}
              variant={datePreset === p.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDatePreset(p.id)}
              className="rounded-full"
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleSelectAll} className="h-8 w-8">
                {selectedIds.length === recipients.length && recipients.length > 0 ? (
                  <CheckSquare className="w-5 h-5 text-primary" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
              <span className="text-sm font-medium">Barchasini tanlash ({recipients.length})</span>
            </div>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                {selectedIds.length} ta tanlandi
              </Badge>
            )}
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Yuklanmoqda...
              </div>
            ) : recipients.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                Bu muddat uchun SMS kutayotgan mijozlar topilmadi
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/50">
                  {recipients.map((r: any) => (
                    <tr 
                      key={r.id} 
                      className={cn(
                        "hover:bg-muted/10 transition-colors cursor-pointer",
                        selectedIds.includes(r.id) && "bg-primary/5"
                      )}
                      onClick={() => toggleSelect(r.id)}
                    >
                      <td className="w-12 px-4 py-3">
                        {selectedIds.includes(r.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="font-medium">{r.firstName} {r.lastName}</div>
                        <div className="text-[10px] text-muted-foreground">{r.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-[11px] font-medium text-primary">
                          {new Date(r.bookingDate).toLocaleDateString('uz-UZ')}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{r.bookingTime}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm sticky top-4">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                SMS Matni
              </label>
              <Textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Xabar matnini kiriting..."
                className="min-h-[150px] bg-background/50 resize-none border-border/50 focus:border-primary/50"
              />
              <p className="text-[10px] text-muted-foreground text-right italic">
                {message.length} belgi
              </p>
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary/80 leading-relaxed">
                Diqqat! SMS xabarlar Eskiz.uz balansi orqali yuboriladi. Xabarlarni yuborishdan oldin matnni qayta tekshiring.
              </p>
            </div>

            <Button 
              className="w-full gradient-primary py-6" 
              onClick={handleSend}
              disabled={isSending || selectedIds.length === 0}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {selectedIds.length} ta SMS yuborish
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NotificationsPageContent() {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const table = useServerTable<Notification, {}>({
    queryKey: queryKeys.notifications,
    fetchFn: (params) => notificationsApi.list(params),
    perPage: 15,
  });

  const { data: patientsData } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list({ limit: 1000 }),
    enabled: authed,
  });
  const patients = patientsData?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bildirishnomalar"
        description="Mijozlar bilan aloqa va SMS eslatmalar markazi"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Yuborilgan xabarlar" 
          value={table.totalCount} 
          icon={<MessageSquare className="w-5 h-5 text-info" />} 
          trend="Jami tarix"
        />
        <StatCard 
          title="Tizim holati" 
          value="SMS Faol" 
          icon={<ShieldCheck className="w-5 h-5 text-success" />} 
          trend="Eskiz.uz ulanmagan"
          trendUp={true}
        />
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="send" className="rounded-lg gap-2">
            <Send className="w-4 h-4" /> SMS Yuborish
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg gap-2">
            <RefreshCcw className="w-4 h-4" /> Tarix
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <BulkSmsTab />
        </TabsContent>
        <TabsContent value="history">
          <NotificationsHistoryTab table={table} patients={patients} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ErrorBoundary name="Bildirishnomalar">
      <NotificationsPageContent />
    </ErrorBoundary>
  );
}
