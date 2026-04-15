import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { Plus, Search, Filter } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { usePatients } from '../hooks/usePatients';
import { PatientForm } from '../components/PatientForm';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Patient } from '@/shared/types';
import { SourceBadge } from '@/shared/components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatCurrency } from '@/shared/lib/formatters';
import { StatCard } from '@/shared/components/StatCard';
import { Users, UserPlus, Target } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

function PatientsPageContent() {
  const navigate = useNavigate();
  const {
    patients,
    totalPatients,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilters,
    modalOpen,
    setModalOpen,
    editing,
    deleteId,
    setDeleteId,
    openCreate,
    openEdit,
    handleSave,
    handleDelete,
    isLoading,
    stats,
  } = usePatients();

  const columns: Column<Patient>[] = [
    { 
      header: 'Ism familiya', 
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground">
            {p.firstName[0]}{p.lastName[0]}
          </div>
          <div>
            <span className="font-medium text-primary hover:underline cursor-pointer" onClick={() => navigate(`/patients/${p.id}`)}>
              {p.firstName} {p.lastName}
            </span>
            {(p.allergies || p.bloodType) && (
              <div className="flex gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                {p.bloodType && <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{p.bloodType}</span>}
                {p.allergies && <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning">⚠ {p.allergies}</span>}
              </div>
            )}
          </div>
        </div>
      )
    },
    { header: 'Yosh', accessor: (p) => `${p.age} yosh` },
    { header: 'Telefon', accessor: 'phone' },
    { 
      header: 'Balans', 
      accessor: (p) => {
        const balance = p.balance || 0;
        const colorClass = balance < 0 ? 'text-destructive' : balance > 0 ? 'text-success' : 'text-muted-foreground';
        return (
          <span className={cn('font-medium', colorClass)}>
            {balance > 0 ? '+' : ''}{formatCurrency(balance)}
          </span>
        );
      }
    },
    { header: 'Manba', accessor: (p) => <SourceBadge source={p.source} /> },
    { 
      header: "Ro'yxatdan o'tgan", 
      accessor: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</span>,
      className: 'hidden md:table-cell'
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Bemorlar" 
        description="Bemorlar ro'yxati va ularning ma'lumotlarini boshqarish" 
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Bemor qo'shish
          </Button>
        } 
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <StatCard 
          title="Jami bemorlar" 
          value={stats?.total ?? 0} 
          icon={<Users className="w-5 h-5" />} 
        />
        <StatCard 
          title="Shu oyda yangi" 
          value={stats?.newThisMonth ?? 0} 
          icon={<UserPlus className="w-5 h-5 text-success" />} 
          trend="Yangi qo'shilganlar"
          trendUp={true}
        />
        <StatCard 
          title="Asosiy manba" 
          value={stats?.topSource ?? '—'} 
          icon={<Target className="w-5 h-5 text-primary" />} 
          trend="Eng ko'p kelish"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Ism, familiya yoki telefon bo'yicha qidirish..." 
            className="pl-9" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select 
            value={filters.source || 'all'} 
            onValueChange={(val) => setFilters('source', val)}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Barcha manbalar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha manbalar</SelectItem>
              <SelectItem value="reception">Reception</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="other">Boshqa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable 
        data={patients} 
        columns={columns} 
        onEdit={openEdit} 
        onDelete={setDeleteId}
        onView={(p) => navigate(`/patients/${p.id}`)}
        isLoading={isLoading}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card rounded-b-xl border-x">
          <p className="text-xs text-muted-foreground">Jami: {totalPatients} ta bemor</p>
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Oldingi
            </Button>
            <div className="flex items-center px-4 text-sm font-medium">
              {page + 1} / {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
            >
              Keyingi
            </Button>
          </div>
        </div>
      )}

      <PatientForm 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        editing={editing}  
        onSave={handleSave} 
      />

      <ConfirmDeleteDialog 
        open={!!deleteId} 
        onOpenChange={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <ErrorBoundary name="Bemorlar">
      <PatientsPageContent />
    </ErrorBoundary>
  );
}

