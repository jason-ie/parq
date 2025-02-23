import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Checks if a parking spot is available for a given date and time slot
 */
export const checkSpotAvailability = async (
  spotId,
  date,
  startTime,
  duration
) => {
  try {
    // Get the spot details
    const spotDoc = await getDoc(doc(db, 'spots', spotId));
    if (!spotDoc.exists()) {
      return { isAvailable: false, error: 'Spot not found' };
    }

    const spot = spotDoc.data();
    const requestDate = new Date(date);
    const dayName = requestDate.toLocaleDateString('en-US', {
      weekday: 'long',
    });

    // Check if this day is allowed
    if (
      !spot.availability.days.includes(dayName) &&
      !spot.availability.days.includes('Everyday')
    ) {
      return {
        isAvailable: false,
        error: `Spot is not available on ${dayName}s`,
      };
    }

    // Check if within valid dates
    const validFrom = new Date(spot.availability.validFrom);
    const validUntil = new Date(spot.availability.validUntil);
    if (requestDate < validFrom || requestDate > validUntil) {
      return {
        isAvailable: false,
        error: 'Date is outside the valid booking period',
      };
    }

    // Check if time is within operating hours
    const [requestHour] = startTime.split(':').map(Number);
    const [spotStart] = spot.availability.start.split(':').map(Number);
    const [spotEnd] = spot.availability.end.split(':').map(Number);

    if (requestHour < spotStart || requestHour + duration > spotEnd) {
      return {
        isAvailable: false,
        error: 'Time is outside operating hours',
      };
    }

    // Check for existing bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('spotId', '==', spotId),
      where('date', '==', date),
      where('status', '==', 'confirmed')
    );

    const bookings = await getDocs(bookingsQuery);

    for (const doc of bookings.docs) {
      const booking = doc.data();
      const [bookingStart] = booking.startTime.split(':').map(Number);
      const [bookingEnd] = booking.endTime.split(':').map(Number);

      // Check for overlap
      if (
        !(requestHour + duration <= bookingStart || requestHour >= bookingEnd)
      ) {
        return {
          isAvailable: false,
          error: 'Time slot already booked',
        };
      }
    }

    return { isAvailable: true };
  } catch (error) {
    console.error('Error checking availability:', error);
    return {
      isAvailable: false,
      error: 'Failed to check availability',
    };
  }
};

/**
 * Gets all available time slots for a spot on a specific date
 */
export const getAvailableTimeSlots = async (spotId, date) => {
  try {
    // Get spot details
    const spotDoc = await getDoc(doc(db, 'spots', spotId));
    if (!spotDoc.exists()) {
      throw new Error('Spot not found');
    }

    const spot = spotDoc.data();
    const [startHour] = spot.availability.start.split(':').map(Number);
    const [endHour] = spot.availability.end.split(':').map(Number);

    // Get existing bookings
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('spotId', '==', spotId),
      where('date', '==', date),
      where('status', '==', 'confirmed')
    );

    const bookings = await getDocs(bookingsQuery);
    const bookedHours = new Set();

    // Mark booked hours
    bookings.forEach((doc) => {
      const booking = doc.data();
      const [start] = booking.startTime.split(':').map(Number);
      const [end] = booking.endTime.split(':').map(Number);

      for (let hour = start; hour < end; hour++) {
        bookedHours.add(hour);
      }
    });

    // Generate available slots
    const availableSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      if (!bookedHours.has(hour)) {
        availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }

    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

/**
 * Updates spot availability after a booking is confirmed
 */
export const updateSpotAvailability = async (spotId, bookingDetails) => {
  try {
    const { date, startTime, endTime } = bookingDetails;

    // Get the hours that need to be blocked
    const [start] = startTime.split(':').map(Number);
    const [end] = endTime.split(':').map(Number);

    // Create/update the availability document
    const availabilityRef = doc(db, 'spotAvailability', `${spotId}_${date}`);
    const availabilityDoc = await getDoc(availabilityRef);

    const timeSlots = {};
    for (let hour = start; hour < end; hour++) {
      timeSlots[`${hour.toString().padStart(2, '0')}:00`] = {
        isAvailable: false,
        bookingId: bookingDetails.id,
      };
    }

    if (!availabilityDoc.exists()) {
      await setDoc(availabilityRef, {
        spotId,
        date,
        timeSlots,
      });
    } else {
      await updateDoc(availabilityRef, { timeSlots });
    }
  } catch (error) {
    console.error('Error updating spot availability:', error);
    throw error;
  }
};
