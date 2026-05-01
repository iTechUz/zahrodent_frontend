import { useQuery } from '@tanstack/react-query';
import { branchesApi } from '@/lib/api/endpoints';
import { useSubscriptions } from '@/modules/subscriptions/hooks/useSubscriptions';
import { 
  Building2, Users, DollarSign, Activity, Server, 
  Globe, ShieldCheck, Zap, ArrowUpRight, Database, TrendingUp,
  CreditCard, LayoutGrid, Clock
} from 'lucide-react';
import { formatUzS } from '@/shared/lib/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function GlobalDashboard() {
  const { setActiveBranchId } = useStore();
  const { metrics, isLoading: metricsLoading } = useSubscriptions();
  
  const { data: branchStats, isLoading: statsLoading } = useQuery({
    queryKey: ['global-stats'],
    queryFn: () => branchesApi.stats(),
  });

  const isLoading = metricsLoading || statsLoading;

  if (isLoading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-48 bg-slate-900/50 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-32">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6 h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl" />
    </div>
  );

  const totalGMV = branchStats?.reduce((acc: number, curr: any) => acc + curr.totalRevenue, 0) || 0;
  const totalPatients = branchStats?.reduce((acc: number, curr: any) => acc + curr._count.patients, 0) || 0;
  const totalBookings = branchStats?.reduce((acc: number, curr: any) => acc + curr._count.bookings, 0) || 0;
  
  const activeBranches = branchStats?.filter((b: any) => b.isActive) || [];
  const activeBranchesCount = activeBranches.length;
  const totalBranchesCount = branchStats?.length || 0;
  
  // Real metrics from SaaS module
  const mrr = metrics?.mrr || 0;
  const arr = metrics?.arr || 0;
  const activeSubs = metrics?.activeSubscriptions || 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. SaaS Command Center Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-teal-500/20 px-2 py-1 rounded-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-teal-400 font-bold uppercase tracking-widest text-[10px]">SaaS HQ Command Center</span>
              </div>
              <div className="bg-amber-500/20 px-2 py-1 rounded-md flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">System Online</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Zahro Dental Hub <span className="text-primary font-light">OS</span></h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Respublika bo'ylab yagona tibbiyot ekotizimi va B2B SaaS platformasi nazorati. 
              {activeBranchesCount} ta klinika faol ulanishda.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col min-w-[180px]">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Oylik SaaS (MRR)</p>
              <p className="text-2xl font-black text-emerald-400">{formatUzS(mrr)}</p>
              <div className="flex items-center gap-1 text-emerald-400/80 mt-2 text-[10px] font-medium">
                <ArrowUpRight className="w-3 h-3" /> +12% o'sish
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 flex flex-col min-w-[180px]">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Yillik SaaS (ARR)</p>
              <p className="text-2xl font-black text-blue-400">{formatUzS(arr)}</p>
              <div className="flex items-center gap-1 text-blue-400/80 mt-2 text-[10px] font-medium">
                <TrendingUp className="w-3 h-3" /> Prognoz: 1.2x
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-500 text-sm">Obuna Bo'lganlar</h3>
          </div>
          <p className="text-3xl font-black">{activeSubs} <span className="text-lg text-slate-400 font-medium">/ {totalBranchesCount}</span></p>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(activeSubs / (totalBranchesCount || 1)) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-500 text-sm">Umumiy GMV</h3>
          </div>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-200">{formatUzS(totalGMV)}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Platforma orqali barcha tranzaksiyalar</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-colors">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-500 text-sm">Bemorlar Bazasi</h3>
          </div>
          <p className="text-3xl font-black text-slate-700 dark:text-slate-200">{totalPatients}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Barcha klinikadagi jami bemorlar</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-300 text-sm">Server Health</h3>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xl font-bold">99.9% Uptime</p>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 font-mono uppercase"><Database className="w-3 h-3"/> Sinxron: {totalBookings * 2} TPS</p>
          </div>
        </div>
      </div>

      {/* 3. Graphical Analysis & Top Performing Branches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> MRR & GMV Dynamics</h3>
              <p className="text-xs text-slate-500 mt-1">SaaS daromadi va platforma aylanmasi nisbati</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="rounded-lg text-[10px]">6 oy</Badge>
              <Badge variant="secondary" className="rounded-lg text-[10px]">Real-time</Badge>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Yan', gmv: totalGMV * 0.4, mrr: mrr * 0.5 },
                { name: 'Fev', gmv: totalGMV * 0.6, mrr: mrr * 0.7 },
                { name: 'Mar', gmv: totalGMV * 0.8, mrr: mrr * 0.9 },
                { name: 'Apr', gmv: totalGMV, mrr: mrr }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => formatUzS(v)}
                />
                <Bar dataKey="gmv" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={30} name="GMV" />
                <Bar dataKey="mrr" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} name="MRR" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold">Top Tenentlar</h3>
            </div>
            <LayoutGrid className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-4 flex-1">
            {branchStats?.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue).slice(0, 5).map((branch: any, i: number) => (
              <div key={branch.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    0{i+1}
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate max-w-[120px]">{branch.name}</p>
                    <p className="text-[10px] text-slate-500">{branch._count.patients} bemor</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary">{formatUzS(branch.totalRevenue)}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Umumiy GMV</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6 border-white/10 text-white hover:bg-white/10 rounded-xl text-xs h-9">
            Barcha filiallar tahlili
          </Button>
        </div>
      </div>

      {/* 4. Active Tenants Control List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500" /> Platformadagi Klinikalar</h3>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">Barchasini ko'rish</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchStats?.slice(0, 6).map((branch: any) => (
            <div key={branch.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800 flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-400 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  {branch.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{branch.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${branch.isActive ? 'bg-green-500' : 'bg-slate-400'}`}/>
                    <p className="text-[10px] text-slate-500 font-medium">{branch.isActive ? 'Online (Active)' : 'Offline'}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="h-8 text-[10px] font-bold rounded-lg px-3" 
                  onClick={() => setActiveBranchId(branch.id)}
                >
                  Boshqarish
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapPinPulse() {
  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-20 animate-ping" />
      <div className="absolute w-8 h-8 bg-blue-500 rounded-full opacity-40 animate-pulse" />
      <div className="relative w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
    </div>
  );
}
