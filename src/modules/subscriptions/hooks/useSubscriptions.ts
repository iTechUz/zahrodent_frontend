import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi, SubscriptionPlan, BranchSubscription } from '@/lib/api/endpoints';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

export const useSubscriptions = () => {
  const qc = useQueryClient();
  const role = useStore(s => s.currentUser?.role);

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionsApi.getPlans,
  });

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['branch-subscriptions'],
    queryFn: subscriptionsApi.getAll,
    enabled: role === 'SUPER_ADMIN',
  });

  const { data: mySubscription, isLoading: mySubLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionsApi.getMy,
    enabled: !!role,
  });

  const getHistory = (branchId: string) => {
    return subscriptionsApi.getHistory(branchId);
  };

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['saas-metrics'],
    queryFn: subscriptionsApi.getMetrics,
    enabled: role === 'SUPER_ADMIN',
  });

  const createPlan = useMutation({
    mutationFn: subscriptionsApi.createPlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans'] });
      qc.invalidateQueries({ queryKey: ['saas-metrics'] });
      toast.success("Yangi tarif yaratildi!");
    },
    onError: () => toast.error("Tarif yaratishda xatolik"),
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, ...body }: Partial<SubscriptionPlan> & { id: string }) =>
      subscriptionsApi.updatePlan(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success("Tarif yangilandi");
    },
    onError: () => toast.error("Tarifni yangilashda xatolik"),
  });

  const deletePlan = useMutation({
    mutationFn: subscriptionsApi.deletePlan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans'] });
      qc.invalidateQueries({ queryKey: ['saas-metrics'] });
      toast.success("Tarif o'chirildi");
    },
    onError: () => toast.error("Tarifni o'chirishda xatolik"),
  });

  const assignPlan = useMutation({
    mutationFn: subscriptionsApi.assign,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['branch-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['saas-metrics'] });
      qc.invalidateQueries({ queryKey: ['global-stats'] });
      toast.success(`"${data.branch.name}" klinikasiga tarif biriktirildi!`);
    },
    onError: () => toast.error("Tarif biriktirishda xatolik"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ branchId, status }: { branchId: string; status: BranchSubscription['status'] }) =>
      subscriptionsApi.updateStatus(branchId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branch-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['saas-metrics'] });
      toast.success("Obuna holati yangilandi");
    },
    onError: () => toast.error("Holatni yangilashda xatolik"),
  });

  return {
    plans,
    subscriptions,
    mySubscription,
    metrics,
    getHistory,
    isLoading: plansLoading || subsLoading || metricsLoading || mySubLoading,
    createPlan: createPlan.mutate,
    updatePlan: updatePlan.mutate,
    deletePlan: deletePlan.mutate,
    assignPlan: assignPlan.mutate,
    updateStatus: updateStatus.mutate,
  };
};
