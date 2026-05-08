import { MOCK_SPOTS } from './mockSpots';

/**
 * Helper function to get a spot by ID from mock data
 * @param {string} spotId - The ID of the spot to find
 * @returns {Object|null} - The spot object or null if not found
 */
const getSpotById = (spotId) => {
  return MOCK_SPOTS.find((spot) => spot.id === spotId) || null;
};

/**
 * Gets all available dates for a spot
 * @param {string} spotId - Spot ID from mock data
 * @returns {Promise<Array>} - Array of available dates with details
 */
export const getAvailableDates = async (spotId) => {
  try {
    // Get the spot from mock data
    const spotData = getSpotById(spotId);

    if (!spotData) {
      throw new Error('Spot not found');
    }

    // Map each date to an object with details
    const availableDates = spotData.availability.availableDates.map(
      (dateStr) => ({
        date: dateStr,
        hours: {
          start: spotData.availability.start,
          end: spotData.availability.end,
        },
        price: spotData.price,
      })
    );

    return availableDates;
  } catch (error) {
    console.error('Error getting available dates:', error);
    throw error;
  }
};

/**
 * Gets all available time slots for a spot on a specific date
 * @param {string} spotId - Spot ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of available time slots
 */
export const getAvailableTimeSlots = async (spotId, date) => {
  try {
    // Get the spot from mock data
    const spotData = getSpotById(spotId);

    if (!spotData) {
      throw new Error('Spot not found');
    }

    // Check if the date is in the available dates array
    if (!spotData.availability.availableDates.includes(date)) {
      return [];
    }

    // Generate time slots based on start and end times
    const [startHour] = spotData.availability.start.split(':').map(Number);
    const [endHour] = spotData.availability.end.split(':').map(Number);

    const timeSlots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        price: spotData.price,
      });
    }

    return timeSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

/**
 * Checks if a parking spot is available for the specified date and time
 * @param {string} spotId - Spot ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} duration - Duration in hours
 * @returns {Promise<Object>} - Availability result
 */
export const checkSpotAvailability = async (
  spotId,
  date,
  startTime,
  duration
) => {
  try {
    // Get the spot from mock data
    const spotData = getSpotById(spotId);

    if (!spotData) {
      return { isAvailable: false, error: 'Spot not found' };
    }

    // Check if the date is in available dates
    if (!spotData.availability.availableDates.includes(date)) {
      return {
        isAvailable: false,
        error: 'This date is not available for booking',
      };
    }

    // Check if time is within available hours
    const [requestHour] = startTime.split(':').map(Number);
    const [availStart] = spotData.availability.start.split(':').map(Number);
    const [availEnd] = spotData.availability.end.split(':').map(Number);

    if (requestHour < availStart || requestHour + duration > availEnd) {
      return {
        isAvailable: false,
        error: `Time is outside available hours (${spotData.availability.start}-${spotData.availability.end})`,
      };
    }

    // For mock data, assume it's available if it passes all checks
    return {
      isAvailable: true,
      price: spotData.price,
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    return {
      isAvailable: false,
      error: 'Failed to check availability',
    };
  }
};

/**
 * Update spot availability after a booking is confirmed
 * (Mock implementation - doesn't actually do anything)
 * @param {string} spotId - Spot ID
 * @param {Object} bookingDetails - Booking details object
 * @returns {Promise<void>}
 */
export const updateSpotAvailability = async (spotId, bookingDetails) => {
  // In a real app, this would update the database
  // For the mock version, we'll just log the booking
  console.log(`Mock booking created for spot ${spotId}:`, bookingDetails);
  return;
};
