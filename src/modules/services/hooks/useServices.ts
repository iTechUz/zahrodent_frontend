import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { Service } from '@/shared/types';
import { toast } from 'sonner';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { ServiceModuleService } from '../services/service.service';
import { ServiceSchema } from '@/shared/lib/validation';
import { z } from 'zod';
import { servicesApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';

type ServiceFormValues = z.infer<typeof ServiceSchema>;

export const CATEGORIES = ['Davolash', 'Ortodontiya', 'Xirurgiya', 'Gigiyena'];

export const useServices = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: queryKeys.services,
    queryFn: () => servicesApi.list(),
    enabled: authed,
  });

  const createMut = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      toast.success("Yangi xizmat qo'shildi");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Service> }) =>
      servicesApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      toast.success('Xizmat yangilandi');
    },
  });

  const deleteMut = useMutation({
    mutationFn: servicesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      toast.success("Xizmat o'chirildi");
    },
  });

  const dialog = useDialogState<Service>(ServiceModuleService.initialState());

  const filtered = useMemo(() => {
    return services.filter(
      (s) =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()),
    );
  }, [services, search]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(services.map((s) => s.category)));
    return unique.length > 0 ? unique : CATEGORIES;
  }, [services]);

  const [filterCategory, setFilterCategory] = useState<string>('all');

  const finalFiltered = useMemo(() => {
    return filtered.filter((s) => filterCategory === 'all' || s.category === filterCategory);
  }, [filtered, filterCategory]);

  const groupedServices = useMemo(() => {
    return finalFiltered.reduce(
      (acc, service) => {
        if (!acc[service.category]) acc[service.category] = [];
        acc[service.category].push(service);
        return acc;
      },
      {} as Record<string, Service[]>,
    );
  }, [finalFiltered]);

  const handleSave = useCallback(
    (data: ServiceFormValues) => {
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
    services: finalFiltered,
    groupedServices,
    categories,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    modalOpen: dialog.isOpen,
    setModalOpen: dialog.setIsOpen,
    editing: dialog.editingItem,
    deleteId,
    setDeleteId,
    openCreate: dialog.openCreate,
    openEdit: (s: Service) => dialog.openEdit(s, ServiceModuleService.mapToForm),
    handleSave,
    handleDelete,
    isLoading,
  };
};
