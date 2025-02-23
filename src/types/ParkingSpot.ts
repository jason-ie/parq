import { Timestamp } from 'firebase/firestore';

export interface ParkingSpot {
  id: string;
  ownerId: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  type: 'Driveway' | 'Garage' | 'Street';
  price: number;
  description?: string;
  photos?: string[];
  status: 'active' | 'inactive';
  createdAt: Timestamp;

  availability: {
    days: string[];
    start: string;
    end: string;
  };

  eventAvailability?: Array<{
    eventId: string;
    price: number;
    dates: {
      start: Timestamp;
      end: Timestamp;
    };
  }>;
}
