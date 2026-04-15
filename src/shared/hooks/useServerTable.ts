import { useState, useCallback, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

interface UseServerTableOptions<T, F> {
  queryKey: any[];
  fetchFn: (params: { page: number; limit: number; search: string } & F) => Promise<{ data: T[]; total: number }>;
  initialFilters?: F;
  perPage?: number;
}

export const useServerTable = <T extends object, F extends object>({
  queryKey,
  fetchFn,
  initialFilters = {} as F,
  perPage = 10,
}: UseServerTableOptions<T, F>) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<F>(initialFilters);

  const queryParams = useMemo(
    () => ({
      page,
      limit: perPage,
      search,
      ...filters,
    }),
    [page, perPage, search, filters],
  );

  const { data, isLoading, isPlaceholderData, error } = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => fetchFn(queryParams),
    placeholderData: keepPreviousData,
  });

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(0);
  }, []);

  const handleFilterChange = useCallback((key: keyof F, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }, []);

  const totalPages = Math.ceil((data?.total ?? 0) / perPage);

  return {
    data: data?.data ?? [],
    totalCount: data?.total ?? 0,
    search,
    setSearch: handleSearch,
    filters,
    setFilters: handleFilterChange,
    page,
    setPage,
    totalPages,
    perPage,
    isLoading,
    isPlaceholderData,
    error,
  };
};
