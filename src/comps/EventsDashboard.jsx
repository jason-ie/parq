import React, { useState } from 'react';
import {
  FaCity,
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const EventsDashboard = () => {
  const [city, setCity] = useState(''); // State for user input for city
  const [events, setEvents] = useState([]); // State to store fetched events
  const [loading, setLoading] = useState(false); // State to track loading
  const [error, setError] = useState(null); // State to store error messages
  const navigate = useNavigate();

  // Function to build the API URL with query parameters
  const handleClick = () => {
    navigate('/dashboard');
  };

  const buildUrl = () => {
    const apiKey = 'f5XcCiYokCCs3tC8VYf4qm9SkjkA4gQ8';
    const baseUrl = `https://app.ticketmaster.com/discovery/v2/events.json`;
    const url = `${baseUrl}?apikey=${apiKey}&size=10&city=${encodeURIComponent(
      city
    )}`;
    return url;
  };

  // Function to fetch events from the API
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    setEvents([]);

    try {
      const url = buildUrl(); // Get the full URL with the city parameter
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data._embedded || !data._embedded.events.length) {
        // Handle the case where no events are found
        setError('No current events in your city :(');
        return;
      }
      setEvents(data._embedded ? data._embedded.events : []);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-purple-50 text-purple-900 min-h-screen">
      {/* Header Section */}
      <header className="bg-purple-300 text-white w-full py-4 shadow-md flex justify-center">
        <h1 className="text-3xl font-bold bg-purple-200 text-purple-800 rounded-full px-6 py-2 shadow-md">
          Search Events by City
        </h1>
        <div className="w-50 flex flex-col items-right">
          <button
            className="absolute top-5 right-4 bg-purple-500 text-purple-950 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:bg-purple-400 transition duration-300 ease-in-out"
            onClick={handleClick}
          >
            back
          </button>
        </div>
      </header>

      {/* Search Box Section */}
      <div className="flex flex-col items-center bg-white shadow-lg rounded-lg p-6 w-80 mt-8">
        <label className="flex items-center space-x-2 mb-4 text-purple-700">
          <FaCity className="text-2xl" />
          <span className="text-lg font-semibold">City:</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            className="border border-purple-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </label>
        <button
          onClick={fetchEvents}
          className="flex items-center justify-center bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
        >
          <FaSearch className="mr-2" />
          Search
        </button>
      </div>

      {/* Loading and Error Messages */}
      {loading && (
        <p className="mt-6 text-lg font-semibold text-purple-600">
          Loading events...
        </p>
      )}
      {error && (
        <p className="mt-6 text-lg font-semibold text-red-500">
          No current events in your city :(
        </p>
      )}

      {/* Events List */}
      <ul className="w-full max-w-2xl mt-8 space-y-6">
        {events.map((event, index) => {
          const backgroundColor =
            index % 2 === 0 ? 'bg-purple-100' : 'bg-purple-200';
          const borderColor =
            index % 2 === 0 ? 'border-purple-300' : 'border-purple-400';

          return (
            <li
              key={event.id}
              className={`rounded-lg shadow-md p-6 border ${backgroundColor} ${borderColor} flex flex-col items-start space-y-2`}
            >
              <h2 className="text-2xl font-bold text-purple-800">
                {event.name}
              </h2>
              <div className="flex items-center text-purple-700">
                <FaCalendarAlt className="mr-2" />
                <p className="text-lg">{event.dates.start.localDate}</p>
              </div>
              <div className="flex items-center text-purple-700">
                <FaMapMarkerAlt className="mr-2" />
                <p className="text-lg">{event._embedded.venues[0].name}</p>
              </div>
              <div className="flex items-center text-purple-700">
                <FaMapMarkerAlt className="mr-2" />
                <p className="text-lg">
                  {event._embedded.venues[0].city.name},{' '}
                  {event._embedded.venues[0].country.name}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default EventsDashboard;
