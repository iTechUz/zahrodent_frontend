import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Booking, BookingStatus } from '@/shared/types';
import { BOOKING_STATUS_LABELS } from '@/shared/constants';
import { toast } from 'sonner';
import { useDataTable } from '@/shared/hooks/useDataTable';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { BookingService } from '../services/booking.service';
import { BookingSchema } from '@/shared/lib/validation';
import { z } from 'zod';
import { bookingsApi, patientsApi, doctorsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';

type BookingFormValues = z.infer<typeof BookingSchema>;

export const useBookings = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => bookingsApi.list(),
    enabled: authed,
  });

  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list(),
    enabled: authed,
  });

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: queryKeys.doctors,
    queryFn: () => doctorsApi.list(),
    enabled: authed,
  });

  const createMut = useMutation({
    mutationFn: (body: BookingFormValues) => bookingsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      toast.success('Yangi qabul yaratildi');
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Booking> }) =>
      bookingsApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });

  const deleteMut = useMutation({
    mutationFn: bookingsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      toast.success("Qabul o'chirildi");
    },
  });

  const dialog = useDialogState<Booking>(BookingService.initialState());

  const table = useDataTable<Booking>({
    data: bookings,
    filterFn: (b, search, filters) => {
      const patient = patients.find((p) => p.id === b.patientId);
      const matchSearch =
        !search ||
        `${patient?.firstName} ${patient?.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filters.status === 'all' || b.status === filters.status;
      const matchSource = filters.source === 'all' || b.source === filters.source;
      return matchSearch && matchStatus && matchSource;
    },
    initialFilters: { status: 'all', source: 'all' },
  });

  const handleSave = useCallback(
    (data: BookingFormValues) => {
      if (dialog.editingItem) {
        updateMut.mutate(
          { id: dialog.editingItem.id, body: data },
          {
            onSuccess: () => toast.success('Qabul muvaffaqiyatli yangilandi'),
            onSettled: () => dialog.closeDialog(),
          },
        );
      } else {
        createMut.mutate(data, { onSettled: () => dialog.closeDialog() });
      }
    },
    [dialog, createMut, updateMut],
  );

  const handleStatusChange = useCallback(
    (id: string, status: BookingStatus) => {
      updateMut.mutate(
        { id, body: { status } },
        {
          onSuccess: () =>
            toast.success(`Holat "${BOOKING_STATUS_LABELS[status]}" ga o'zgartirildi`),
        },
      );
    },
    [updateMut],
  );

  return {
    bookings: table.data,
    totalBookings: table.totalCount,
    totalPages: table.totalPages,
    page: table.page,
    setPage: table.setPage,
    search: table.search,
    setSearch: table.setSearch,
    filterStatus: table.filters.status,
    setFilterStatus: (v: string) => table.setFilters('status', v),
    filterSource: table.filters.source,
    setFilterSource: (v: string) => table.setFilters('source', v),
    modalOpen: dialog.isOpen,
    setModalOpen: dialog.setIsOpen,
    editing: dialog.editingItem,
    openCreate: dialog.openCreate,
    openEdit: (b: Booking) => dialog.openEdit(b, BookingService.mapToForm),
    patients,
    doctors,
    deleteId,
    setDeleteId,
    viewBooking,
    setViewBooking,
    handleSave,
    handleStatusChange,
    handleDelete: () => {
      if (deleteId) {
        deleteMut.mutate(deleteId, { onSettled: () => setDeleteId(null) });
      }
    },
    isLoading: bookingsLoading || patientsLoading || doctorsLoading,
  };
};
