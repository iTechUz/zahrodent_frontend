import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

let socket: Socket | null = null;

export const useSocket = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    if (!socket) {
      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      socket = io(socketUrl, {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        // WebSocket ulandi
      });

      socket.on('disconnect', () => {
        // WebSocket uzildi
      });
    }

    const handleNewLead = (lead: any) => {
      // Leads listini yangilash
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast.info(`Yangi murojaat: ${lead.name}`, {
        description: lead.phone,
        action: {
          label: "Ko'rish",
          onClick: () => { /* navigate to lead */ }
        }
      });
    };

    socket.on('newLead', handleNewLead);

    return () => {
      socket?.off('newLead', handleNewLead);
    };
  }, [queryClient]);

  return socket;
};
