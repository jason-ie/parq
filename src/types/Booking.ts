import { Timestamp } from 'firebase/firestore';

export interface Booking {
  id: string;
  spotId: string;
  renterId: string;
  ownerId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  date: Timestamp;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;

  eventId?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  cancelledAt?: Timestamp;
}
