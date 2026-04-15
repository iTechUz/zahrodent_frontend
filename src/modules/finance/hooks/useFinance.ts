import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Payment } from '@/shared/types';
import { toast } from 'sonner';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { useServerTable } from '@/shared/hooks/useServerTable';
import { FinanceService } from '../services/finance.service';
import { PaymentSchema } from '@/shared/lib/validation';
import { z } from 'zod';
import { paymentsApi, patientsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';

type PaymentFormValues = z.infer<typeof PaymentSchema>;

export const useFinance = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const table = useServerTable<Payment, { status?: string; method?: string; dateRange?: string }>({
    queryKey: queryKeys.payments,
    fetchFn: (params) => paymentsApi.list(params),
    initialFilters: { status: 'all', method: 'all', dateRange: 'all' },
    perPage: 10,
  });

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list({ limit: 1000 }),
    enabled: authed,
  });
  const patients = patientsData?.data ?? [];

  const { data: stats } = useQuery({
    queryKey: ['payments', 'stats'],
    queryFn: () => paymentsApi.stats(),
    enabled: authed,
  });

  const createMut = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast.success("To'lov qayd etildi");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Payment> }) =>
      paymentsApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast.success("To'lov yangilandi");
    },
  });

  const deleteMut = useMutation({
    mutationFn: paymentsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast.success("To'lov o'chirildi");
    },
  });

  const dialog = useDialogState<Payment>(FinanceService.initialState());

  const handleSave = useCallback(
    (data: PaymentFormValues) => {
      if (dialog.editingItem) {
        updateMut.mutate(
          { id: dialog.editingItem.id, body: data },
          { onSettled: () => dialog.closeDialog() },
        );
      } else {
        createMut.mutate(data, { onSettled: () => dialog.closeDialog() });
      }
    },
    [dialog, createMut, updateMut],
  );

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteMut.mutate(deleteId, { onSettled: () => setDeleteId(null) });
    }
  }, [deleteId, deleteMut]);

  return {
    payments: table.data,
    totalCount: table.totalCount,
    totalPages: table.totalPages,
    page: table.page,
    setPage: table.setPage,
    patients,
    totalRevenue: stats?.totalRevenue ?? 0,
    thisMonth: stats?.todayRevenue ?? 0,
    totalDebt: stats?.pendingAmount ?? 0,
    unpaidCount: 0,
    search: table.search,
    setSearch: table.setSearch,
    filters: table.filters,
    setFilters: table.setFilters,
    modalOpen: dialog.isOpen,
    setModalOpen: dialog.setIsOpen,
    editing: dialog.editingItem,
    deleteId,
    setDeleteId,
    openCreate: dialog.openCreate,
    openEdit: (p: Payment) => dialog.openEdit(p, FinanceService.mapToForm),
    handleSave,
    handleDelete,
    isLoading: table.isLoading || patientsLoading,
  };
};

