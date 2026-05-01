import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '@/lib/api/endpoints';
import { useStore } from '@/store/useStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Globe } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function BranchSwitcher() {
  const { currentUser, activeBranchId, setActiveBranchId } = useStore();
  
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.list(),
    enabled: currentUser?.role === 'SUPER_ADMIN',
  });

  if (currentUser?.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="flex items-center gap-2">
      <Select
        value={activeBranchId || 'all'}
        onValueChange={(val) => setActiveBranchId(val === 'all' ? null : val)}
      >
        <SelectTrigger className={cn(
          "h-9 w-[180px] md:w-[220px] rounded-xl border-none bg-muted/50 hover:bg-muted/80 transition-all font-medium",
          !activeBranchId ? "text-primary ring-1 ring-primary/20" : ""
        )}>
          <div className="flex items-center gap-2 truncate">
            {activeBranchId ? (
              <Building2 className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <Globe className="w-4 h-4 text-primary shrink-0" />
            )}
            <SelectValue placeholder="Filialni tanlang" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border-none shadow-xl">
          <SelectItem value="all" className="rounded-lg">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span>Barcha filiallar</span>
            </div>
          </SelectItem>
          {branches?.map((branch) => (
            <SelectItem key={branch.id} value={branch.id} className="rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{branch.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
