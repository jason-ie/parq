import { useState } from "react";
import { MapPin } from "lucide-react";
import SpotCard from "./spots/SpotCard";
import NavTabs from "./NavTabs";
import SearchBar from "./spots/SearchBar";
import MapView from "./MapView";
import { MOCK_SPOTS, calculateDistance } from "../utils/mockSpots";
import BookingModal from "./spots/BookingModal";
import BookingSuccessModal from "./spots/BookingSuccessModal";
import { useAuth } from "../contexts/AuthContext";

const getGreeting = () => {
	const h = new Date().getHours();
	if (h < 12) return "Good morning";
	if (h < 17) return "Good afternoon";
	return "Good evening";
};

export default function RenterDashboard() {
	const [showMap, setShowMap] = useState(false);
	const [visibleSpots, setVisibleSpots] = useState(MOCK_SPOTS);
	const [selectedSpot, setSelectedSpot] = useState(null);
	const [showBookingModal, setShowBookingModal] = useState(false);
	const [mapCenter, setMapCenter] = useState(null);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [confirmedBooking, setConfirmedBooking] = useState(null);

	const { userData } = useAuth();
	const firstName = userData?.name?.split(" ")[0] || "there";

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
		let filtered = MOCK_SPOTS;

		if (place) {
			setMapCenter(place.coordinates);
			filtered = filtered.filter((spot) => {
				const dist = calculateDistance(
					place.coordinates.lat, place.coordinates.lng,
					spot.location.coordinates.lat, spot.location.coordinates.lng
				);
				return (
					dist <= filters.radius &&
					spot.price <= filters.maxPrice &&
					(filters.parkingType === "all" || spot.type === filters.parkingType)
				);
			});
		} else {
			setMapCenter(null);
			filtered = filtered.filter(
				(s) =>
					s.price <= filters.maxPrice &&
					(filters.parkingType === "all" || s.type === filters.parkingType)
			);
		}

		setVisibleSpots(filtered);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<NavTabs />

			{/* Hero search section */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
					<p className="text-sm text-gray-400 font-medium mb-1 tracking-wide uppercase">
						{getGreeting()}, {firstName}
					</p>
					<h1 className="text-2xl font-bold text-gray-900 mb-5">
						Find parking near you
					</h1>
					<SearchBar onSearch={handleSearch} />
				</div>
			</div>

			{/* Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
				{!showMap ? (
					visibleSpots.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
							{visibleSpots.map((spot) => (
								<SpotCard key={spot.id} spot={spot} onSelect={handleSpotSelect} />
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-24 text-center">
							<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<MapPin className="h-5 w-5 text-gray-400" />
							</div>
							<p className="text-sm font-semibold text-gray-900 mb-1">No spots found</p>
							<p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
						</div>
					)
				) : (
					<div className="h-[calc(100vh-220px)] rounded-xl overflow-hidden bg-gray-100">
						<MapView spots={visibleSpots} onBookNow={handleBookNow} center={mapCenter} />
					</div>
				)}
			</main>

			{/* Map / List toggle */}
			<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
				<button
					onClick={() => setShowMap(!showMap)}
					className="bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2 text-sm font-semibold cursor-pointer"
				>
					<MapPin className="h-4 w-4" />
					{showMap ? "Show list" : "Show map"}
				</button>
			</div>

			{showBookingModal && selectedSpot && (
				<BookingModal
					spot={selectedSpot}
					onClose={() => { setShowBookingModal(false); setSelectedSpot(null); }}
					onSuccess={handleBookingSuccess}
				/>
			)}

			{showSuccessModal && confirmedBooking && (
				<BookingSuccessModal
					booking={confirmedBooking}
					onClose={() => { setShowSuccessModal(false); setConfirmedBooking(null); }}
				/>
			)}
		</div>
	);
}
