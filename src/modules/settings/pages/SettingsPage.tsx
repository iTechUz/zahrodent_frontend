import { useStore } from '@/store/useStore';
import { PageHeader } from '@/shared/components/PageHeader';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Moon, Bell, Shield, MapPin, Phone, Mail, Clock, ShieldCheck, Database, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useStore();

  return (
    <div className="space-y-6 w-full">
      <PageHeader title="Sozlamalar" description="Klinika va tizim sozlamalarini boshqarish" />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="general" className="rounded-lg gap-2 px-4">
            <Building2 className="w-4 h-4" /> Umumiy
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg gap-2 px-4">
            <Moon className="w-4 h-4" /> Ko'rinish
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg gap-2 px-4">
            <Bell className="w-4 h-4" /> Xabarnomalar
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg gap-2 px-4">
            <Shield className="w-4 h-4" /> Xavfsizlik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Klinika ma'lumotlari</CardTitle>
                <CardDescription>Klinikaning asosiy ma'lumotlarini o'zgartirish</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Klinika nomi</Label>
                  <Input defaultValue="Zahro Dental Klinika" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> Telefon</Label>
                    <Input defaultValue="+998 71 123 4567" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> Email</Label>
                    <Input defaultValue="info@zahro.dental" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /> Manzil</Label>
                  <Input defaultValue="Toshkent shahri, Yakkasaroy tumani, 12-uy" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Ish vaqti</Label>
                  <Input defaultValue="Dushanba - Shanba, 09:00 — 18:00" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t border-border mt-4 justify-end pt-5 rounded-b-2xl">
                <Button className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" /> Saqlash
                </Button>
              </CardFooter>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl h-fit">
              <CardHeader>
                <CardTitle className="text-xl">Ma'lumotlar bazasi</CardTitle>
                <CardDescription>Bemorlar va tizim ma'lumotlarini zaxiralash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Database className="w-4 h-4 text-primary" />
                      Avtomatik zaxiralash (Backup)
                    </div>
                    <p className="text-xs text-muted-foreground">Har kuni tungi 00:00 da arxiv yaratiladi</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline" className="w-full mt-2">Zaxira nusxasini hozir yaratish</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="animate-fade-in">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl max-w-3xl">
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
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl max-w-3xl">
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
                <Switch defaultChecked />
              </div>
              
              <div className="p-4 rounded-xl border border-border">
                <h4 className="text-sm font-medium mb-3">Eskiz.uz ma'lumotlari</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input placeholder="Eskiz email" defaultValue="info@zahro.dental" />
                  </div>
                  <div className="space-y-2">
                    <Label>Token / API kalit</Label>
                    <Input type="password" defaultValue="••••••••••••••••" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4">Saqlash</Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    Telegram Bot integratsiyasi
                  </div>
                  <p className="text-xs text-muted-foreground">Tashriflar haqida shifokorlarga Telegram xabar yuborish</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-fade-in">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm shadow-xl max-w-3xl">
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
                    <Input type="password" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Yangi parol</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parolni tasdiqlash</Label>
                      <Input type="password" />
                    </div>
                  </div>
                  <Button className="mt-2">Parolni yangilash</Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    Ikki bosqichli autentifikatsiya (2FA)
                  </div>
                  <p className="text-xs opacity-80">Hisobingizni qo'shimcha himoya qiling</p>
                </div>
                <Button variant="destructive" size="sm">Yoqish</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
