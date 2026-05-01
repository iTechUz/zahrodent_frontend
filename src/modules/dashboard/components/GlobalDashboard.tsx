import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '@/lib/api/endpoints';
import { StatCard } from '@/shared/components/StatCard';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowRight,
  Target,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatUzS } from '@/shared/lib/formatters';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

const COLORS = ['#0d9488', '#0891b2', '#4f46e5', '#7c3aed', '#db2777'];

export function GlobalDashboard() {
  const { setActiveBranchId } = useStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: () => branchesApi.stats(),
  });

  if (isLoading) return <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-4 gap-4 h-32 bg-muted rounded-2xl" />
    <div className="h-64 bg-muted rounded-2xl" />
  </div>;

  const totalRevenue = stats?.reduce((acc: number, curr: any) => acc + curr.totalRevenue, 0) || 0;
  const totalPatients = stats?.reduce((acc: number, curr: any) => acc + curr._count.patients, 0) || 0;
  const totalBookings = stats?.reduce((acc: number, curr: any) => acc + curr._count.bookings, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* SaaS Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Umumiy Daromad" 
          value={formatUzS(totalRevenue)} 
          icon={<DollarSign className="w-5 h-5" />} 
          className="bg-primary/5 border-primary/20"
        />
        <StatCard 
          title="Jami Bemorlar" 
          value={totalPatients} 
          icon={<Users className="w-5 h-5" />} 
        />
        <StatCard 
          title="Jami Qabullar" 
          value={totalBookings} 
          icon={<Activity className="w-5 h-5" />} 
        />
        <StatCard 
          title="Klinikalar Soni" 
          value={stats?.length || 0} 
          icon={<Building2 className="w-5 h-5" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branch Revenue Comparison */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Filiallar bo'yicha daromad tahlili</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(v: number) => [formatUzS(v), 'Daromad']}
              />
              <Bar dataKey="totalRevenue" radius={[6, 6, 0, 0]} barSize={40}>
                {stats?.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Branch */}
        <div className="bg-card rounded-2xl border border-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Eng faol filial</h3>
            </div>
            {stats && stats.length > 0 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-muted-foreground">Filial nomi</p>
                  <p className="text-xl font-bold text-primary">{stats[0].name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-border">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Bemorlar</p>
                    <p className="text-lg font-bold">{stats[0]._count.patients}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold">Qabullar</p>
                    <p className="text-lg font-bold">{stats[0]._count.bookings}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-6 rounded-xl gap-2" onClick={() => stats && setActiveBranchId(stats[0].id)}>
            Ushbu filialga o'tish <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Branch List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats?.map((branch: any) => (
          <div key={branch.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{branch.name}</h4>
                  <p className="text-[10px] text-muted-foreground">Faol holatda</p>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full h-8 w-8" onClick={() => setActiveBranchId(branch.id)}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Bugungi tushum</span>
                <span className="font-semibold text-primary">{formatUzS(branch.totalRevenue)}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${Math.min((branch.totalRevenue / (totalRevenue || 1)) * 100, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
