import { PageHeader } from '@/shared/components/PageHeader';
import { useAnalytics } from '../hooks/useAnalytics';
import { useStore } from '@/store/useStore';
import { formatUzS } from '@/shared/lib/formatters';
import { 
  GrowthChart, 
  RevenueChart, 
  ConversionChart, 
  SourcePieChart,
  DoctorEfficiencyChart,
  ServiceRevenueHBarChart,
} from '../components/Charts';
import { TrendingUp, Users, Activity, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const { currentUser, activeBranchId } = useStore();
  const {
    colors,
    canViewPayments,
    serviceStats,
    monthlyPatients,
    revenueGrowth,
    conversionData,
    sourceData,
    doctorEfficiency,
  } = useAnalytics();

  const isGlobal = currentUser?.role === 'SUPER_ADMIN' && !activeBranchId;

  if (isGlobal) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <PageHeader 
          title="SaaS Global Tahlillar" 
          description="Platformaning barqarorlik ko'rsatkichlari, obuna va o'sish dinamikasi" 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SaaS MRR Growth */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl text-white">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold">MRR (SaaS Oylik Daromadi) O'sishi</h3>
            </div>
            <div className="h-[250px] w-full flex items-end justify-between gap-2">
              {/* Dummy growth bars for MRR */}
              {[40, 55, 75, 85, 100, 115].map((h, i) => (
                <div key={i} className="flex-1 bg-teal-500/20 hover:bg-teal-500/40 transition-colors rounded-t-lg relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-lg shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                    style={{ height: `${h}%` }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs py-1 px-2 rounded-md">
                    {formatUzS(h * 30000)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-4">
              <span>Noyabr</span><span>Dekabr</span><span>Yanvar</span><span>Fevral</span><span>Mart</span><span>Aprel</span>
            </div>
          </div>

          {/* Platform GMV Dynamics */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">Platforma Aylanmasi (GMV) Dinamikasi</h3>
            </div>
            <RevenueChart data={revenueGrowth} />
            <p className="text-xs text-muted-foreground mt-4 text-center">Barcha filiallar bo'yicha birlashtirilgan tushumlar oqimi</p>
          </div>

          {/* Network Load */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-slate-800 dark:text-white">Tizim Yuklamasi (Umumiy bemorlar oqimi)</h3>
            </div>
            <GrowthChart data={monthlyPatients} />
            <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"/> API so'rovlar stabil</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"/> Server quvvati: 24% band</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tahlillar" 
        description="Klinika samaradorligi va ko'rsatkichlari"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bemorlar o'sishi */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Bemorlar o'sishi</h3>
          </div>
          <GrowthChart data={monthlyPatients} />
        </div>

        {/* Daromad o'sishi */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="text-sm font-semibold">Daromad o'sishi (mln so'm)</h3>
          </div>
          {canViewPayments ? (
            <RevenueChart data={revenueGrowth} />
          ) : (
            <p className="text-sm text-muted-foreground py-12 text-center">
              Daromad ma'lumotlari faqat administrator uchun.
            </p>
          )}
        </div>

        {/* Konversiya */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold">Qabul konversiyasi</h3>
          </div>
          <ConversionChart data={conversionData} />
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(210,80%,52%)' }} />
              Yozilganlar
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(152,60%,40%)' }} />
              Yakunlanganlar
            </div>
          </div>
        </div>

        {/* Manba pie */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Qabul manbalari</h3>
          <SourcePieChart data={sourceData} colors={colors} />
          <div className="flex flex-wrap gap-3 mt-2">
            {sourceData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ background: colors[i % colors.length] }} 
                />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        {/* Shifokorlar samaradorligi — NEW */}
        {canViewPayments && doctorEfficiency.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Shifokorlar samaradorligi</h3>
            </div>
            <DoctorEfficiencyChart data={doctorEfficiency} />
          </div>
        )}

        {/* Xizmatlar daromadi — NEW: horizontal bar chart */}
        {canViewPayments && serviceStats.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-success" />
              <h3 className="text-sm font-semibold">Xizmatlar bo'yicha daromad (TOP-8)</h3>
            </div>
            <ServiceRevenueHBarChart data={serviceStats} />
          </div>
        )}

        {/* Xizmatlar detail cards (fallback if no chart data) */}
        {canViewPayments && serviceStats.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4">Xizmatlar bo'yicha daromad</h3>
            <p className="text-sm text-muted-foreground py-8 text-center">
              Ma'lumotlar mavjud emas.
            </p>
          </div>
        )}

        {!canViewPayments && (
          <div className="bg-card rounded-xl border border-border p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4">Xizmatlar bo'yicha daromad</h3>
            <p className="text-sm text-muted-foreground py-8 text-center">
              Faqat administrator uchun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
