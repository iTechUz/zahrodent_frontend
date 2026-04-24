import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Doctor, Visit } from '@/shared/types';
import { toast } from 'sonner';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { useServerTable } from '@/shared/hooks/useServerTable';
import { DoctorService } from '../services/doctor.service';
import { DoctorSchema, VisitSchema } from '@/shared/lib/validation';
import { z } from 'zod';
import { doctorsApi, type DoctorCreatePayload, visitsApi, patientsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';

type DoctorFormValues = z.infer<typeof DoctorSchema>;
type VisitFormValues = z.infer<typeof VisitSchema>;

export const useDoctors = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [visitModal, setVisitModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  const table = useServerTable<Doctor, { specialty?: string }>({
    queryKey: queryKeys.doctors,
    fetchFn: (params) => doctorsApi.list(params),
    perPage: 10,
  });

  const { data: stats } = useQuery({
    queryKey: ['doctors', 'stats'],
    queryFn: () => doctorsApi.stats(),
    enabled: authed,
  });

  const { data: efficiencyData } = useQuery({
    queryKey: ['doctors', 'efficiency'],
    queryFn: () => doctorsApi.efficiency(),
    enabled: authed && useStore.getState().currentUser?.role === 'admin',
  });

  const { data: patientsData } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list({ limit: 1000 }),
    enabled: authed,
  });
  const patients = patientsData?.data ?? [];

  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: queryKeys.visits,
    queryFn: () => visitsApi.list({ limit: 100 }),
    enabled: authed,
  });
  const visits = visitsData?.data ?? [];

  const saveDoctorMut = useMutation({
    mutationFn: (args: { id?: string; body: DoctorCreatePayload }) =>
      args.id != null
        ? doctorsApi.update(args.id, args.body)
        : doctorsApi.create(args.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors });
      toast.success("Shifokor saqlandi");
    },
  });

  const deleteDoctorMut = useMutation({
    mutationFn: doctorsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors });
      toast.success("Shifokor o'chirildi");
    },
  });

  const saveVisitMut = useMutation({
    mutationFn: (args: { id?: string; body: Omit<Visit, 'id'> | Partial<Visit> }) =>
      args.id ? visitsApi.update(args.id, args.body as Partial<Visit>) : visitsApi.create(args.body as Omit<Visit, 'id'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
      toast.success('Tashrif saqlandi');
    },
  });

  const dialog = useDialogState<Doctor>(DoctorService.initialState());

  const handleSaveDoctor = useCallback(
    (data: DoctorFormValues) => {
      const { daysOffText, schedule, ...rest } = data;
      const daysOff = daysOffText
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const body: any = {
        ...rest,
        schedule: schedule as any,
        ...(daysOff != null && daysOff.length > 0 ? { daysOff } : {}),
      };
      const id = dialog.editingItem?.id;
      saveDoctorMut.mutate(
        (id ? { id, body } : { body }) as any,
        { onSettled: () => dialog.closeDialog() },
      );
    },
    [dialog, saveDoctorMut],
  );

  const handleDeleteDoctor = useCallback(() => {
    if (deleteId) {
      deleteDoctorMut.mutate(deleteId, { onSettled: () => setDeleteId(null) });
    }
  }, [deleteId, deleteDoctorMut]);

  const openVisitForm = useCallback((doctor: Doctor, visit?: Visit) => {
    setSelectedDoctor(doctor);
    setEditingVisit(visit || null);
    setVisitModal(true);
  }, []);

  const handleSaveVisit = useCallback(
    (data: VisitFormValues) => {
      if (!selectedDoctor) {
        toast.error('Iltimos, shifokorni tanlang');
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      if (editingVisit) {
        saveVisitMut.mutate(
          { id: editingVisit.id, body: data as any },
          { onSettled: () => setVisitModal(false) },
        );
      } else {
        saveVisitMut.mutate(
          {
            body: {
              patientId: data.patientId,
              doctorId: selectedDoctor.id,
              date: today,
              status: data.status,
              diagnosis: data.diagnosis ?? '',
              treatment: data.treatment ?? '',
              notes: data.notes ?? '',
            },
          },
          { onSettled: () => setVisitModal(false) },
        );
      }
    },
    [selectedDoctor, editingVisit, saveVisitMut],
  );

  return {
    doctors: table.data,
    totalDoctors: table.totalCount,
    totalPages: table.totalPages,
    page: table.page,
    setPage: table.setPage,
    search: table.search,
    setSearch: table.setSearch,
    filters: table.filters,
    setFilters: table.setFilters,
    patients,
    visits,
    modalOpen: dialog.isOpen,
    setModalOpen: dialog.setIsOpen,
    editing: dialog.editingItem,
    deleteId,
    setDeleteId,
    selectedDoctor,
    visitModal,
    setVisitModal,
    editingVisit,
    openCreate: dialog.openCreate,
    openEdit: (d: Doctor) => dialog.openEdit(d, DoctorService.mapToForm),
    handleSaveDoctor,
    handleDeleteDoctor,
    openVisitForm,
    handleSaveVisit,
    isLoading: table.isLoading || visitsLoading,
    stats,
    efficiency: efficiencyData ?? [],
  };
};

