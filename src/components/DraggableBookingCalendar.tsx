import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { bookingsApi, patientsApi, doctorsApi } from '@/lib/api/endpoints';
import { queryKeys } from '@/lib/api/query-keys';
import { StatusBadge, SourceBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, GripVertical } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Booking } from '@/shared/types';
import { toast } from 'sonner';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';

const WEEKDAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];
const MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function formatDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Draggable booking chip ───────────────────────────────────────────────────
function DraggableBookingChip({
  booking,
  patientName,
  onClick,
  isOverlay = false,
}: {
  booking: Booking;
  patientName: string;
  onClick: () => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: booking.id,
    data: { booking },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={cn(
        'flex items-center gap-0.5 w-full text-left text-[10px] md:text-xs px-1 py-0.5 rounded truncate transition-all group/chip',
        booking.status === 'confirmed' && 'bg-primary/15 text-primary',
        booking.status === 'pending' && 'bg-warning/15 text-warning',
        booking.status === 'completed' && 'bg-success/15 text-success',
        booking.status === 'cancelled' && 'bg-destructive/15 text-destructive',
        booking.status === 'arrived' && 'bg-info/15 text-info',
        booking.status === 'no-show' && 'bg-muted text-muted-foreground',
        isDragging && !isOverlay && 'opacity-30',
        isOverlay && 'opacity-90 shadow-lg cursor-grabbing',
        !isOverlay && 'cursor-grab',
      )}
    >
      {/* drag handle */}
      <span
        {...listeners}
        className="opacity-0 group-hover/chip:opacity-60 cursor-grab shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-2.5 h-2.5" />
      </span>
      <button onClick={onClick} className="truncate flex-1 text-left">
        <span className="hidden md:inline">{booking.time} </span>
        {patientName}
      </button>
    </div>
  );
}

// ─── Droppable day cell ───────────────────────────────────────────────────────
function DroppableDayCell({
  dateStr,
  date,
  isCurrentMonth,
  isToday,
  dayBookings,
  patients,
  onBookingClick,
}: {
  dateStr: string;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayBookings: Booking[];
  patients: { id: string; firstName: string; lastName: string }[];
  onBookingClick: (b: Booking) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[80px] md:min-h-[100px] border-b border-r border-border p-1 transition-colors',
        !isCurrentMonth && 'bg-muted/30',
        isToday && 'bg-accent/20',
        isOver && 'bg-primary/10 ring-1 ring-inset ring-primary/40',
      )}
    >
      <div
        className={cn(
          'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
          isToday && 'bg-primary text-primary-foreground',
          !isCurrentMonth && 'text-muted-foreground/50',
        )}
      >
        {date.getDate()}
      </div>
      <div className="space-y-0.5">
        {dayBookings.slice(0, 3).map((b) => {
          const p = patients.find((pt) => pt.id === b.patientId);
          return (
            <DraggableBookingChip
              key={b.id}
              booking={b}
              patientName={p?.firstName ?? '?'}
              onClick={() => onBookingClick(b)}
            />
          );
        })}
        {dayBookings.length > 3 && (
          <p className="text-[10px] text-muted-foreground px-1">+{dayBookings.length - 3} ta</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DraggableBookingCalendar() {
  const authed = useStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  const { data: bookingsRes } = useQuery({
    queryKey: queryKeys.bookings,
    queryFn: () => bookingsApi.list({ limit: 1000 }),
    enabled: authed,
  });
  const bookings = bookingsRes?.data ?? [];

  const { data: patientsRes } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.list({ limit: 2000 }),
    enabled: authed,
  });
  const patients = patientsRes?.data ?? [];

  const { data: doctorsRes } = useQuery({
    queryKey: queryKeys.doctors,
    queryFn: () => doctorsApi.list({ limit: 200 }),
    enabled: authed,
  });
  const doctors = doctorsRes?.data ?? [];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings]);

  const today = formatDateStr(new Date());

  // DnD sensors — pointer with 8px activation distance to avoid accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Optimistic update mutation
  const updateBookingMut = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      bookingsApi.update(id, { date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      toast.success('Qabul sanasi yangilandi');
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      toast.error("Xatolik yuz berdi, qabul sanasi o'zgartirilmadi");
    },
  });

  function handleDragStart(event: DragStartEvent) {
    const booking = event.active.data.current?.booking as Booking;
    setActiveBooking(booking ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveBooking(null);
    const { active, over } = event;
    if (!over) return;

    const booking = active.data.current?.booking as Booking;
    const newDate = over.id as string;

    if (!booking || booking.date === newDate) return;

    // Optimistic UI update — invalidate query after success/error
    updateBookingMut.mutate({ id: booking.id, date: newDate });
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-sm font-semibold min-w-[140px] text-center">
              {MONTHS[month]} {year}
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground hidden sm:block">
              Qabullarni boshqa kunga surgab o'tkazing
            </p>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs">
              Bugun
            </Button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dateStr = formatDateStr(day.date);
            const dayBookings = bookingsByDate[dateStr] || [];
            return (
              <DroppableDayCell
                key={i}
                dateStr={dateStr}
                date={day.date}
                isCurrentMonth={day.isCurrentMonth}
                isToday={dateStr === today}
                dayBookings={dayBookings}
                patients={patients}
                onBookingClick={setSelectedBooking}
              />
            );
          })}
        </div>
      </div>

      {/* Drag overlay (ghost that follows cursor) */}
      <DragOverlay dropAnimation={null}>
        {activeBooking && (() => {
          const p = patients.find((pt) => pt.id === activeBooking.patientId);
          return (
            <DraggableBookingChip
              booking={activeBooking}
              patientName={p?.firstName ?? '?'}
              onClick={() => {}}
              isOverlay
            />
          );
        })()}
      </DragOverlay>

      {/* Booking detail modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Qabul tafsilotlari</DialogTitle></DialogHeader>
          {selectedBooking && (() => {
            const patient = patients.find((p) => p.id === selectedBooking.patientId);
            const doctor = doctors.find((d) => d.id === selectedBooking.doctorId);
            return (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bemor</span>
                  <span className="font-medium">{patient?.firstName} {patient?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shifokor</span>
                  <span className="font-medium">
                    {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Vaqt</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedBooking.date} — {selectedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Manba</span>
                  <SourceBadge source={selectedBooking.source} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Holat</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                {selectedBooking.notes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Izoh</span>
                    <span className="text-right max-w-[200px]">{selectedBooking.notes}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
