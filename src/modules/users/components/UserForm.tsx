import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const userSchema = z.object({
  name: z.string().min(2, "Kamida 2 ta belgi bo'lishi kerak"),
  phone: z.string().regex(/^\+998\d{9}$/, "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak"),
  role: z.enum(['admin', 'doctor', 'receptionist']),
  password: z.string().min(6, "Kamida 6 ta belgi").optional().or(z.literal('')),
  specialty: z.string().optional(),
});

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: any;
  onSave: (data: any) => void;
}

export function UserForm({ open, onOpenChange, editing, onSave }: UserFormProps) {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      phone: '',
      role: 'receptionist',
      password: '',
    },
    values: editing || undefined,
  });

  const handleSubmit = (values: any) => {
    // If empty password on edit, remove it from payload
    const payload = { ...values };
    if (!payload.password && editing) delete payload.password;
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Xodimni tahrirlash' : 'Xodim qo\'shish'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ism-sharif</FormLabel>
                  <FormControl><Input {...field} placeholder="Masalan: Aziz Rahimov" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon raqami</FormLabel>
                  <FormControl><Input {...field} placeholder="+998901234567" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Rolni tanlang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="doctor">Shifokor</SelectItem>
                      <SelectItem value="receptionist">Qabulxona (Reception)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{editing ? 'Yangi parol (ixtiyoriy)' : 'Parol'}</FormLabel>
                  <FormControl><Input {...field} type="password" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full">Saqlash</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
