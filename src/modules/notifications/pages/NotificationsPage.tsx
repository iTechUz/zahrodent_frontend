import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { useServerTable } from '@/shared/hooks/useServerTable';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { patientsApi, notificationsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import { Notification } from '@/shared/types';

const notifStatusLabels: Record<string, string> = {
  sent: 'Yuborilgan', delivered: 'Yetkazilgan', failed: 'Xatolik',
};

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

  const sendRemindersMut = useMutation({
    mutationFn: () => notificationsApi.sendReminders(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      toast.success(`${data.created} ta eslatma yuborildi`);
    },
  });

  const sendReminders = () => sendRemindersMut.mutate();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bildirishnomalar"
        description="SMS va Telegram orqali xabarnomalar"
        action={
          <Button onClick={sendReminders} disabled={sendRemindersMut.isPending}>
            <Send className="w-4 h-4 mr-2" />
            Eslatma yuborish
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-info/15 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-info" /></div>
          <div><p className="text-sm font-semibold">SMS xabarnomalar</p><p className="text-xs text-muted-foreground">{table.totalCount} ta bildirishnoma</p></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-info/15 flex items-center justify-center"><Send className="w-5 h-5 text-info" /></div>
          <div><p className="text-sm font-semibold">Bildirishnomalar holati</p><p className="text-xs text-muted-foreground">Oxirgi yuborilganlar</p></div>
        </div>
      </div>

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
              {table.data.map((n) => {
                const patient = patients.find((p) => p.id === n.patientId);
                return (
                  <tr key={n.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{patient?.firstName} {patient?.lastName}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={cn('text-xs', n.type === 'telegram' ? 'bg-info/15 text-info border-info/30' : 'bg-accent text-accent-foreground')}>{n.type.toUpperCase()}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{n.message}</td>
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => table.setPage(Math.max(0, table.page - 1))}
                disabled={table.page === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Oldingi
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                {table.page + 1} / {table.totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => table.setPage(Math.min(table.totalPages - 1, table.page + 1))}
                disabled={table.page === table.totalPages - 1}
              >
                Keyingi
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
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
