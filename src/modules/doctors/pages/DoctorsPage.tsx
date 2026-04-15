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
import { useDoctors } from '../hooks/useDoctors';
import { DoctorCard } from '../components/DoctorCard';
import { DoctorForm, DoctorVisitForm } from '../components/DoctorForm';
import { StatCard } from '@/shared/components/StatCard';
import { Users, HeartPulse, ClipboardCheck, BarChart3, List } from 'lucide-react';
import { DoctorEfficiencyStats } from '../components/DoctorEfficiencyStats';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { cn } from '@/shared/lib/utils';

function DoctorsPageContent() {
  const {
    doctors,
    totalDoctors,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilters,
    patients,
    visits,
    modalOpen,
    setModalOpen,
    editing,
    deleteId,
    setDeleteId,
    selectedDoctor,
    visitModal,
    setVisitModal,
    editingVisit,
    openCreate,
    openEdit,
    handleSaveDoctor,
    handleDeleteDoctor,
    openVisitForm,
    handleSaveVisit,
    isLoading,
    stats,
  } = useDoctors();

  const [activeTab, setActiveTab] = useState<'list' | 'efficiency'>('list');
  const role = useStore(s => s.currentUser?.role);
  const isAdmin = role === 'admin';

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Shifokorlar" 
        description="Shifokorlar va tashriflarni boshqarish" 
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Shifokor qo'shish
          </Button>
        } 
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <StatCard 
          title="Jami shifokorlar" 
          value={stats?.total ?? 0} 
          icon={<Users className="w-5 h-5 text-primary" />} 
          trend="Bizning jamoa"
        />
        <StatCard 
          title="Bugun faol" 
          value={stats?.activeToday ?? 0} 
          icon={<HeartPulse className="w-5 h-5 text-success" />} 
          trend="Xizmat ko'rsatmoqda"
          trendUp={true}
        />
        <StatCard 
          title="Jami tashriflar" 
          value={stats?.totalVisits ?? 0} 
          icon={<ClipboardCheck className="w-5 h-5 text-info" />} 
          trend="Tizimdagi jami"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex p-1 bg-muted rounded-lg w-full md:w-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all flex-1 md:flex-none",
              activeTab === 'list' 
                ? "bg-card text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-4 h-4" /> Ro'yxat
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('efficiency')}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all flex-1 md:flex-none",
                activeTab === 'efficiency' 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="w-4 h-4" /> Samaradorlik
            </button>
          )}
        </div>

        {activeTab === 'list' && (
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1 justify-end">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Shifokor ismi yoki telefon bo'yicha..." 
                className="pl-9" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>

            <Select 
              value={filters.specialty || 'all'} 
              onValueChange={(val) => setFilters('specialty', val)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Mutaxassislik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barchasi</SelectItem>
                <SelectItem value="Stomatolog-terapevt">Terapevt</SelectItem>
                <SelectItem value="Stomatolog-ortoped">Ortoped</SelectItem>
                <SelectItem value="Stomatolog-ximurg">Xirurg</SelectItem>
                <SelectItem value="Ortodont">Ortodont</SelectItem>
                <SelectItem value="Bolalar stomatologi">Bolalar stomatologi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {activeTab === 'efficiency' ? (
        <DoctorEfficiencyStats />
      ) : (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-xl bg-card animate-pulse border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((d) => (
                <DoctorCard 
                  key={d.id} 
                  doctor={d} 
                  visits={visits} 
                  patients={patients}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                  onAddVisit={openVisitForm}
                  onEditVisit={openVisitForm}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card rounded-xl border">
              <p className="text-xs text-muted-foreground">Jami: {totalDoctors} ta shifokor</p>
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
        </>
      )}

      <DoctorForm 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        editing={editing} 
        onSave={handleSaveDoctor} 
      />

      <DoctorVisitForm 
        open={visitModal} 
        onOpenChange={setVisitModal} 
        editingVisit={editingVisit} 
        doctor={selectedDoctor} 
        patients={patients} 
        onSave={handleSaveVisit} 
      />

      <ConfirmDeleteDialog 
        open={!!deleteId} 
        onOpenChange={() => setDeleteId(null)} 
        onConfirm={handleDeleteDoctor} 
      />
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <ErrorBoundary name="Shifokorlar">
      <DoctorsPageContent />
    </ErrorBoundary>
  );
}
