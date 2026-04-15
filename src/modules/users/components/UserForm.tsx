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
  email: z.string().email("Noto'g'ri email"),
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
      email: '',
      role: 'receptionist',
      password: '',
    },
    values: editing || undefined,
  });

  const handleSubmit = (values: any) => {
    // If empty password on edit, remove it from payload
    const payload = { ...values, role: 'receptionist' };
    if (!payload.password && editing) delete payload.password;
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Xodimni tahrirlash' : 'Qabulxonaga xodim qo\'shish'}</DialogTitle>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input {...field} type="email" placeholder="example@zahro.dental" /></FormControl>
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
