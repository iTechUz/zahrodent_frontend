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
      socket = io(socketUrl);

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
    }

    const handleNewLead = (lead: any) => {
      console.log('New lead received via WebSocket:', lead);
      // Invalidate leads query to refetch data
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      // Optional: show a notification
      toast.info(`Yangi murojaat: ${lead.name}`, {
        description: lead.phone,
        action: {
          label: "Ko'rish",
          onClick: () => console.log("View lead", lead.id)
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
