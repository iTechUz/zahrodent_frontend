import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  BOOKING_SOURCES,
  BOOKING_SOURCE_LABELS,
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
} from '@/shared/constants';
import { Booking, Patient, Doctor, BookingStatus, Service } from '@/shared/types';
import { StatusBadge, SourceBadge } from '@/shared/components/StatusBadge';
import { BookingSchema, BookingFormValues } from '@/shared/lib/validation';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { cn } from '@/shared/lib/utils';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Booking | null;
  patients: Patient[];
  doctors: Doctor[];
  services: Service[];
  onSave: (data: any) => void;
}

export const BookingForm = ({ 
  open, 
  onOpenChange, 
  editing, 
  patients, 
  doctors, 
  services,
  onSave 
}: BookingFormProps) => {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      branchId: '',
      patientId: '',
      doctorId: '',
      serviceId: '',
      date: '',
      time: '',
      duration: 30,
      source: 'DIRECT',
      status: 'PENDING',
      notes: '',
    },
  });

  useEffect(() => {
    if (editing) {
      const startDate = new Date(editing.startTime);
      const endDate = new Date(editing.endTime);
      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);

      form.reset({
        branchId: editing.branchId,
        patientId: editing.patientId,
        doctorId: editing.doctorId,
        serviceId: editing.serviceId || '',
        date: startDate.toISOString().split('T')[0],
        time: startDate.toTimeString().split(' ')[0].substring(0, 5),
        duration: duration,
        source: editing.source,
        status: editing.status,
        notes: editing.notes || '',
      });
    } else {
      form.reset({
        branchId: '',
        patientId: '',
        doctorId: '',
        serviceId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 30,
        source: 'DIRECT',
        status: 'PENDING',
        notes: '',
      });
    }
  }, [editing, form, open]);

  const handleSubmit = (values: BookingFormValues) => {
    const start = new Date(`${values.date}T${values.time}:00`);
    const end = new Date(start.getTime() + (values.duration || 30) * 60 * 1000);
    
    const payload = {
      ...values,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };
    // @ts-ignore
    delete payload.date;
    // @ts-ignore
    delete payload.time;
    // @ts-ignore
    delete payload.duration;

    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Qabulni tahrirlash" : "Yangi qabul yaratish"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
             <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filial <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                       <SelectTrigger>
                        <SelectValue placeholder="Filialni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Asosiy filial</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bemor <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={patients.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName} (${p.phone})` }))}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Bemorni tanlang"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => {
                const selectedDoctor = doctors.find(d => d.id === field.value);
                const workingDays = selectedDoctor?.schedule?.filter(s => s.isWorking) || [];
                
                return (
                  <FormItem>
                    <FormLabel>Shifokor <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={doctors.map(d => ({ value: d.id, label: `${d.name || ''} (${d.specialty})` }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Shifokorni tanlang"
                      />
                    </FormControl>
                    {selectedDoctor && workingDays.length > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 rounded-md border border-border">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Ish jadvali:</p>
                        <div className="flex flex-wrap gap-1">
                          {['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'].map((label, idx) => {
                            const isWorking = selectedDoctor.schedule?.some(s => s.day === idx && s.isWorking);
                            return (
                              <span 
                                key={label} 
                                className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded-sm border",
                                  isWorking 
                                    ? "bg-primary/10 border-primary/20 text-primary font-medium" 
                                    : "bg-muted border-border text-muted-foreground/50 line-through"
                                )}
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xizmat (ixtiyoriy)</FormLabel>
                  <FormControl>
                    <SearchableSelect
                      options={services.map(s => ({ value: s.id, label: `${s.name} (${s.price} so'm)` }))}
                      value={field.value || ''}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const service = services.find(s => s.id === val);
                        if (service) form.setValue('duration', service.duration);
                      }}
                      placeholder="Xizmatni tanlang"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sana <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaqt <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Davomiyligi (daqiqa)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manba</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOOKING_SOURCES.map((s) => (
                        <SelectItem key={s} value={s}>{BOOKING_SOURCE_LABELS[s] || s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Holat</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOOKING_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {BOOKING_STATUS_LABELS[s as BookingStatus]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Izoh</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Qabul bo‘yicha izoh..." rows={3} className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {editing ? "Yangilash" : "Yaratish"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface BookingDetailsProps {
  booking: Booking | null;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
}

export const BookingDetails = ({ booking, onClose, patients, doctors }: BookingDetailsProps) => {
  if (!booking) return null;

  const patient = patients.find((p) => p.id === booking.patientId);
  const doctor = doctors.find((d) => d.id === booking.doctorId);

  return (
    <Dialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Qabul tafsilotlari</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bemor</span>
            <span className="font-medium">{patient?.firstName} {patient?.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shifokor</span>
            <span className="font-medium">{doctor?.name || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vaqt</span>
            <span>{new Date(booking.startTime).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Manba</span>
            <SourceBadge source={booking.source} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Holat</span>
            <StatusBadge status={booking.status} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
