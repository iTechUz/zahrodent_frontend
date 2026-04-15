import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { Plus, Search, Tag } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useServices, CATEGORIES } from '../hooks/useServices';
import { ServiceCard, ServiceForm } from '../components/ServiceForm';

function ServicesPageContent() {
  const {
    services,
    totalCount,
    totalPages,
    page,
    setPage,
    groupedServices,
    categories,
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
  } = useServices();

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Xizmatlar katalogi" 
        description="Klinika xizmatlarining narxlari va tafsilotlari" 
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Xizmat qo'shish
          </Button>
        } 
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Xizmat qidirish..." 
            className="pl-9" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button 
            variant={filters.category === 'all' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setFilters('category', 'all')}
          >
            Barchasi
          </Button>
          {categories.map(c => (
            <Button 
              key={c} 
              variant={filters.category === c ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setFilters('category', c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-24 rounded-xl bg-card animate-pulse border border-border" />
          ))}
        </div>
      ) : Object.keys(groupedServices).length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedServices).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />{category} ({items.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(s => (
                  <ServiceCard 
                    key={s.id} 
                    service={s} 
                    onEdit={openEdit} 
                    onDelete={setDeleteId} 
                  />
                ))}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card rounded-xl border">
              <p className="text-xs text-muted-foreground">Jami: {totalCount} ta xizmat</p>
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
        </div>
      )}

      <ServiceForm 
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

export default function ServicesPage() {
  return (
    <ErrorBoundary name="Xizmatlar">
      <ServicesPageContent />
    </ErrorBoundary>
  );
}
