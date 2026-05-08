import { useState, useEffect } from 'react';
import { X, Clock, Calendar, DollarSign } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';
// Import the updated utilities
import {
  checkSpotAvailability,
  getAvailableDates,
  getAvailableTimeSlots,
} from '../../utils/spotAvailability';

// Calendar component to show available dates
const DatePicker = ({
  availableDates,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Default to the month containing the first available date or current month
    if (availableDates && availableDates.length > 0) {
      return new Date(availableDates[0].date);
    }
    return new Date();
  });

  // Convert availableDates array to a Set for faster lookups
  const availableDatesSet = new Set(availableDates.map((d) => d.date));

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const renderCalendar = () => {
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const daysInMonth = lastDayOfMonth.getDate();

    // Day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Create array of day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Create array of days
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dateStr = date.toISOString().split('T')[0];

      const isAvailable = availableDatesSet.has(dateStr);
      const isSelected = dateStr === selectedDate;
      const isInRange =
        (!minDate || dateStr >= minDate) && (!maxDate || dateStr <= maxDate);

      days.push({
        date: dateStr,
        day,
        isAvailable: isAvailable && isInRange,
        isSelected,
      });
    }

    // Group days into weeks
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="mt-2 w-full">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-gray-600 hover:text-gray-900"
            type="button"
          >
            &lt;
          </button>
          <div className="font-medium">
            {currentMonth.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1 text-gray-600 hover:text-gray-900"
            type="button"
          >
            &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map((name) => (
            <div
              key={name}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {name}
            </div>
          ))}

          {/* Calendar days */}
          {weeks.flat().map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="p-1"></div>;
            }

            return (
              <button
                key={day.date}
                onClick={() => day.isAvailable && onDateSelect(day.date)}
                className={`
                  h-8 w-8 rounded-full text-sm flex items-center justify-center
                  ${day.isSelected ? 'bg-blue-600 text-white' : ''}
                  ${
                    !day.isAvailable
                      ? 'text-gray-300 cursor-default'
                      : day.isSelected
                      ? ''
                      : 'hover:bg-blue-100 text-gray-700'
                  }
                `}
                disabled={!day.isAvailable}
                type="button"
              >
                {day.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return <div className="border rounded-md p-3">{renderCalendar()}</div>;
};

const BookingModal = ({ spot, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [error, setError] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableEndTimes, setAvailableEndTimes] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Load available dates when modal opens
  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoadingDates(true);
        const dates = await getAvailableDates(spot.id);
        setAvailableDates(dates);
      } catch (error) {
        console.error('Error fetching available dates:', error);
        setError('Failed to load available dates');
      } finally {
        setLoadingDates(false);
      }
    };

    fetchAvailableDates();
  }, [spot.id]);

  // Calculate total price whenever startTime or endTime changes
  useEffect(() => {
    if (startTime && endTime) {
      // Calculate hours between start and end time
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      if (endHour > startHour) {
        const hours = endHour - startHour;
        setTotalPrice((spot.price * hours).toFixed(2));
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [startTime, endTime, spot.price]);

  const handleDateSelect = async (selectedDate) => {
    // Clear existing selections
    setStartTime('');
    setEndTime('');
    setAvailableTimeSlots([]);
    setAvailableEndTimes([]);
    setError('');
    setDate(selectedDate);

    // Fetch available time slots for the selected date
    setLoadingTimeSlots(true);
    try {
      const timeSlots = await getAvailableTimeSlots(spot.id, selectedDate);
      setAvailableTimeSlots(timeSlots);

      if (timeSlots.length === 0) {
        setError('No available time slots for this date');
      }
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to load available time slots');
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleStartTimeChange = (e) => {
    const time = e.target.value;
    setStartTime(time);
    setEndTime('');

    if (time) {
      // Generate available end times based on the start time
      const selectedHour = parseInt(time.split(':')[0]);
      const maxHour = parseInt(spot.availability.end.split(':')[0]);

      // End time must be at least 1 hour after start time
      const endTimes = [];
      for (let hour = selectedHour + 1; hour <= maxHour; hour++) {
        endTimes.push(`${hour.toString().padStart(2, '0')}:00`);
      }

      setAvailableEndTimes(endTimes);
    } else {
      setAvailableEndTimes([]);
    }
  };

  const formatTimeDisplay = (time) => {
    if (!time) return '';
    const hour = parseInt(time.split(':')[0]);
    return `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to book a spot');
      return;
    }

    if (!date || !startTime || !endTime) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Calculate duration in hours
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      const duration = endHour - startHour;

      // Check availability
      const { isAvailable, error: availabilityError } =
        await checkSpotAvailability(spot.id, date, startTime, duration);

      if (!isAvailable) {
        setError(availabilityError || 'This time slot is no longer available');
        setLoading(false);
        return;
      }

      const booking = {
        spotId: spot.id,
        userId: user.uid,
        location: spot.location,
        date,
        startTime,
        endTime,
        duration,
        totalPrice: totalPrice,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };

      // For mock data, we'll skip the actual Firestore operation
      // and just simulate a successful booking
      // In a real app, we would add to Firestore:
      // const docRef = await addDoc(collection(db, 'bookings'), booking);
      // booking.id = docRef.id;

      // For demo, just add a fake ID
      booking.id = `mock-booking-${Date.now()}`;

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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium">{spot.location.address}</h3>
          <p className="text-gray-600">{spot.type} Parking</p>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Base price: ${spot.price}/hour
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>

            {loadingDates ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <>
                {availableDates.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No available dates</p>
                  </div>
                ) : (
                  <>
                    <DatePicker
                      availableDates={availableDates}
                      selectedDate={date}
                      onDateSelect={handleDateSelect}
                      minDate={spot.availability.validFrom}
                      maxDate={spot.availability.validUntil}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {availableDates.length} dates available between{' '}
                      {spot.availability.validFrom} and{' '}
                      {spot.availability.validUntil}
                    </p>
                  </>
                )}
              </>
            )}

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          {date && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <select
                  value={startTime}
                  onChange={handleStartTimeChange}
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
                      <option key={slot.time} value={slot.time}>
                        {formatTimeDisplay(slot.time)}
                      </option>
                    ))}
                </select>
                {availableTimeSlots.length === 0 &&
                  !loadingTimeSlots &&
                  !error && (
                    <p className="text-xs text-amber-500 mt-1">
                      No available time slots for this date
                    </p>
                  )}
              </div>

              {startTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                    required
                  >
                    <option value="">Select end time</option>
                    {availableEndTimes.map((time) => (
                      <option key={time} value={time}>
                        {formatTimeDisplay(time)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total Price</span>
              <span className="font-semibold text-lg">${totalPrice}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !date || !startTime || !endTime}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

DatePicker.propTypes = {
  availableDates: PropTypes.array.isRequired,
  selectedDate: PropTypes.string,
  onDateSelect: PropTypes.func.isRequired,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
};

BookingModal.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    location: PropTypes.shape({
      address: PropTypes.string.isRequired,
    }).isRequired,
    type: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    availability: PropTypes.object.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default BookingModal;
