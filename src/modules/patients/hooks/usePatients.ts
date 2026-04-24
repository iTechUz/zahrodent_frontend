import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Patient } from '@/shared/types';
import { toast } from 'sonner';
import { useServerTable } from '@/shared/hooks/useServerTable';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { PatientService } from '../services/patient.service';
import { PatientSchema } from '@/shared/lib/validation';
import { z } from 'zod';
import { patientsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';

type PatientFormValues = z.infer<typeof PatientSchema>;

export const usePatients = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const table = useServerTable<
    Patient,
    { source?: string; startDate?: string; endDate?: string; debtOnly?: string }
  >({
    queryKey: queryKeys.patients,
    fetchFn: (params) => patientsApi.list(params),
    perPage: 10,
  });

  const { data: stats } = useQuery({
    queryKey: ['patients', 'stats'],
    queryFn: () => patientsApi.stats(),
    enabled: authed,
  });

  const createMut = useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      toast.success("Yangi bemor qo'shildi");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Patient> }) =>
      patientsApi.update(id, body),
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      queryClient.invalidateQueries({ queryKey: queryKeys.patient(v.id) });
      toast.success("Bemor ma'lumotlari yangilandi");
    },
  });

  const deleteMut = useMutation({
    mutationFn: patientsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      toast.success("Bemor o'chirildi");
    },
  });

  const dialog = useDialogState<Patient>(PatientService.initialState());


  const handleSave = useCallback(
    (data: PatientFormValues) => {
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
    patients: table.data,
    totalPatients: table.totalCount,
    totalPages: table.totalPages,
    page: table.page,
    setPage: table.setPage,
    search: table.search,
    setSearch: table.setSearch,
    filters: table.filters,
    setFilters: table.setFilters,
    modalOpen: dialog.isOpen,
    setModalOpen: dialog.setIsOpen,
    editing: dialog.editingItem,
    openCreate: dialog.openCreate,
    openEdit: (p: Patient) => dialog.openEdit(p, PatientService.mapToForm),
    handleSave,
    deleteId,
    setDeleteId,
    handleDelete,
    isLoading: table.isLoading,
    isSaving: createMut.isPending || updateMut.isPending,
    stats,
  };
};
