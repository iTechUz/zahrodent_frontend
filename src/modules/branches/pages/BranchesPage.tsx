import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
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
import { formatDate, formatUzS } from '@/shared/lib/formatters';

export default function BranchesPage() {
  const navigate = useNavigate();
  const { branches, isLoading, createBranch, updateBranch, deleteBranch } = useBranches();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
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
        phone: branch.phone || '',
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
        phone: '',
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
      header: 'Telefon',
      accessor: (b) => (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
          {b.phone || <span className="text-muted-foreground italic text-xs">Kiritilmagan</span>}
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
      header: 'Tarif (Obuna) / MRR',
      accessor: (b) => {
        const isPremium = (b._count?.users || 0) > 3;
        return (
          <div className="flex flex-col gap-1.5">
            <Badge variant="outline" className={`w-fit text-[10px] uppercase font-bold border ${isPremium ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'}`}>
              {isPremium ? 'Premium Plan' : 'Standard Plan'}
            </Badge>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {formatUzS(isPremium ? 500000 : 300000)} / oy
            </span>
          </div>
        );
      }
    },
    {
      header: 'Platforma yuki (GMV)',
      accessor: (b: any) => (
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
             <span className="text-muted-foreground">Mijozlar:</span>
             <span className="font-bold text-slate-700 dark:text-slate-200">{b._count?.patients || 0} ta</span>
          </div>
          <div className="flex items-center justify-between gap-4">
             <span className="text-muted-foreground">Aylanma:</span>
             <span className="font-bold text-emerald-500">{formatUzS(b.totalRevenue || 0)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Holat (Litsenziya)',
      accessor: (b) => (
        <div className="flex items-center gap-3">
          <Switch 
            checked={b.isActive} 
            onCheckedChange={(checked) => updateBranch({ id: b.id, isActive: checked })} 
          />
          <Badge variant={b.isActive ? "default" : "secondary"} className="rounded-lg gap-1">
            {b.isActive ? (
              <><CheckCircle2 className="w-3 h-3" /> Faol</>
            ) : (
              <><XCircle className="w-3 h-3" /> To'xtatilgan</>
            )}
          </Badge>
        </div>
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
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <PageHeader 
          title="Litsenziyalar va Tenentlar" 
          description="SaaS platformasiga ulangan barcha klinikalar, ularning obuna tariflari va daromadlarini boshqarish"
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
              <Label>Telefon raqami</Label>
              <Input 
                placeholder="+998 90 123 45 67" 
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
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
