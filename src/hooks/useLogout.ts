import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';

export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useStore((s) => s.logout);

  return () => {
    queryClient.clear();
    logout();
  };
}
