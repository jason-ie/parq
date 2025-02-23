import { useState, useEffect } from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';
import {
  checkSpotAvailability,
  getAvailableTimeSlots,
  updateSpotAvailability,
} from '../../utils/spotAvailability';

const BookingModal = ({ spot, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [error, setError] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    // Generate array of available dates between validFrom and validUntil
    const generateAvailableDates = () => {
      const dates = [];
      const start = new Date(spot.availability.validFrom);
      const end = new Date(spot.availability.validUntil);
      const current = new Date(start);

      while (current <= end) {
        const dayName = current.toLocaleDateString('en-US', {
          weekday: 'long',
        });
        if (spot.availability.days.includes(dayName)) {
          dates.push(new Date(current).toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    setAvailableDates(generateAvailableDates());
  }, [spot.availability]);

  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    const dateObj = new Date(selectedDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    // Clear existing selections first
    setStartTime('');
    setDuration(1);
    setAvailableTimeSlots([]);
    setError('');

    // Check if the selected date is in the available dates array
    if (availableDates.includes(selectedDate)) {
      setDate(selectedDate);

      // Fetch available time slots
      setLoadingTimeSlots(true);
      try {
        const timeSlots = await getAvailableTimeSlots(spot.id, selectedDate);
        setAvailableTimeSlots(timeSlots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Failed to load available time slots');
      } finally {
        setLoadingTimeSlots(false);
      }
    } else {
      setDate('');
      if (!spot.availability.days.includes(dayName)) {
        setError(`Bookings not available on ${dayName}s`);
      } else {
        setError('This date is not available for booking');
      }
    }
  };

  const calculateEndTime = (start, durationHours) => {
    if (!start) return '';
    const [hours, minutes] = start.split(':');
    const endDate = new Date();
    endDate.setHours(parseInt(hours) + durationHours);
    endDate.setMinutes(parseInt(minutes));
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to book a spot');
      return;
    }

    if (!availableDates.includes(date)) {
      setError('Selected date is not available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Final availability check before booking
      const { isAvailable, error: availabilityError } =
        await checkSpotAvailability(spot.id, date, startTime, duration);

      if (!isAvailable) {
        setError(availabilityError || 'This time slot is no longer available');
        setLoading(false);
        return;
      }

      const endTime = calculateEndTime(startTime, duration);
      const booking = {
        spotId: spot.id,
        userId: user.uid,
        location: spot.location,
        date,
        startTime,
        endTime,
        duration,
        totalPrice: (spot.price * duration).toFixed(2),
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), booking);
      booking.id = docRef.id;

      // Update spot availability
      await updateSpotAvailability(spot.id, booking);

      onSuccess(booking);
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to create booking. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Book Parking Spot</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium">{spot.location.address}</h3>
          <p className="text-gray-600">{spot.type} Parking</p>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Available: {spot.availability.start} - {spot.availability.end}
            </p>
            <p className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Available on: {spot.availability.days.join(', ')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                min={spot.availability.validFrom}
                max={spot.availability.validUntil}
                className={`w-full rounded-md border p-2 ${
                  error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {date && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                  disabled={loadingTimeSlots}
                >
                  <option value="">
                    {loadingTimeSlots
                      ? 'Loading available times...'
                      : 'Select a time'}
                  </option>
                  {!loadingTimeSlots &&
                    availableTimeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {parseInt(slot) % 12 || 12}:00{' '}
                        {parseInt(slot) < 12 ? 'AM' : 'PM'}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 p-2"
                  disabled={!startTime}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
                    <option key={hours} value={hours}>
                      {hours} hour{hours > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total Price</span>
              <span className="font-semibold text-lg">
                ${(spot.price * duration).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !date || !startTime}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

BookingModal.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    location: PropTypes.shape({
      address: PropTypes.string.isRequired,
    }).isRequired,
    type: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    availability: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      days: PropTypes.arrayOf(PropTypes.string).isRequired,
      validFrom: PropTypes.string,
      validUntil: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default BookingModal;
