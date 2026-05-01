import { useStore } from '@/store/useStore';
import { PageHeader } from '@/shared/components/PageHeader';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, Moon, Bell, Shield, MapPin, Phone, Mail, Briefcase,
  Clock, ShieldCheck, Database, Save, MessageCircle, Crown, Zap, Loader2, User
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { useState, useEffect } from 'react';
import { useBranchDetails, useBranches } from '@/modules/branches/hooks/useBranches';
import { useSubscriptions } from '@/modules/subscriptions/hooks/useSubscriptions';
import { formatUzS, formatDate } from '@/shared/lib/formatters';
import { authApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorsApi } from '@/lib/api/endpoints';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, currentUser, activeBranchId } = useStore();
  const { updateBranch } = useBranches();

  const queryClient = useQueryClient();

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const isDoctor = currentUser?.role === 'DOCTOR';
  
  const effectiveBranchId = currentUser?.role === 'SUPER_ADMIN' ? activeBranchId : currentUser?.branchId;
  const { data: branch, isLoading: branchLoading } = useBranchDetails(effectiveBranchId || undefined);

  // Doctor fetches own profile from /doctors/me
  const { data: currentDoctor } = useQuery({
    queryKey: ['doctors', 'me'],
    queryFn: () => doctorsApi.me(),
    enabled: isDoctor,
  });

  const isGlobal = currentUser?.role === 'SUPER_ADMIN' && !effectiveBranchId;

  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    telegramBotToken: '',
    eskizEmail: '',
    eskizToken: '',
    eskizEnabled: false,
  });

  useEffect(() => {
    if (branch) {
      setFormValues({
        name: branch.name || '',
        phone: branch.phone || '',
        address: branch.address || '',
        latitude: branch.latitude?.toString() || '',
        longitude: branch.longitude?.toString() || '',
        telegramBotToken: branch.telegramBotToken || '',
        eskizEmail: branch.eskizEmail || '',
        eskizToken: branch.eskizToken || '',
        eskizEnabled: branch.eskizEnabled || false,
      });
    }
  }, [branch]);

  const DAY_LABELS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

  const [profileValues, setProfileValues] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    specialty: '',
    experienceYears: '',
    bio: '',
    schedule: DAY_LABELS.map((_, i) => ({ day: i, startTime: '09:00', endTime: '18:00', isWorking: i < 5 })),
  });

  useEffect(() => {
    if (currentDoctor) {
      const nameParts = (currentUser?.name || '').split(' ');
      setProfileValues({
        firstName: currentDoctor.firstName || nameParts[0] || '',
        lastName: currentDoctor.lastName || nameParts.slice(1).join(' ') || '',
        phone: currentUser?.phone || '',
        specialty: currentDoctor.specialty || '',
        experienceYears: currentDoctor.experienceYears?.toString() || '',
        bio: currentDoctor.bio || '',
        schedule: DAY_LABELS.map((_, i) => {
          const existing = currentDoctor.schedule?.find((s: any) => s.day === i);
          return {
            day: i,
            startTime: existing?.startTime || '09:00',
            endTime: existing?.endTime || '18:00',
            isWorking: !!existing?.isWorking,
          };
        }),
      });
    }
  }, [currentDoctor, currentUser]);

  const [securityValues, setSecurityValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    if (effectiveBranchId) {
      updateBranch({ id: effectiveBranchId, ...formValues });
    }
  };

  const handleSaveProfile = async () => {
    if (!currentDoctor) return;
    try {
      // Call API directly to bypass the dialog-based mutation flow
      await doctorsApi.update(currentDoctor.id, {
        firstName: profileValues.firstName,
        lastName: profileValues.lastName,
        phone: profileValues.phone.replace(/\D/g, ''),
        specialty: profileValues.specialty,
        experienceYears: Number(profileValues.experienceYears) || 0,
        bio: profileValues.bio,
        availabilities: profileValues.schedule
          .filter(s => s.isWorking)
          .map(s => ({
            dayOfWeek: s.day,
            startTime: s.startTime,
            endTime: s.endTime,
            slotDuration: 30,
          })),
      });
      // Refresh the cached doctor profile
      await queryClient.invalidateQueries({ queryKey: ['doctors', 'me'] });
      toast.success("Profil muvaffaqiyatli yangilandi");
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  };

  const handlePasswordChange = async () => {
    if (securityValues.newPassword !== securityValues.confirmPassword) {
      toast.error("Yangi parollar mos kelmadi");
      return;
    }
    try {
      await authApi.changePassword({
        currentPassword: securityValues.currentPassword,
        newPassword: securityValues.newPassword,
      });
      toast.success("Parol muvaffaqiyatli o'zgartirildi");
      setSecurityValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message || "Xatolik yuz berdi");
    }
  };

  if (isGlobal) {
    return (
      <div className="space-y-6 w-full animate-fade-in text-center py-20">
        <PageHeader title="SaaS Platforma Sozlamalari" description="Zahro Dental Hub global tizimini markaziy boshqarish" />
        <Card className="max-w-md mx-auto p-8 rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2 text-slate-400">Global sozlamalar hali mavjud emas</h3>
          <p className="text-sm text-slate-500">Super Admin uchun markaziy platforma sozlamalari keyingi yangilanishlarda qo'shiladi.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader title="Sozlamalar" description="Klinika va tizim sozlamalarini boshqarish" />

      <Tabs defaultValue={isAdmin ? "general" : "profile"} className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          {isAdmin && (
            <TabsTrigger value="general" className="rounded-lg gap-2 px-4">
              <Building2 className="w-4 h-4" /> Umumiy
            </TabsTrigger>
          )}
          {isDoctor && (
            <TabsTrigger value="profile" className="rounded-lg gap-2 px-4">
              <User className="w-4 h-4" /> Mening profilim
            </TabsTrigger>
          )}
          <TabsTrigger value="appearance" className="rounded-lg gap-2 px-4">
            <Moon className="w-4 h-4" /> Ko'rinish
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="notifications" className="rounded-lg gap-2 px-4">
              <Bell className="w-4 h-4" /> Xabarnomalar
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="rounded-lg gap-2 px-4">
            <Shield className="w-4 h-4" /> Xavfsizlik
          </TabsTrigger>
          {isAdmin && !isGlobal && (
            <TabsTrigger value="billing" className="rounded-lg gap-2 px-4">
              <Crown className="w-4 h-4" /> Tarif va To'lovlar
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6">
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Klinika ma'lumotlari</CardTitle>
                <CardDescription>Klinikaning asosiy ma'lumotlarini o'zgartirish</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Klinika nomi</Label>
                  <Input 
                    value={formValues.name} 
                    onChange={(e) => setFormValues({...formValues, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> Telefon</Label>
                  <Input 
                    value={formValues.phone} 
                    onChange={(e) => setFormValues({...formValues, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> Manzil (Ixtiyoriy)</Label>
                  <Input 
                    value={formValues.address} 
                    onChange={(e) => setFormValues({...formValues, address: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4 mt-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Kenglik (Latitude) - GPS</Label>
                    <Input 
                      value={formValues.latitude} 
                      onChange={(e) => setFormValues({...formValues, latitude: e.target.value})} 
                      className="font-mono" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Uzunlik (Longitude) - GPS</Label>
                    <Input 
                      value={formValues.longitude} 
                      onChange={(e) => setFormValues({...formValues, longitude: e.target.value})} 
                      className="font-mono" 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t border-border mt-4 justify-end pt-5 rounded-b-2xl">
                <Button className="gradient-primary" onClick={handleSave} disabled={branchLoading}>
                  <Save className="w-4 h-4 mr-2" /> Saqlash
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6">
            {/* Personal Info */}
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Shaxsiy ma'lumotlar</CardTitle>
                <CardDescription>Ismingiz va telefon raqamingizni yangilang</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ism</Label>
                    <Input 
                      placeholder="Ali"
                      value={profileValues.firstName} 
                      onChange={(e) => setProfileValues({...profileValues, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Familiya</Label>
                    <Input 
                      placeholder="Valiyev"
                      value={profileValues.lastName} 
                      onChange={(e) => setProfileValues({...profileValues, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> Telefon raqam</Label>
                  <Input 
                    placeholder="+998901234567"
                    value={profileValues.phone} 
                    onChange={(e) => setProfileValues({...profileValues, phone: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Info */}
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Professional ma'lumotlar</CardTitle>
                <CardDescription>Mutaxassislik va tajriba ma'lumotlaringiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mutaxassislik</Label>
                  <Input 
                    placeholder="Stomatolog-terapevt"
                    value={profileValues.specialty} 
                    onChange={(e) => setProfileValues({...profileValues, specialty: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tajriba (yil)</Label>
                  <Input 
                    type="number"
                    min={0}
                    placeholder="5"
                    value={profileValues.experienceYears} 
                    onChange={(e) => setProfileValues({...profileValues, experienceYears: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Men haqimda (Bio)</Label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="O'zingiz haqingizda qisqacha..."
                    value={profileValues.bio}
                    onChange={(e) => setProfileValues({...profileValues, bio: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2"><Clock className="w-5 h-5 text-primary" /> Haftalik ish jadvali</CardTitle>
                <CardDescription>Qaysi kunlari va qanday vaqtlarda ishlashingizni belgilang</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileValues.schedule.map((s, idx) => (
                  <div key={idx} className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border transition-all",
                    s.isWorking ? "border-primary/20 bg-primary/5" : "border-border bg-muted/20 opacity-60"
                  )}>
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <Switch 
                        checked={s.isWorking}
                        onCheckedChange={(v) => {
                          const updated = [...profileValues.schedule];
                          updated[idx] = { ...updated[idx], isWorking: v };
                          setProfileValues({...profileValues, schedule: updated});
                        }}
                      />
                      <span className={cn("text-sm font-semibold", s.isWorking ? "text-foreground" : "text-muted-foreground")}>
                        {DAY_LABELS[idx]}
                      </span>
                    </div>
                    {s.isWorking && (
                      <div className="flex items-center gap-2 flex-1">
                        <input 
                          type="time"
                          value={s.startTime}
                          onChange={(e) => {
                            const updated = [...profileValues.schedule];
                            updated[idx] = { ...updated[idx], startTime: e.target.value };
                            setProfileValues({...profileValues, schedule: updated});
                          }}
                          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-muted-foreground text-sm">—</span>
                        <input 
                          type="time"
                          value={s.endTime}
                          onChange={(e) => {
                            const updated = [...profileValues.schedule];
                            updated[idx] = { ...updated[idx], endTime: e.target.value };
                            setProfileValues({...profileValues, schedule: updated});
                          }}
                          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}
                    {!s.isWorking && (
                      <span className="text-xs text-muted-foreground italic">Dam olish kuni</span>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="bg-muted/20 border-t border-border mt-4 justify-end pt-5 rounded-b-2xl">
                <Button className="gradient-primary" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4 mr-2" /> Barcha o'zgarishlarni saqlash
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="animate-fade-in">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl w-full">
            <CardHeader>
              <CardTitle className="text-xl">Interfeys ko'rinishi</CardTitle>
              <CardDescription>Tizimning ranglari va mavzularini o'zgartirish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Moon className="w-4 h-4 text-primary" />
                    Qorong'u rejim (Dark Mode)
                  </div>
                  <p className="text-xs text-muted-foreground">Tungi paytda ko'zni toliqtirmaslik uchun xira mavzu</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="animate-fade-in">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl w-full">
            <CardHeader>
              <CardTitle className="text-xl">Xabarnomalar integratsiyasi</CardTitle>
              <CardDescription>Bemorlarga va shifokorlarga SMS botlarini sozlash</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Bell className="w-4 h-4 text-info" />
                    Eskiz.uz SMS integratsiyasi
                  </div>
                  <p className="text-xs text-muted-foreground">Bemorlarga avtomatik SMS eslatma yuborish</p>
                </div>
                <Switch 
                  checked={formValues.eskizEnabled} 
                  onCheckedChange={(checked) => {
                    setFormValues({...formValues, eskizEnabled: checked});
                    if (effectiveBranchId) updateBranch({ id: effectiveBranchId, eskizEnabled: checked });
                  }} 
                />
              </div>
              
              <div className="p-4 rounded-xl border border-border">
                <h4 className="text-sm font-medium mb-3">Eskiz.uz ma'lumotlari</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      placeholder="Eskiz email" 
                      value={formValues.eskizEmail}
                      onChange={(e) => setFormValues({...formValues, eskizEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Token / API kalit</Label>
                    <Input 
                      type="password" 
                      value={formValues.eskizToken}
                      onChange={(e) => setFormValues({...formValues, eskizToken: e.target.value})}
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleSave} disabled={branchLoading}>Saqlash</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    Telegram Bot integratsiyasi
                  </div>
                  <p className="text-xs text-muted-foreground">O'z botingizni ulash uchun BotFather orqali olingan tokenni kiriting</p>
                </div>
                <Switch checked={!!formValues.telegramBotToken} />
              </div>
              
              <div className="p-4 rounded-xl border border-border">
                <h4 className="text-sm font-medium mb-3">Klinika Boti (Token)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-muted-foreground"/> Bot Tokeni</Label>
                    <Input 
                      type="password" 
                      placeholder="1234567890:AAH_XXX_YYY_ZZZ" 
                      value={formValues.telegramBotToken}
                      onChange={(e) => setFormValues({...formValues, telegramBotToken: e.target.value})}
                      className="font-mono"
                    />
                  </div>
                </div>
                <Button onClick={handleSave} variant="outline" size="sm" className="mt-4" disabled={branchLoading}>Ularni saqlash</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-fade-in">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl w-full">
            <CardHeader>
              <CardTitle className="text-xl">Xavfsizlik</CardTitle>
              <CardDescription>Tizim xavfsizligi va parollarni boshqarish</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Parolni o'zgartirish</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Joriy parol</Label>
                    <Input 
                      type="password" 
                      value={securityValues.currentPassword}
                      onChange={(e) => setSecurityValues({...securityValues, currentPassword: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Yangi parol</Label>
                      <Input 
                        type="password" 
                        value={securityValues.newPassword}
                        onChange={(e) => setSecurityValues({...securityValues, newPassword: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parolni tasdiqlash</Label>
                      <Input 
                        type="password" 
                        value={securityValues.confirmPassword}
                        onChange={(e) => setSecurityValues({...securityValues, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button 
                    className="mt-2" 
                    onClick={handlePasswordChange}
                    disabled={!securityValues.currentPassword || !securityValues.newPassword || securityValues.newPassword !== securityValues.confirmPassword}
                  >
                    Parolni yangilash
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="animate-fade-in">
           <BillingTab />
        </TabsContent>

      </Tabs>
    </div>
  );
}

function BillingTab() {
  const { plans, mySubscription, isLoading } = useSubscriptions();

  if (isLoading) return (
    <div className="p-20 text-center animate-pulse flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
      <p className="text-muted-foreground font-medium">Hisob-kitob ma'lumotlari yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Current Subscription Status */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> 
            Joriy obuna holati
          </h3>
          
          <Card className="rounded-3xl border-none shadow-2xl shadow-primary/5 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            
            <CardHeader className="pb-2 relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 backdrop-blur-md">
                  Active
                </Badge>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight mb-1">
                {mySubscription?.plan.name || 'Tarif yo\'q'}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Premium imkoniyatlar to'plami
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-4 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Oylik to'lov</p>
                  <p className="text-lg font-bold">{mySubscription ? formatUzS(Number(mySubscription.plan.price)) : '0'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Amal qilish muddati</p>
                  <p className="text-sm font-medium">
                    {mySubscription?.endDate ? formatDate(mySubscription.endDate) : 'Abadiy'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                   Asosiy imkoniyatlar:
                </p>
                <div className="flex flex-wrap gap-2">
                  {mySubscription?.plan.features.slice(0, 4).map((f, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/10 hover:bg-white/20 border-transparent text-white text-[10px]">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="relative pt-2">
               <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold shadow-xl shadow-white/5">
                  To'lovlar tarixini ko'rish
               </Button>
            </CardFooter>
          </Card>

          <div className="p-5 rounded-3xl border border-dashed border-border bg-muted/20 flex items-start gap-4">
             <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <Zap className="w-5 h-5" />
             </div>
             <div>
                <h4 className="text-sm font-bold mb-1">Tarifni yangilash haqida</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                   Tarifingizni istalgan vaqtda yangilashingiz mumkin. Yangilashda qolgan muddat avtomatik ravishda yangi tarifga o'tkaziladi.
                </p>
             </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> 
            Mavjud tarif rejalar
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(plan => {
              const isCurrent = mySubscription?.planId === plan.id;
              return (
                <div 
                  key={plan.id} 
                  className={cn(
                    "relative p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col h-full",
                    isCurrent 
                      ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                      : "border-border bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5"
                  )}
                >
                  {plan.isPopular && !isCurrent && (
                    <Badge className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none shadow-lg shadow-amber-500/20">
                      Ommabop
                    </Badge>
                  )}
                  
                  <div className="mb-6">
                    <h4 className="text-xl font-black mb-1">{plan.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {(plan.features as string[])[0]}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-primary">{formatUzS(Number(plan.price))}</span>
                      <span className="text-xs text-muted-foreground">/ oy</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {(plan.features as string[]).slice(0, 4).map((f, i) => (
                      <li key={i} className="text-xs flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3 h-3 text-primary" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={cn(
                      "w-full rounded-2xl h-12 font-bold transition-all",
                      isCurrent 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white cursor-default" 
                        : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90"
                    )}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Joriy tarif" : "Tarifga o'tish"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
