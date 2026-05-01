import { useParams, useNavigate } from 'react-router-dom';
import { useBranchDetails } from '../hooks/useBranches';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Users, CalendarDays, Contact, MapPin, 
  ArrowLeft, CheckCircle2, XCircle, Activity, Banknote 
} from 'lucide-react';
import { DataTable, Column } from '@/shared/components/DataTable';
import { formatDate, formatMoney } from '@/shared/lib/formatters';

export default function BranchDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: branch, isLoading } = useBranchDetails(id);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Yuklanmoqda...</div>;
  if (!branch) return <div className="p-8 text-center text-destructive">Filial topilmadi</div>;

  const usersColumns: Column<any>[] = [
    { header: 'Xodim', accessor: (u) => <span className="font-medium">{u.name}</span> },
    { header: 'Telefon', accessor: 'phone' },
    { header: 'Lavozim', accessor: (u) => <Badge variant="outline">{u.role}</Badge> },
    { header: 'Holat', accessor: (u) => u.isActive ? <Badge className="bg-success">Faol</Badge> : <Badge variant="destructive">Noaktiv</Badge> },
    { header: 'Qo\'shilgan', accessor: (u) => formatDate(u.createdAt) },
  ];

  const patientsColumns: Column<any>[] = [
    { header: 'Bemor', accessor: (p) => <span className="font-medium">{p.firstName} {p.lastName}</span> },
    { header: 'Telefon', accessor: 'phone' },
    { header: 'Balans', accessor: (p) => <span className="font-mono text-primary">{formatMoney(p.balance)}</span> },
    { header: 'Keltirilgan', accessor: (p) => formatDate(p.createdAt) },
  ];

  const bookingsColumns: Column<any>[] = [
    { header: 'Bemor', accessor: (b) => <span className="font-medium">{b.patient?.firstName} {b.patient?.lastName}</span> },
    { header: 'Shifokor', accessor: (b) => b.doctor?.user?.name || 'Biriktirilmagan' },
    { header: 'Vaqti', accessor: (b) => formatDate(b.startTime) },
    { header: 'Holat', accessor: (b) => <Badge variant="secondary">{b.status}</Badge> },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-xl h-10 w-10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <PageHeader 
            title={branch.name} 
            description="Klinikaning to'liq ma'lumotnomasi va statistikasi"
          />
        </div>
        <Badge variant={branch.isActive ? "default" : "secondary"} className="rounded-xl px-4 py-1.5 text-sm gap-2">
          {branch.isActive ? <><CheckCircle2 className="w-4 h-4" /> Faol Klinika</> : <><XCircle className="w-4 h-4" /> Noaktiv Klinika</>}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-none shadow-lg bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Manzil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{branch.address || 'Kiritilmagan'}</p>
            {(branch.latitude && branch.longitude) && (
              <p className="text-[10px] font-mono mt-1 text-primary/70">{branch.latitude}, {branch.longitude}</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-lg bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Umumiy xodimlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{branch._count?.users || 0}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Contact className="w-4 h-4" /> Bemorlar bazasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{branch._count?.patients || 0}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-lg bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Jami Qabullar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{branch._count?.bookings || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full mt-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full justify-start h-auto flex-wrap">
          <TabsTrigger value="overview" className="rounded-lg gap-2 px-6 py-2">
            <Activity className="w-4 h-4" /> Umumiy ko'rinish
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg gap-2 px-6 py-2">
            <Users className="w-4 h-4" /> Xodimlar ro'yxati
          </TabsTrigger>
          <TabsTrigger value="patients" className="rounded-lg gap-2 px-6 py-2">
            <Contact className="w-4 h-4" /> So'nggi bemorlar
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-lg gap-2 px-6 py-2">
            <CalendarDays className="w-4 h-4" /> So'nggi qabullar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <div className="flex items-center gap-4 text-primary mb-4">
                <div className="p-3 bg-primary/10 rounded-xl"><Building2 className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold text-lg">Klinika pasporti</h3>
                  <p className="text-sm opacity-80">Platforma tomonidan tasdiqlangan yozuv</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">ID Rqami</span>
                  <span className="font-mono">{branch.id}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Yaratilgan sana</span>
                  <span>{formatDate(branch.createdAt)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Oxirgi yangilanish</span>
                  <span>{formatDate(branch.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <Banknote className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl">Moliya (Tez kunda)</h3>
                <p className="text-sm text-muted-foreground">Ushbu filialning sof daromadi va xarajatlari batafsil analitikasi ushbu blokda shakllanadi.</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="animate-fade-in mt-6">
          <div className="bg-card rounded-2xl overflow-hidden border shadow-sm">
            <DataTable data={branch.users || []} columns={usersColumns} />
          </div>
        </TabsContent>

        <TabsContent value="patients" className="animate-fade-in mt-6">
          <div className="bg-card rounded-2xl overflow-hidden border shadow-sm">
            <div className="p-4 bg-muted/30 border-b font-medium text-sm text-muted-foreground">Oxirgi qo'shilgan 10 ta bemor</div>
            <DataTable data={branch.patients || []} columns={patientsColumns} />
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="animate-fade-in mt-6">
          <div className="bg-card rounded-2xl overflow-hidden border shadow-sm">
            <div className="p-4 bg-muted/30 border-b font-medium text-sm text-muted-foreground">So'nggi qabullar</div>
            <DataTable data={branch.bookings || []} columns={bookingsColumns} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
