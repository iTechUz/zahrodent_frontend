import { useState } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useBranches } from '@/modules/branches/hooks/useBranches';
import { SubscriptionPlan, BranchSubscription } from '@/lib/api/endpoints';
import { formatUzS, formatDate } from '@/shared/lib/formatters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  Crown, Plus, Zap, Building2, CheckCircle2,
  XCircle, Clock, Trash2, Edit3, TrendingUp,
  DollarSign, Users, Star, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  ACTIVE:   { label: 'Faol',         color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
  INACTIVE: { label: 'Nofaol',       color: 'bg-slate-500/10 text-slate-500 border-slate-500/20',       icon: XCircle },
  PAST_DUE: { label: 'Muddati o\'tgan', color: 'bg-warning/10 text-warning border-warning/20',          icon: AlertTriangle },
  CANCELED: { label: 'Bekor qilingan', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
} as const;

// ─── Plan Form ─────────────────────────────────────────────────────────────────

function PlanFormDialog({
  open,
  plan,
  onClose,
  onSave,
}: {
  open: boolean;
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState(plan?.name ?? '');
  const [price, setPrice] = useState(plan?.price?.toString() ?? '');
  const [features, setFeatures] = useState<string[]>(plan?.features ?? ['']);
  const [isPopular, setIsPopular] = useState(plan?.isPopular ?? false);

  const handleSave = () => {
    if (!name.trim() || !price) return toast.error("Tarif nomi va narxi majburiy");
    onSave({
      ...(plan && { id: plan.id }),
      name: name.trim(),
      price: parseFloat(price),
      features: features.filter(Boolean),
      isPopular,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Crown className="w-5 h-5 text-primary" />
            {plan ? 'Tarifni tahrirlash' : 'Yangi tarif yaratish'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Tarif nomi</Label>
            <Input placeholder="Masalan: Premium, Standard" value={name} onChange={e => setName(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Oylik narxi (UZS)</Label>
            <Input placeholder="300000" type="number" value={price} onChange={e => setPrice(e.target.value)} className="rounded-xl font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Xususiyatlar (Features)</Label>
            {features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Xususiyat ${i + 1}`}
                  value={f}
                  onChange={e => {
                    const updated = [...features];
                    updated[i] = e.target.value;
                    setFeatures(updated);
                  }}
                  className="rounded-xl"
                />
                {features.length > 1 && (
                  <Button variant="ghost" size="icon" className="text-destructive shrink-0"
                    onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full rounded-xl"
              onClick={() => setFeatures([...features, ''])}>
              <Plus className="w-3 h-3 mr-1" /> Xususiyat qo'shish
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
            <div>
              <p className="font-medium text-sm flex items-center gap-1"><Star className="w-4 h-4 text-amber-500" /> Mashhur tarif</p>
              <p className="text-xs text-muted-foreground">Frontendda "Tavsiya etiladi" belgi qo'yiladi</p>
            </div>
            <Switch checked={isPopular} onCheckedChange={setIsPopular} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-xl" onClick={onClose}>Bekor</Button>
          <Button className="rounded-xl px-8" onClick={handleSave}>Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Plan Dialog ────────────────────────────────────────────────────────

function AssignPlanDialog({
  open,
  plans,
  branches,
  existingSub,
  onClose,
  onAssign,
}: {
  open: boolean;
  plans: SubscriptionPlan[];
  branches: any[];
  existingSub?: BranchSubscription | null;
  onClose: () => void;
  onAssign: (data: { branchId: string; planId: string; endDate?: string }) => void;
}) {
  const [branchId, setBranchId] = useState(existingSub?.branchId ?? '');
  const [planId, setPlanId] = useState(existingSub?.planId ?? '');
  const [endDate, setEndDate] = useState('');

  const handleAssign = () => {
    if (!branchId || !planId) return toast.error("Filial va tarif tanlanishi shart");
    onAssign({ branchId, planId, ...(endDate && { endDate }) });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Zap className="w-5 h-5 text-amber-500" />
            Klinikaga tarif biriktirish
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Klinika (Tenent)</Label>
            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Klinika tanlang" /></SelectTrigger>
              <SelectContent>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {b.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tarif rejasi</Label>
            <div className="grid grid-cols-1 gap-2">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlanId(p.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${planId === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.features.slice(0, 2).join(' • ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatUzS(p.price)}</p>
                      <p className="text-[10px] text-muted-foreground">/ oy</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tugash sanasi <span className="text-muted-foreground font-normal">(Ixtiyoriy)</span></Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-xl" />
            <p className="text-xs text-muted-foreground">Bo'sh qoldirilsa abadiy faol bo'ladi</p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-xl" onClick={onClose}>Bekor</Button>
          <Button className="rounded-xl px-8 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleAssign}>
            <Zap className="w-4 h-4 mr-2" /> Biriktirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { plans, subscriptions, metrics, isLoading, createPlan, updatePlan, deletePlan, assignPlan, updateStatus } = useSubscriptions();
  const { branches } = useBranches();

  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<BranchSubscription | null>(null);

  const handlePlanSave = (data: any) => {
    if (data.id) updatePlan(data);
    else createPlan(data);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setPlanFormOpen(true);
  };

  const openAssign = (sub?: BranchSubscription) => {
    setAssignTarget(sub ?? null);
    setAssignOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">Tariflar va Obunalar</span>
            </div>
            <h1 className="text-3xl font-black mb-1">SaaS Subscription Management</h1>
            <p className="text-slate-400 text-sm">Klinikalar uchun tariflar va ularning obuna holatini boshqarish</p>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl gap-2 shadow-lg"
              onClick={() => openAssign()}>
              <Zap className="w-4 h-4" /> Tarif biriktirish
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-xl gap-2"
              onClick={() => { setEditingPlan(null); setPlanFormOpen(true); }}>
              <Plus className="w-4 h-4" /> Yangi tarif
            </Button>
          </div>
        </div>
      </div>

      {/* SaaS Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Faol Obunalar', value: metrics?.activeSubscriptions ?? '—', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Real MRR', value: metrics ? formatUzS(metrics.mrr) : '—', icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'ARR (Yillik)', value: metrics ? formatUzS(metrics.arr) : '—', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Muddati o\'tgan', value: metrics?.pastDueSubscriptions ?? '—', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
        ].map(m => (
          <div key={m.label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center ${m.color} mb-3`}>
              <m.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black">{isLoading ? '…' : m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="subscriptions">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="subscriptions" className="rounded-lg gap-2"><Building2 className="w-4 h-4" /> Klinikalar Obunalari</TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg gap-2"><Crown className="w-4 h-4" /> Tarif Rejalari</TabsTrigger>
        </TabsList>

        {/* ─── Subscriptions Tab ─── */}
        <TabsContent value="subscriptions" className="mt-6">
          {/* Unsubscribed branches warning */}
          {(() => {
            const subscribedIds = new Set(subscriptions.map(s => s.branchId));
            const unsubscribed = branches.filter(b => !subscribedIds.has(b.id));
            if (!unsubscribed.length) return null;
            return (
              <div className="mb-4 p-4 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-warning text-sm">{unsubscribed.length} ta klinikada hali tarif yo'q</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {unsubscribed.map(b => b.name).join(', ')}
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-border">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Klinika</th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Tarif rejasi</th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Oylik to'lov</th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Holat</th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Boshlanish</th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Tugash</th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-muted-foreground">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        {Array(7).fill(0).map((_, j) => (
                          <td key={j} className="px-5 py-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : subscriptions.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">Hali hech qaysi klinikaga tarif biriktirilmagan</td></tr>
                  ) : subscriptions.map(sub => {
                    const cfg = STATUS_CONFIG[sub.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-bold text-sm">
                              {sub.branch.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{sub.branch.name}</p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${sub.branch.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                                {sub.branch.isActive ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {sub.plan.isPopular && <Star className="w-3.5 h-3.5 text-amber-500" />}
                            <span className="font-semibold">{sub.plan.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-primary">{formatUzS(sub.plan.price)}</td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" /> {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground text-xs">{formatDate(sub.startDate)}</td>
                        <td className="px-5 py-4 text-muted-foreground text-xs">
                          {sub.endDate ? formatDate(sub.endDate) : <span className="text-emerald-500 font-medium">Abadiy</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 text-xs"
                              onClick={() => openAssign(sub)}>
                              <Edit3 className="w-3.5 h-3.5 mr-1" /> Tarif almashtirish
                            </Button>
                            <Select
                              value={sub.status}
                              onValueChange={(v) => updateStatus({ branchId: sub.branchId, status: v as any })}>
                              <SelectTrigger className="h-8 w-[130px] text-xs rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">✅ Faol</SelectItem>
                                <SelectItem value="INACTIVE">⏸️ To'xtatish</SelectItem>
                                <SelectItem value="PAST_DUE">⚠️ Muddati o'tgan</SelectItem>
                                <SelectItem value="CANCELED">❌ Bekor qilish</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ─── Plans Tab ─── */}
        <TabsContent value="plans" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-3xl animate-pulse" />
              ))
            ) : plans.length === 0 ? (
              <div className="md:col-span-3 text-center py-20 text-muted-foreground">
                <Crown className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Hali hech qanday tarif yaratilmagan</p>
                <Button className="mt-4 rounded-xl" onClick={() => { setEditingPlan(null); setPlanFormOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Birinchi tarifni yarating
                </Button>
              </div>
            ) : plans.map(plan => (
              <div key={plan.id} className={`relative rounded-3xl border p-6 shadow-lg transition-all hover:shadow-xl ${plan.isPopular ? 'border-primary/40 bg-gradient-to-br from-primary/5 to-blue-500/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 rounded-full shadow-lg">
                      <Star className="w-3 h-3 mr-1" /> Mashhur
                    </Badge>
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-black">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {plan._count?.subscriptions ?? 0} ta faol klinika
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"
                      onClick={() => openEdit(plan)}>
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                      onClick={() => deletePlan(plan.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-black text-primary">{formatUzS(plan.price)}</span>
                  <span className="text-muted-foreground text-sm"> / oy</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {(plan.features as string[]).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border">
                  <Users className="w-3.5 h-3.5" />
                  MRR ulushi: {formatUzS((plan._count?.subscriptions ?? 0) * Number(plan.price))}
                </div>
              </div>
            ))}

            {/* Add Plan Card */}
            <button
              className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary min-h-[200px]"
              onClick={() => { setEditingPlan(null); setPlanFormOpen(true); }}>
              <Plus className="w-8 h-8" />
              <span className="font-semibold">Yangi tarif qo'shish</span>
            </button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PlanFormDialog
        open={planFormOpen}
        plan={editingPlan}
        onClose={() => { setPlanFormOpen(false); setEditingPlan(null); }}
        onSave={handlePlanSave}
      />
      <AssignPlanDialog
        open={assignOpen}
        plans={plans}
        branches={branches}
        existingSub={assignTarget}
        onClose={() => { setAssignOpen(false); setAssignTarget(null); }}
        onAssign={assignPlan}
      />
    </div>
  );
}
