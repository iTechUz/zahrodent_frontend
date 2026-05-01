import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { Lead } from '@/shared/types';
import { useServerTable } from '@/shared/hooks/useServerTable';
import { useNavigate } from 'react-router-dom';

export const useLeads = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const table = useServerTable<Lead, { startDate?: string; endDate?: string; status?: string }>({
    queryKey: ['leads'],
    fetchFn: (params) => leadsApi.list(params),
    perPage: 20,
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) => leadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success("Murojaat holati yangilandi");
    },
  });

  const convertMut = useMutation({
    mutationFn: leadsApi.convertToPatient,
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success("Murojaat muvaffaqiyatli bemorga aylantirildi");
      navigate(`/patients/${patient.id}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Aylantirishda xatolik yuz berdi");
    }
  });

  const deleteMut = useMutation({
    mutationFn: leadsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success("Murojaat o'chirildi");
    },
  });

  return {
    leads: table.data,
    totalCount: table.totalCount,
    totalPages: table.totalPages,
    page: table.page,
    setPage: table.setPage,
    search: table.search,
    setSearch: table.setSearch,
    filters: table.filters,
    setFilters: table.setFilters,
    isLoading: table.isLoading,
    updateStatus: updateStatusMut.mutate,
    isUpdating: updateStatusMut.isPending,
    convertToPatient: convertMut.mutate,
    isConverting: convertMut.isPending,
    createLead: useMutation({
      mutationFn: leadsApi.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        toast.success("Yangi murojaat qo'shildi");
      },
    }).mutate,
    updateLead: useMutation({
      mutationFn: ({ id, ...data }: Partial<Lead> & { id: string }) => leadsApi.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        toast.success("Murojaat yangilandi");
      },
    }).mutate,
    deleteLead: deleteMut.mutate,
    isDeleting: deleteMut.isPending,
  };
};
