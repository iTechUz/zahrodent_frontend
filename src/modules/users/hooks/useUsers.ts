import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { usersApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { useDialogState } from '@/shared/hooks/useDialogState';
import { SessionUser } from '@/shared/types/auth';

export const useUsers = () => {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled: authed,
  });

  const saveMut = useMutation({
    mutationFn: (args: { id?: string; body: any }) =>
      args.id ? usersApi.update(args.id, args.body) : usersApi.create(args.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Xodim ma'lumotlari saqlandi");
    },
  });

  const deleteMut = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Xodim o'chirildi");
    },
  });

  const dialog = useDialogState<SessionUser>({ name: '', email: '', role: 'receptionist' } as SessionUser);

  const handleSave = useCallback(
    (data: any) => {
      const id = dialog.editingItem?.id;
      saveMut.mutate(
        { id, body: data },
        { onSettled: () => dialog.closeDialog() }
      );
    },
    [dialog, saveMut]
  );

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteMut.mutate(deleteId, { onSettled: () => setDeleteId(null) });
    }
  }, [deleteId, deleteMut]);

  return {
    users,
    isLoading,
    modalOpen: dialog.isOpen,
    setModalOpen: dialog.setIsOpen,
    editing: dialog.editingItem,
    openCreate: dialog.openCreate,
    openEdit: (u: SessionUser) => dialog.openEdit(u, (item) => ({ 
      name: item.name, 
      email: item.email, 
      role: item.role,
      specialty: item.specialty,
      password: '' 
    })),
    handleSave,
    setDeleteId,
    deleteId,
    handleDelete,
  };
};
