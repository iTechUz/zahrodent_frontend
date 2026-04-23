import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { Lead } from '@/shared/types';

export const useLeads = () => {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.list(),
  });

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) => leadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success("Murojaat holati yangilandi");
    },
  });

  const deleteMut = useMutation({
    mutationFn: leadsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success("Murojaat o'chirildi");
    },
  });

  return {
    leads,
    isLoading,
    updateStatus: updateStatusMut.mutate,
    isUpdating: updateStatusMut.isPending,
    deleteLead: deleteMut.mutate,
    isDeleting: deleteMut.isPending,
  };
};
