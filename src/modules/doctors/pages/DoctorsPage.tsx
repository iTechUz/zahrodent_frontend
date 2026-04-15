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
  } = useDoctors();

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

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Shifokor ismi yoki telefon bo'yicha..." 
            className="pl-9" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
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
      </div>

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
