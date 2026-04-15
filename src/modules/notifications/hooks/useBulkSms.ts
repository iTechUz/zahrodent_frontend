import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { format, addDays, addMonths, startOfDay, endOfDay } from 'date-fns';

export type DatePreset = 'tomorrow' | 'nextWeek' | 'nextMonth' | 'custom';

export const useBulkSms = () => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>('tomorrow');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>({
    start: startOfDay(new Date()),
    end: endOfDay(addDays(new Date(), 1)),
  });

  const [message, setMessage] = useState('Eslatman: Qabulingiz [sana] kuni soat [vaqt] da kutilmoqda. Zahro Dental.');

  const dateRange = useMemo(() => {
    const now = new Date();
    if (datePreset === 'tomorrow') {
      const tomorrow = addDays(now, 1);
      return { start: startOfDay(tomorrow), end: endOfDay(tomorrow) };
    }
    if (datePreset === 'nextWeek') {
      return { start: startOfDay(now), end: endOfDay(addDays(now, 7)) };
    }
    if (datePreset === 'nextMonth') {
      return { start: startOfDay(now), end: endOfDay(addMonths(now, 1)) };
    }
    return customRange;
  }, [datePreset, customRange]);

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['sms-recipients', dateRange],
    queryFn: () => notificationsApi.getRecipients({
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
    }),
  });

  const bulkSendMut = useMutation({
    mutationFn: (body: { patientIds: string[]; message: string }) => 
      notificationsApi.bulkSend(body),
    onSuccess: (res) => {
      toast.success(`${res.sent} ta SMS muvaffaqiyatli yuborildi. ${res.failed} ta xato.`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['notifications'] }); // Invalidate history
      queryClient.invalidateQueries({ queryKey: ['sms-recipients'] }); // Refresh list (should remove sent ones)
    },
    onError: () => {
      toast.error('SMS yuborishda xatolik yuz berdi');
    }
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === recipients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recipients.map(r => r.id));
    }
  };

  const handleSend = () => {
    if (selectedIds.length === 0) {
      toast.error('Kamida bitta mijozni tanlang');
      return;
    }
    if (message.length < 5) {
      toast.error('SMS xabari juda qisqa');
      return;
    }
    bulkSendMut.mutate({ patientIds: selectedIds, message });
  };

  return {
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
    isSending: bulkSendMut.isPending,
  };
};
