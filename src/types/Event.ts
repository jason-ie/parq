import { Timestamp } from 'firebase/firestore';

export interface Event {
  id: string;
  name: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  dates: {
    start: Timestamp;
    end: Timestamp;
  };
  description?: string;
  category: string;
  expectedAttendance?: number;
}
