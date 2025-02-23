import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'renter';
  createdAt: Timestamp;
  photoUrl?: string;
  phone?: string;
}
