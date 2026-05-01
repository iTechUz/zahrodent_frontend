import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { branchesApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export const useBranches = () => {
  const queryClient = useQueryClient();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: branchesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success("Yangi filial qo'shildi");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => branchesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success("Filial ma'lumotlari yangilandi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: branchesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success("Filial o'chirildi");
    },
  });

  return {
    branches,
    isLoading,
    createBranch: createMutation.mutate,
    updateBranch: updateMutation.mutate,
    deleteBranch: deleteMutation.mutate,
  };
};

export const useBranchDetails = (id?: string) => {
  return useQuery({
    queryKey: ['branch', id],
    queryFn: () => branchesApi.get(id!),
    enabled: !!id,
  });
};
