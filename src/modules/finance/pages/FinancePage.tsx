import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { Plus, Search, DollarSign, TrendingUp, AlertTriangle, Filter, CalendarDays, CreditCard } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatCard } from '@/shared/components/StatCard';
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
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants';
import { useFinance } from '../hooks/useFinance';
import { TransactionForm } from '../components/TransactionForm';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Payment } from '@/shared/types';
import { formatUzS, formatDate } from '@/shared/lib/formatters';
import { PaymentStatusBadge } from '@/shared/components/StatusBadge';

export function FinancePageContent() {
  const {
    payments,
    totalCount,
    totalPages,
    page,
    setPage,
    patients,
    totalRevenue,
    thisMonth,
    totalDebt,
    unpaidCount,
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
  } = useFinance();

  const columns: Column<Payment>[] = [
    { 
      header: 'Bemor', 
      accessor: (p) => {
        const pt = patients.find(pt => pt.id === p.patientId);
        return `${pt?.firstName} ${pt?.lastName}`;
      }
    },
    { header: 'Tavsif', accessor: 'description' },
    { 
      header: 'Summa', 
      accessor: (p) => <span className="font-medium">{formatUzS(p.amount)}</span> 
    },
    { 
      header: 'Usul', 
      accessor: (p) => PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] 
    },
    { 
      header: 'Holat', 
      accessor: (p) => <PaymentStatusBadge status={p.status} /> 
    },
    { 
      header: 'Sana', 
      accessor: (p) => <span className="text-xs text-muted-foreground">{formatDate(p.date)}</span> 
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Moliya" 
        description="Daromad va to'lovlarni boshqarish" 
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            To'lov qayd etish
          </Button>
        } 
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          title="Umumiy daromad" 
          value={formatUzS(totalRevenue)} 
          icon={<DollarSign className="w-5 h-5" />} 
          trend="Barcha vaqt uchun" 
          trendUp 
        />
        <StatCard 
          title="Shu oy" 
          value={formatUzS(thisMonth)} 
          icon={<TrendingUp className="w-5 h-5" />} 
          trend="Joriy oy" 
          trendUp 
        />
        <StatCard 
          title="Qarzdorlik" 
          value={formatUzS(totalDebt)} 
          icon={<AlertTriangle className="w-5 h-5" />} 
          trend={`${unpaidCount} ta to'lanmagan`} 
          trendUp={false} 
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Qidirish..." 
            className="pl-9" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Select 
          value={filters.dateRange || 'all'} 
          onValueChange={(val) => setFilters('dateRange', val)}
        >
          <SelectTrigger className="w-[160px]">
            <CalendarDays className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Vaqt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="today">Bugun</SelectItem>
            <SelectItem value="week">Shu hafta</SelectItem>
            <SelectItem value="month">Shu oy</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(val) => setFilters('status', val)}
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Holat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha holatlar</SelectItem>
            {PAYMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select 
          value={filters.method || 'all'} 
          onValueChange={(val) => setFilters('method', val)}
        >
          <SelectTrigger className="w-[160px]">
            <CreditCard className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Usul" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha usullar</SelectItem>
            <SelectItem value="cash">Naqd</SelectItem>
            <SelectItem value="card">Terminal</SelectItem>
            <SelectItem value="transfer">O'tkazma</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable 
        data={payments} 
        columns={columns} 
        onEdit={openEdit} 
        onDelete={setDeleteId}
        isLoading={isLoading}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card rounded-b-xl border-x">
          <p className="text-xs text-muted-foreground">Jami: {totalCount} ta to'lov</p>
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

      <TransactionForm 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        editing={editing} 
        patients={patients} 
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

const FinancePage = () => (
  <ErrorBoundary name="Moliya">
    <FinancePageContent />
  </ErrorBoundary>
);

export default FinancePage;

