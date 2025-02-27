import { useState } from "react";
import { MapPin } from "lucide-react";
import SpotCard from "./spots/SpotCard";
import NavTabs from "./NavTabs";
import SearchBar from "./spots/SearchBar";
import MapView from "./MapView";
import { MOCK_SPOTS, calculateDistance } from "../utils/mockSpots";
import BookingModal from "./spots/BookingModal";
import BookingSuccessModal from "./spots/BookingSuccessModal";

export default function RenterDashboard() {
	const [showMap, setShowMap] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [visibleSpots, setVisibleSpots] = useState(MOCK_SPOTS);
	const [selectedSpot, setSelectedSpot] = useState(null);
	const [showBookingModal, setShowBookingModal] = useState(false);
	const [mapCenter, setMapCenter] = useState(null);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [confirmedBooking, setConfirmedBooking] = useState(null);

	const handleBookingSuccess = (booking) => {
		setShowBookingModal(false);
		setConfirmedBooking(booking);
		setShowSuccessModal(true);
	};

	const handleSpotSelect = (spot) => {
		setSelectedSpot(spot);
		setShowBookingModal(true);
	};

	const handleBookNow = (spot) => {
		setSelectedSpot(spot);
		setShowBookingModal(true);
	};

	const handleSearch = ({ place, filters }) => {
		let filteredSpots = MOCK_SPOTS;

		if (place) {
			setMapCenter(place.coordinates);

			filteredSpots = filteredSpots.filter((spot) => {
				const distance = calculateDistance(
					place.coordinates.lat,
					place.coordinates.lng,
					spot.location.coordinates.lat,
					spot.location.coordinates.lng
				);

				const matchesDistance = distance <= filters.radius;
				const matchesPrice = spot.price <= filters.maxPrice;
				const matchesType =
					filters.parkingType === "all" || spot.type === filters.parkingType;

				return matchesDistance && matchesPrice && matchesType;
			});
		} else {
			setMapCenter(null);

			filteredSpots = filteredSpots.filter((spot) => {
				const matchesPrice = spot.price <= filters.maxPrice;
				const matchesType =
					filters.parkingType === "all" || spot.type === filters.parkingType;

				return matchesPrice && matchesType;
			});
		}

		setVisibleSpots(filteredSpots);
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<NavTabs />

			{/* Search Section */}
			<div className="bg-white py-4 sticky top-0 z-10 border-b">
				<SearchBar
					onSearch={handleSearch}
					onFilterToggle={() => setShowFilters(!showFilters)}
				/>
			</div>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 py-6">
				{!showMap ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{visibleSpots.map((spot) => (
							<SpotCard key={spot.id} spot={spot} onSelect={handleSpotSelect} />
						))}
					</div>
				) : (
					<div className="h-[calc(100vh-64px)] bg-gray-100 rounded-lg">
						{showMap && (
							<MapView
								spots={visibleSpots}
								onBookNow={handleBookNow}
								center={mapCenter}
							/>
						)}
					</div>
				)}
			</main>

			{/* Show Map Toggle Button */}
			<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
				<button
					onClick={() => setShowMap(!showMap)}
					className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center space-x-2"
				>
					<MapPin className="h-5 w-5" />
					<span>{showMap ? "Show list" : "Show map"}</span>
				</button>
			</div>

			{/* Booking Modal */}
			{showBookingModal && selectedSpot && (
				<BookingModal
					spot={selectedSpot}
					onClose={() => {
						setShowBookingModal(false);
						setSelectedSpot(null);
					}}
					onSuccess={handleBookingSuccess}
				/>
			)}

			{/* Success Modal */}
			{showSuccessModal && confirmedBooking && (
				<BookingSuccessModal
					booking={confirmedBooking}
					onClose={() => {
						setShowSuccessModal(false);
						setConfirmedBooking(null);
					}}
				/>
			)}
		</div>
	);
}
