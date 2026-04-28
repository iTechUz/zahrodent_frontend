import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Booking, BookingStatus } from '@/shared/types';
import { BOOKING_STATUS_LABELS } from '@/shared/constants';
import { toast } from 'sonner';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { useServerTable } from '@/shared/hooks/useServerTable';
import { BookingService } from '../services/booking.service';
import { BookingSchema } from '@/shared/lib/validation';
import { z } from 'zod';
import { bookingsApi, patientsApi, doctorsApi, servicesApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';

import { getMonthToDateRange } from '@/shared/lib/date-utils';

type BookingFormValues = z.infer<typeof BookingSchema>;

export const useBookings = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);

  const mtd = getMonthToDateRange();

  const table = useServerTable<
    Booking,
    { status?: string; source?: string; dateRange?: string; startDate?: string; endDate?: string }
  >({
    queryKey: queryKeys.bookings,
    fetchFn: (params) => bookingsApi.list(params),
    initialFilters: { 
      status: 'all', 
      source: 'all', 
      dateRange: 'month',
      startDate: mtd.startDate,
      endDate: mtd.endDate
    },
    perPage: 10,
  });

  const { data: stats } = useQuery({
    queryKey: ['bookings', 'stats'],
    queryFn: () => bookingsApi.stats(),
    enabled: authed,
  });

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list({ limit: 1000 }), // Fetching for lookups, ideally use searchable dropdown
    enabled: authed,
  });
  const patients = patientsData?.data ?? [];

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: queryKeys.doctors,
    queryFn: () => doctorsApi.list({ limit: 100 }),
    enabled: authed,
  });
  const doctors = doctorsData?.data ?? [];

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: queryKeys.services,
    queryFn: () => servicesApi.list({ limit: 100 }),
    enabled: authed,
  });
  const services = servicesData?.data ?? [];

  const createMut = useMutation({
    mutationFn: (body: BookingFormValues) => bookingsApi.create(body as any),
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

  const handleSave = useCallback(
    (data: BookingFormValues) => {
      if (dialog.editingItem) {
        updateMut.mutate(
          { id: dialog.editingItem.id, body: data as any },
          {
            onSuccess: () => toast.success('Qabul muvaffaqiyatli yangilandi'),
            onSettled: () => dialog.closeDialog(),
          },
        );
      } else {
        createMut.mutate(data as any, { onSettled: () => dialog.closeDialog() });
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
    filters: table.filters,
    setFilters: table.setFilters,
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
    services,
    isLoading: table.isLoading || patientsLoading || doctorsLoading || servicesLoading,
    stats,
  };
};

