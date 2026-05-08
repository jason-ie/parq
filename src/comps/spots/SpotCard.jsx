import { useState } from "react";
import { Heart, MapPin, Clock } from "lucide-react";
import PropTypes from "prop-types";

const SpotCard = ({ spot, onSelect }) => {
	const [isFavorite, setIsFavorite] = useState(false);

	return (
		<div
			className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
			onClick={() => onSelect(spot)}
		>
			{/* Map Preview */}
			<div className="relative h-44 overflow-hidden bg-gray-100">
				<img
					src={`https://maps.googleapis.com/maps/api/staticmap?center=${spot.location.coordinates.lat},${spot.location.coordinates.lng}&zoom=15&size=400x200&markers=color:0x111827%7C${spot.location.coordinates.lat},${spot.location.coordinates.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
					alt={`Map of ${spot.location.address}`}
					className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
				/>

				{/* Favorite */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						setIsFavorite(!isFavorite);
					}}
					className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors duration-150 cursor-pointer"
				>
					<Heart
						className={`w-4 h-4 transition-colors ${
							isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
						}`}
					/>
				</button>

				{/* Type badge */}
				<div className="absolute bottom-3 left-3">
					<span className="bg-white/90 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
						{spot.type}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="p-4">
				<h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
					{spot.location.address}
				</h3>
				<div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
					<MapPin className="w-3.5 h-3.5 flex-shrink-0" />
					<span className="truncate">{spot.location.city}, {spot.location.state}</span>
				</div>

				<div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
					<Clock className="w-3.5 h-3.5 flex-shrink-0" />
					<span>{spot.availability.start} – {spot.availability.end}</span>
				</div>

				<div className="flex items-center justify-between mt-4">
					<div>
						<span className="text-lg font-bold text-gray-900">${spot.price.toFixed(2)}</span>
						<span className="text-xs text-gray-400 ml-1">/hr</span>
					</div>

					<button
						onClick={(e) => {
							e.stopPropagation();
							onSelect(spot);
						}}
						className="bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
					>
						Book Now
					</button>
				</div>
			</div>
		</div>
	);
};

SpotCard.propTypes = {
	spot: PropTypes.shape({
		location: PropTypes.shape({
			address: PropTypes.string.isRequired,
			city: PropTypes.string.isRequired,
			state: PropTypes.string.isRequired,
			coordinates: PropTypes.shape({
				lat: PropTypes.number.isRequired,
				lng: PropTypes.number.isRequired,
			}).isRequired,
		}).isRequired,
		price: PropTypes.number.isRequired,
		type: PropTypes.string.isRequired,
		availability: PropTypes.shape({
			start: PropTypes.string.isRequired,
			end: PropTypes.string.isRequired,
		}).isRequired,
	}).isRequired,
	onSelect: PropTypes.func.isRequired,
};

export default SpotCard;
