import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Payment } from '@/shared/types';
import { toast } from 'sonner';
import { useDataTable } from '@/shared/hooks/useDataTable';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { FinanceService } from '../services/finance.service';
import { PaymentSchema } from '@/shared/lib/validation';
import { z } from 'zod';
import { paymentsApi, patientsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';

type PaymentFormValues = z.infer<typeof PaymentSchema>;

function startOfCurrentMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export const useFinance = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: queryKeys.payments,
    queryFn: () => paymentsApi.list(),
    enabled: authed,
  });

  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list(),
    enabled: authed,
  });

  const monthStart = useMemo(() => startOfCurrentMonth(), []);

  const totalRevenue = useMemo(
    () => payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    [payments],
  );

  const totalDebt = useMemo(
    () => payments.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0),
    [payments],
  );

  const thisMonth = useMemo(
    () =>
      payments
        .filter((p) => p.date >= monthStart && p.status === 'paid')
        .reduce((s, p) => s + p.amount, 0),
    [payments, monthStart],
  );

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

  const table = useDataTable<Payment>({
    data: payments,
    filterFn: (p, search, filters) => {
      const patient = patients.find((pt) => pt.id === p.patientId);
      const matchSearch =
        !search ||
        `${patient?.firstName} ${patient?.lastName} ${p.description}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchStatus = filters.status === 'all' || p.status === filters.status;
      return matchSearch && matchStatus;
    },
    initialFilters: { status: 'all' },
  });

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
    patients,
    totalRevenue,
    thisMonth,
    totalDebt,
    unpaidCount: payments.filter((p) => p.status !== 'paid').length,
    search: table.search,
    setSearch: table.setSearch,
    filterStatus: table.filters.status,
    setFilterStatus: (v: string) => table.setFilters('status', v),
    modalOpen: dialog.isOpen,
    setModalOpen: dialog.setIsOpen,
    editing: dialog.editingItem,
    deleteId,
    setDeleteId,
    openCreate: dialog.openCreate,
    openEdit: (p: Payment) => dialog.openEdit(p, FinanceService.mapToForm),
    handleSave,
    handleDelete,
    isLoading,
  };
};
