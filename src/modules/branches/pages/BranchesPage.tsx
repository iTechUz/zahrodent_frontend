import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranches } from '../hooks/useBranches';
import { PageHeader } from '@/shared/components/PageHeader';
import { Branch } from '@/lib/api/endpoints';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/shared/components/DataTable';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  Plus, 
  Settings2, 
  Trash2, 
  Calendar,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/shared/lib/formatters';

export default function BranchesPage() {
  const navigate = useNavigate();
  const { branches, isLoading, createBranch, updateBranch, deleteBranch } = useBranches();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    isActive: true,
    adminName: '',
    adminPhone: '',
    adminPassword: ''
  });

  const handleOpenForm = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormValues({
        name: branch.name,
        address: branch.address || '',
        latitude: branch.latitude?.toString() || '',
        longitude: branch.longitude?.toString() || '',
        isActive: branch.isActive,
        adminName: '',
        adminPhone: '',
        adminPassword: ''
      });
    } else {
      setEditingBranch(null);
      setFormValues({ 
        name: '', 
        address: '', 
        latitude: '',
        longitude: '',
        isActive: true,
        adminName: '',
        adminPhone: '',
        adminPassword: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingBranch) {
      updateBranch({ id: editingBranch.id, ...formValues });
    } else {
      createBranch(formValues);
    }
    setIsFormOpen(false);
  };

  const columns: Column<Branch>[] = [
    {
      header: 'Filial nomi',
      accessor: (b) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">{b.name}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(b.createdAt)}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Manzil (GPS)',
      accessor: (b) => (
        <div className="flex flex-col text-xs opacity-80">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            {b.address || 'Kiritilmagan'}
          </div>
          {(b.latitude && b.longitude) && (
            <div className="flex items-center gap-1 mt-1 text-[10px] text-primary/70">
              <span className="font-mono">{b.latitude}, {b.longitude}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Admin',
      accessor: (b) => (
        <div className="flex items-center gap-2 text-xs opacity-80">
          <Users className="w-3 h-3 text-muted-foreground" />
          {b._count?.users || 0} ta xodim
        </div>
      )
    },
    {
      header: 'Statistika',
      accessor: (b) => (
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Bemorlar</p>
            <p className="text-xs font-bold">{b._count?.patients || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Xodimlar</p>
            <p className="text-xs font-bold">{b._count?.users || 0}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Holat',
      accessor: (b) => (
        <Badge variant={b.isActive ? "default" : "secondary"} className="rounded-lg gap-1">
          {b.isActive ? (
            <><CheckCircle2 className="w-3 h-3" /> Faol</>
          ) : (
            <><XCircle className="w-3 h-3" /> Noaktiv</>
          )}
        </Badge>
      )
    },
    {
      header: 'Amallar',
      accessor: (b) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => navigate(`/branches/${b.id}`)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenForm(b)}>
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteBranch(b.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Filiallar boshqaruvi" 
          description="SaaS platformasidagi barcha klinikalarni nazorat qilish"
        />
        <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20" onClick={() => handleOpenForm()}>
          <Plus className="w-4 h-4" />
          Yangi filial
        </Button>
      </div>

      <div className="bg-card/40 backdrop-blur-sm border rounded-2xl overflow-hidden">
        <DataTable 
          data={branches} 
          columns={columns} 
          isLoading={isLoading}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {editingBranch ? 'Filialni tahrirlash' : 'Yangi filial qo\'shish'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Klinika nomi</Label>
              <Input 
                placeholder="Masalan: Zahro Dental Center" 
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Manzil <span className="text-muted-foreground font-normal">(Ixtiyoriy)</span></Label>
              <Input 
                placeholder="Shahar, ko'cha, uy..." 
                value={formValues.address}
                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Kenglik (Latitude) <span className="text-muted-foreground font-normal text-[10px]">(Ixtiyoriy)</span></Label>
                <Input 
                  placeholder="Masalan: 41.2995" 
                  value={formValues.latitude}
                  onChange={(e) => setFormValues({ ...formValues, latitude: e.target.value })}
                  className="rounded-xl font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Uzunlik (Longitude) <span className="text-muted-foreground font-normal text-[10px]">(Ixtiyoriy)</span></Label>
                <Input 
                  placeholder="Masalan: 69.2401" 
                  value={formValues.longitude}
                  onChange={(e) => setFormValues({ ...formValues, longitude: e.target.value })}
                  className="rounded-xl font-mono text-sm"
                />
              </div>
            </div>

            {!editingBranch && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Users className="w-4 h-4" />
                  Klinika Admini (Yangi)
                </div>
                <div className="space-y-2">
                  <Label>Admin ismi</Label>
                  <Input 
                    placeholder="Ism sharif" 
                    value={formValues.adminName}
                    onChange={(e) => setFormValues({ ...formValues, adminName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Admin telefoni</Label>
                    <Input 
                      placeholder="+998" 
                      value={formValues.adminPhone}
                      onChange={(e) => setFormValues({ ...formValues, adminPhone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parol</Label>
                    <Input 
                      type="password"
                      placeholder="******" 
                      value={formValues.adminPassword}
                      onChange={(e) => setFormValues({ ...formValues, adminPassword: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formValues.isActive}
                onChange={(e) => setFormValues({ ...formValues, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive">Faol holatda</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setIsFormOpen(false)}>Bekor qilish</Button>
            <Button className="rounded-xl px-8" onClick={handleSave}>Saqlash</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
