import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { ToothRecord, VisitStatus, PaymentMethod, PaymentStatus, BookingSource } from '@/shared/types';
import { toast } from 'sonner';
import {
  patientsApi,
  visitsApi,
  bookingsApi,
  paymentsApi,
  doctorsApi,
} from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import { canAccessPayments } from '@/shared/config/roles';

export const usePatientProfile = (patientId: string | undefined) => {
  const authed = useStore((s) => s.isAuthenticated);
  const role = useStore((s) => s.currentUser?.role);
  const canManagePayments = canAccessPayments(role);
  const queryClient = useQueryClient();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: patientId ? queryKeys.patient(patientId) : ['patients', 'none'],
    queryFn: () => patientsApi.get(patientId!),
    enabled: !!patientId && authed,
  });

  const { data: patientVisits = [] } = useQuery({
    queryKey: [...queryKeys.visits, 'byPatient', patientId],
    queryFn: () => visitsApi.list({ patientId: patientId! }),
    enabled: !!patientId && authed,
  });

  const { data: patientBookings = [] } = useQuery({
    queryKey: [...queryKeys.bookings, 'byPatient', patientId],
    queryFn: () => bookingsApi.list({ patientId: patientId! }),
    enabled: !!patientId && authed,
  });

  const { data: patientPayments = [] } = useQuery({
    queryKey: [...queryKeys.payments, 'byPatient', patientId],
    queryFn: () => paymentsApi.list({ patientId: patientId! }),
    enabled: !!patientId && authed && canManagePayments,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: queryKeys.doctors,
    queryFn: () => doctorsApi.list(),
    enabled: authed && !!patientId,
  });

  const updatePatientMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof patientsApi.update>[1] }) =>
      patientsApi.update(id, body),
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients });
      queryClient.invalidateQueries({ queryKey: queryKeys.patient(v.id) });
    },
  });

  const createVisitMut = useMutation({
    mutationFn: visitsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.visits });
      toast.success("Yangi tashrif qo'shildi");
    },
  });

  const createPaymentMut = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      toast.success("To'lov qayd etildi");
    },
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phone: '',
    source: 'walk-in' as BookingSource,
    notes: '',
    allergies: '',
    bloodType: '',
  });

  const [toothModal, setToothModal] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothForm, setToothForm] = useState<{ condition: ToothRecord['condition']; notes: string }>({
    condition: 'healthy',
    notes: '',
  });

  const [visitModal, setVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({
    doctorId: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    status: 'not-started' as VisitStatus,
  });

  const [paymentModal, setPaymentModal] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: '',
    method: 'cash' as PaymentMethod,
    status: 'unpaid' as PaymentStatus,
    description: '',
  });

  const totalPaid = patientPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalDebt = patientPayments.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);

  const handleEditSave = () => {
    if (!patient) return;
    if (!editForm.firstName || !editForm.phone) {
      toast.error("Majburiy maydonlarni to'ldiring");
      return;
    }
    updatePatientMut.mutate(
      {
        id: patient.id,
        body: { ...editForm, age: Number(editForm.age) },
      },
      {
        onSuccess: () => {
          toast.success("Bemor ma'lumotlari yangilandi");
          setEditOpen(false);
        },
      },
    );
  };

  const openToothEdit = (num: number) => {
    if (!patient) return;
    const chart = patient.toothChart as Record<string, ToothRecord> | undefined;
    const record = chart?.[String(num)];
    setSelectedTooth(num);
    setToothForm({ condition: record?.condition || 'healthy', notes: record?.notes || '' });
    setToothModal(true);
  };

  const handleToothSave = () => {
    if (!patient || selectedTooth === null) return;
    const toothChart = { ...(patient.toothChart || {}) };
    toothChart[selectedTooth] = {
      toothNumber: selectedTooth,
      condition: toothForm.condition,
      notes: toothForm.notes,
      date: new Date().toISOString().split('T')[0],
    };
    updatePatientMut.mutate(
      { id: patient.id, body: { toothChart } },
      {
        onSuccess: () => {
          toast.success(`${selectedTooth}-tish ma'lumoti yangilandi`);
          setToothModal(false);
        },
      },
    );
  };

  const handleVisitSave = () => {
    if (!patient) return;
    if (!visitForm.doctorId) {
      toast.error('Shifokorni tanlang');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    createVisitMut.mutate(
      {
        patientId: patient.id,
        doctorId: visitForm.doctorId,
        date: today,
        status: visitForm.status,
        diagnosis: visitForm.diagnosis,
        treatment: visitForm.treatment,
        notes: visitForm.notes,
      },
      {
        onSettled: () => {
          setVisitModal(false);
          setVisitForm({
            doctorId: '',
            diagnosis: '',
            treatment: '',
            notes: '',
            status: 'not-started',
          });
        },
      },
    );
  };

  const handlePaymentSave = () => {
    if (!patient) return;
    if (!payForm.amount || !payForm.description) {
      toast.error("Majburiy maydonlarni to'ldiring");
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    createPaymentMut.mutate(
      {
        patientId: patient.id,
        amount: Number(payForm.amount),
        method: payForm.method,
        status: payForm.status,
        date: today,
        description: payForm.description,
      },
      {
        onSettled: () => {
          setPaymentModal(false);
          setPayForm({ amount: '', method: 'cash', status: 'unpaid', description: '' });
        },
      },
    );
  };

  const openEdit = () => {
    if (!patient) return;
    setEditForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: String(patient.age),
      phone: patient.phone,
      source: patient.source,
      notes: patient.notes,
      allergies: patient.allergies || '',
      bloodType: patient.bloodType || '',
    });
    setEditOpen(true);
  };

  return {
    patient,
    patientVisits,
    patientBookings,
    patientPayments,
    canManagePayments,
    totalPaid,
    totalDebt,
    doctors,
    editOpen,
    setEditOpen,
    editForm,
    setEditForm,
    toothModal,
    setToothModal,
    selectedTooth,
    toothForm,
    setToothForm,
    visitModal,
    setVisitModal,
    visitForm,
    setVisitForm,
    paymentModal,
    setPaymentModal,
    payForm,
    setPayForm,
    handleEditSave,
    openEdit,
    openToothEdit,
    handleToothSave,
    handleVisitSave,
    handlePaymentSave,
    isLoading: patientLoading,
  };
};
