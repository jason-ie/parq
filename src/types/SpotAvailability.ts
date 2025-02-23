export interface SpotAvailability {
  spotId: string;
  date: string;
  timeSlots: {
    [hour: string]: {
      isAvailable: boolean;
      bookingId?: string;
    };
  };
}
